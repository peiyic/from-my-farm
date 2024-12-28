import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }>}) {
    try {
        const username = (await params).username
        const result =
          await sql`
          SELECT farmer.username, farmer.name, farmer.address, farmer.coordinates, array_agg(ownership.product) AS products 
          FROM farmer 
          LEFT JOIN ownership ON farmer.username = ownership.farmer_username
          WHERE farmer.username = ${username}
          GROUP BY farmer.username
          `;
        return NextResponse.json({ data: result.rows }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
}
