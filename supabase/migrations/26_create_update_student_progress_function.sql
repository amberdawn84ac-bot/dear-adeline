-- supabase/migrations/26_create_update_student_progress_function.sql

create or replace function update_student_progress(
    p_student_id uuid,
    p_requirement_id uuid,
    p_credits_to_add decimal
)
returns void as $$
begin
    insert into student_graduation_progress (student_id, requirement_id, credits_earned)
    values (p_student_id, p_requirement_id, p_credits_to_add)
    on conflict (student_id, requirement_id)
    do update set
        credits_earned = student_graduation_progress.credits_earned + p_credits_to_add;
end;
$$ language plpgsql;
