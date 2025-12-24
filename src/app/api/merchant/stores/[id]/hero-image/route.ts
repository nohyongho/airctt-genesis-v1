import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// POST - 대표 이미지 URL 저장 (업로드는 클라이언트에서 처리)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: '이미지 URL이 필요합니다.' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        const { data, error } = await client
            .from('stores')
            .update({ hero_image_url: url })
            .eq('id', id)
            .select('id, hero_image_url')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            store: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - 대표 이미지 삭제
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('stores')
            .update({ hero_image_url: null })
            .eq('id', id)
            .select('id, hero_image_url')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            store: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
