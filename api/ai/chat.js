// api/ai/chat.js
// Vercel Serverless Function — Multi-Provider AI Proxy
// 支持 OpenAI / Anthropic / Google / DeepSeek

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, prompt, model, options } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    let result;

    switch (provider) {
      case 'openai':
        result = await callOpenAI(prompt, model, options);
        break;
      case 'anthropic':
        result = await callAnthropic(prompt, model, options);
        break;
      case 'google':
        result = await callGoogle(prompt, model, options);
        break;
      case 'deepseek':
        result = await callDeepSeek(prompt, model, options);
        break;
      default:
        return res.status(400).json({ error: 'Unknown provider: ' + provider });
    }

    return res.status(200).json({
      text: result.text,
      provider: provider,
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
// Provider implementations
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
      messages: [{ role: 'user', content: prompt }],
      temperature: (options && options.temperature) || 0.7
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('OpenAI ' + res.status + ': ' + err.slice(0, 200));
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
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
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: (options && options.max_tokens) || 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Anthropic ' + res.status + ': ' + err.slice(0, 200));
  }

  const data = await res.json();
  return {
    text: data.content?.[0]?.text || '',
    model: data.model,
    usage: data.usage
  };
}

async function callGoogle(prompt, model, options) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not configured');

  const m = model || 'gemini-1.5-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Google ' + res.status + ': ' + err.slice(0, 200));
  }

  const data = await res.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    model: m,
    usage: data.usageMetadata
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
    const err = await res.text();
    throw new Error('DeepSeek ' + res.status + ': ' + err.slice(0, 200));
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage
  };
}
