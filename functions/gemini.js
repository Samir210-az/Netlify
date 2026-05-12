export default async (req) => {
  if (req.method!== 'POST') {
    return new Response(JSON.stringify({ error: 'POST sorğusu göndərin' }), { status: 405 });
  }

  const { prompt } = await req.json();
  const apiKey = process.env.GEMINI_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Serverdə GEMINI_KEY tapılmadı' }), { status: 500 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Gemini xətası' }), { status: response.status });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Cavab alınmadı';
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
