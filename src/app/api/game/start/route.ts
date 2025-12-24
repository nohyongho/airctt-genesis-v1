
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { consumer_id, game_type } = body;

        if (!consumer_id || !game_type) {
            return NextResponse.json(
                { error: 'Missing defined parameters: consumer_id, game_type' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        // Start a new game session
        const { data, error } = await client
            .from('game_sessions')
            .insert({
                consumer_id,
                game_type,
                started_at: new Date().toISOString(),
            })
            .select('id, started_at')
            .single();

        if (error) {
            console.error('Error starting game:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            session_id: data.id,
            started_at: data.started_at,
        });

    } catch (error: any) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
