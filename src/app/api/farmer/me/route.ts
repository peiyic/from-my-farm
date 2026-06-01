import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { username, name, address, lat, lng } = await request.json()
  if (!username || !address || lat == null || lng == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    await sql`
      INSERT INTO farmer (username, name, address, coordinates, email)
      VALUES (${username}, ${name || null}, ${address}, point(${lat}, ${lng}), ${session.user.email})
    `
    const result = await sql`
      SELECT farmer.username, farmer.name, farmer.address, farmer.coordinates,
             COALESCE(array_agg(ownership.product) FILTER (WHERE ownership.product IS NOT NULL), '{}') AS products
      FROM farmer
      LEFT JOIN ownership ON farmer.username = ownership.farmer_username
      WHERE farmer.email = ${session.user.email}
      GROUP BY farmer.username
    `
    return NextResponse.json({ farmer: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sql`
      SELECT farmer.username, farmer.name, farmer.address, farmer.coordinates,
             COALESCE(array_agg(ownership.product) FILTER (WHERE ownership.product IS NOT NULL), '{}') AS products
      FROM farmer
      LEFT JOIN ownership ON farmer.username = ownership.farmer_username
      WHERE farmer.email = ${session.user.email}
      GROUP BY farmer.username
    `
    return NextResponse.json({ farmer: result.rows[0] ?? null }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
