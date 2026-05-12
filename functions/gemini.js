export default async (req, context) => {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_KEY tapılmadı' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Düzgün endpoint: v1beta + gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Cavab yoxdur';
    
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
