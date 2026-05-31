import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const result = await sql`
      SELECT DISTINCT array_agg(product) as products
      FROM ownership
    `
    return NextResponse.json({ data: result.rows }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

async function getFarmerUsername(email: string): Promise<string | null> {
  const result = await sql`SELECT username FROM farmer WHERE email = ${email}`
  return result.rows[0]?.username ?? null
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { product } = await request.json()
    if (!product?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    const username = await getFarmerUsername(session.user.email)
    if (!username) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 403 })
    }

    await sql`
      INSERT INTO ownership (farmer_username, product)
      VALUES (${username}, ${product.trim()})
      ON CONFLICT DO NOTHING
    `
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { product } = await request.json()
    if (!product?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    const username = await getFarmerUsername(session.user.email)
    if (!username) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 403 })
    }

    await sql`
      DELETE FROM ownership
      WHERE farmer_username = ${username} AND product = ${product.trim()}
    `
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
