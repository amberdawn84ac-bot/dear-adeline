-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store long-term memories
create table if not exists memories (
    id uuid default gen_random_uuid() primary key,
    student_id uuid references auth.users(id),
    content text not null,
    embedding vector(768), -- Dimensions for Gemini text-embedding-004
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table memories enable row level security;

-- Policies
create policy "Users can insert their own memories"
    on memories for insert
    with check (auth.uid() = student_id);

create policy "Users can view their own memories"
    on memories for select
    using (auth.uid() = student_id);

-- Create a function to search similarly for RAG
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_student_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where memories.student_id = p_student_id
  and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
