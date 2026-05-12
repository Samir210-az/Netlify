exports.handler = async (event, context) => {
  // Yalnız POST sorğularını qəbul et
  if (event.httpMethod!== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const apiKey = process.env.GEMINI_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API açarı tapılmadı. Netlify Environment variables yoxla.' })
      };
    }

    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt göndərilməyib' })
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: data.error?.message || 'Gemini API xətası' 
        })
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Cavab tapılmadı';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ result: text })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Server xətası: ' + error.message 
      })
    };
  }
};
