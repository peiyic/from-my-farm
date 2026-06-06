import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 503 }
    );
  }

  try {
    const { query, availableProducts } = await request.json();
    const client = new Anthropic();

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Parse this farm marketplace search query. Return JSON only, no markdown.
Available products: ${(availableProducts as string[]).join(', ') || 'none'}

Query: "${query}"

Return exactly: {"location":string|null,"matchingProducts":string[]}
- location: city, suburb, or area mentioned in the query (null if none mentioned)
- matchingProducts: subset of available products that match what the user wants, using category knowledge (e.g. "fruits" → ["apple","mango"] if those are available)`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}';
    // Strip markdown code fences if the model wraps the response
    const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: { location: string | null; matchingProducts: string[] };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { location: null, matchingProducts: [] };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
