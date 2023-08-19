import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const result =
          await sql`
          SELECT DISTINCT array_agg(product) as products
          FROM ownership
          `;
        return NextResponse.json({ data: result.rows }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
}