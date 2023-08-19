import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: { username: string }}) {
    const username = context.params.username;
    return NextResponse.json({});
}