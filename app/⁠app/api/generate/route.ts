import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Replicate from 'replicate';

// Initialize SDKs
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. CHAT MODE
    if (mode === 'chat') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { text: 'Error: GEMINI_API_KEY environment variable is missing in Vercel.' },
          { status: 500 }
        );
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return NextResponse.json({
        text: response.text,
      });
    }

    // 2. IMAGE MODE
    if (mode === 'image') {
      if (!process.env.REPLICATE_API_TOKEN) {
        return NextResponse.json(
          { text: 'Error: REPLICATE_API_TOKEN environment variable is missing in Vercel.' },
          { status: 500 }
        );
      }

      const output: any = await replicate.run('black-forest-labs/flux-schnell', {
        input: { prompt },
      });

      const imageUrl = Array.isArray(output) ? output[0] : output;

      return NextResponse.json({
        text: `Here is your generated image:`,
        mediaUrl: imageUrl,
      });
    }

    // 3. VIDEO MODE
    if (mode === 'video') {
      if (!process.env.REPLICATE_API_TOKEN) {
        return NextResponse.json(
          { text: 'Error: REPLICATE_API_TOKEN environment variable is missing in Vercel.' },
          { status: 500 }
        );
      }

      const output: any = await replicate.run('luma/ray', {
        input: { prompt },
      });

      return NextResponse.json({
        text: `Here is your generated video:`,
        mediaUrl: output,
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { text: `API Error: ${error.message || 'Something went wrong.'}` },
      { status: 500 }
    );
  }
}
