// api/ai/chat.js
// Vercel Serverless Function — Multi-Provider AI Proxy
// 免费优先：Google Gemini (1500 req/day free)

export default async function handler(req, res) {
  // CORS（如果需要）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, prompt, model, options } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    let result;

    // 免费 provider 优先
    switch (provider) {
      case 'google':
      case 'gemini':
        result = await callGoogle(prompt, model, options);
        break;

      // 如果以后配了 key，这些也能用
      case 'groq':
        result = await callGroq(prompt, model, options);
        break;

      case 'openai':
        result = await callOpenAI(prompt, model, options);
        break;

      case 'anthropic':
        result = await callAnthropic(prompt, model, options);
        break;

      case 'deepseek':
        result = await callDeepSeek(prompt, model, options);
        break;

      default:
        // 默认走 Google（免费）
        result = await callGoogle(prompt, model, options);
    }

    return res.status(200).json({
      text: result.text,
      provider: result.provider,
      model: result.model,
      usage: result.usage || null
    });
  } catch (err) {
    console.error('[API /ai/chat]', err);
    return res.status(500).json({
      error: err.message || 'AI request failed'
    });
  }
}

// ============================================================
// Google Gemini (免费 1500 req/day)
// ============================================================
async function callGoogle(prompt, model, options) {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not configured on server');

  const m = model || 'gemini-1.5-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: (options && options.temperature) || 0.7,
        maxOutputTokens: (options && options.max_tokens) || 2048
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Google Gemini ' + res.status + ': ' + errText.slice(0, 300));
  }

  const data = await res.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    provider: 'google',
    model: m,
    usage: data.usageMetadata || null
  };
}

// ============================================================
// Groq (免费额度)
// ============================================================
async function callGroq(prompt, model, options) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Groq ' + res.status + ': ' + errText.slice(0, 300));
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    provider: 'groq',
    model: data.model,
    usage: data.usage
  };
}

// ============================================================
// 付费 provider（可选，配了 key 就能用）
// ============================================================
async function callOpenAI(prompt, model, options) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('OpenAI ' + res.status + ': ' + errText.slice(0, 300));
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    provider: 'openai',
    model: data.model,
    usage: data.usage
  };
}

async function callAnthropic(prompt, model, options) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Anthropic ' + res.status + ': ' + errText.slice(0, 300));
  }

  const data = await res.json();
  return {
    text: data.content?.[0]?.text || '',
    provider: 'anthropic',
    model: data.model,
    usage: data.usage
  };
}

async function callDeepSeek(prompt, model, options) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured');

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('DeepSeek ' + res.status + ': ' + errText.slice(0, 300));
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    provider: 'deepseek',
    model: data.model,
    usage: data.usage
  };
}
