import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. CHAT MODE (Google Gemini)
    if (mode === 'chat') {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { text: 'GEMINI_API_KEY is missing in Vercel environment variables.' },
          { status: 500 }
        );
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { text: `Gemini Error: ${data.error?.message || 'Failed to get response'}` },
          { status: response.status }
        );
      }

      const replyText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      return NextResponse.json({ text: replyText });
    }

    // 2. IMAGE MODE
    if (mode === 'image') {
      const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`;
      return NextResponse.json({
        text: `Generated image for: "${prompt}"`,
        mediaUrl: imageUrl,
      });
    }

    // 3. VIDEO MODE
    if (mode === 'video') {
      return NextResponse.json({
        text: `Sample video generated for prompt: "${prompt}"`,
        mediaUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { text: `Server error: ${error.message || 'Something went wrong.'}` },
      { status: 500 }
    );
  }
}
