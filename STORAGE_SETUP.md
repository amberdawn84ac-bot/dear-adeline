# Supabase Storage Setup for Project Submissions

## Required Storage Bucket

The project approval and media upload system requires a Supabase Storage bucket for storing student-submitted photos and videos.

### Setup Instructions

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Click on "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket"
   - Bucket name: `project-submissions`
   - Public bucket: **Yes** (enable this so uploaded media can be viewed)
   - File size limit: 50MB (recommended)
   - Allowed MIME types: `image/*,video/*`

3. **Set Up Storage Policies (Optional)**

   For better security, you can add RLS policies:

   ```sql
   -- Allow authenticated users to upload their own files
   CREATE POLICY "Users can upload their own project media"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'project-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow public read access
   CREATE POLICY "Public can view project media"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'project-submissions');

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete their own project media"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'project-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

4. **Verify Setup**
   - Bucket should be visible in Storage section
   - Public access should be enabled
   - Policies should allow authenticated uploads

## Features Enabled

Once the storage bucket is set up, students will be able to:

- Upload photos and videos when completing projects
- Submit up to 5 media files per project
- View their uploaded media in the project completion modal
- Include media evidence in their portfolio

Admins will be able to:

- Review submitted media when approving projects
- See all project evidence before approval

## File Organization

Files are organized in the following structure:

```
project-submissions/
  └── project-media/
      └── {user_id}/
          └── {timestamp}-{random}.{ext}
```

This ensures:
- Files are organized by user
- No filename conflicts
- Easy cleanup if needed
- Traceable to the submitting user

## Troubleshooting

**Upload fails with 403 error:**
- Check that the bucket exists and is named `project-submissions`
- Verify bucket is set to public
- Check storage policies allow authenticated uploads

**Files not displaying:**
- Verify bucket has public read access enabled
- Check that the public URL is being generated correctly
- Ensure CORS is configured if needed

**Large file uploads fail:**
- Check bucket file size limit (default: 50MB)
- Increase limit if needed for video submissions
- Consider adding client-side file size validation
