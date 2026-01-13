import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `project-media/${fileName}`;

            // Convert File to ArrayBuffer then to Buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('project-submissions')
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error(`Failed to upload ${file.name}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-submissions')
                .getPublicUrl(filePath);

            uploadedUrls.push(publicUrl);
        }

        return NextResponse.json({
            success: true,
            urls: uploadedUrls,
            count: uploadedUrls.length
        });

    } catch (error: any) {
        console.error('Media upload error:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
