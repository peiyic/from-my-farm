import { NextResponse } from 'next/server';
import farmers from '../../../../data/farmers.json';

export async function GET(request: Request) {
    return NextResponse.json(farmers);
}
