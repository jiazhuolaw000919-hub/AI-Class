// api/ai/chat.js
// Vercel Serverless Function — Multi-Provider AI Proxy

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  var provider = body.provider;
  var prompt = body.prompt;
  var model = body.model;
  var options = body.options || {};

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    var result;

    switch (provider) {
      case 'google':
      case 'gemini':
        result = await callGoogle(prompt, model, options);
        break;
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
    return res.status(500).json({ error: err.message || 'AI request failed' });
  }
};

async function callGoogle(prompt, model, options) {
  var key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not configured');

  // 🎯 降级顺序：最新 → 次新 → 稳定
  var modelChain = [
    model,              // 如果前端指定了，优先用
    'gemini-3.8-flash', // 最新
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash'  // 最后兜底
  ].filter(function(m) { return !!m; });

  // 去重
  var tried = {};
  modelChain = modelChain.filter(function(m) {
    if (tried[m]) return false;
    tried[m] = true;
    return true;
  });

  var lastError = null;

  for (var i = 0; i < modelChain.length; i++) {
    var m = modelChain[i];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key;

    // 每个模型最多重试 2 次（针对 503/429）
    var maxRetriesPerModel = 2;
    var delay = 1000;

    for (var attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log('[Google] Trying model: ' + m + ' (attempt ' + attempt + '/' + maxRetriesPerModel + ')');

        var r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: (options && options.temperature) || 0.7,
                  maxOutputTokens: (options && options.max_tokens) || 8192,
                  responseMimeType: 'application/json'   // 🔥 强制 JSON 输出
                }
          })
        });

        // ✅ 成功
        if (r.ok) {
          var data = await r.json();
          console.log('[Google] ✅ Success with model: ' + m);
          return {
            text: (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '',
            provider: 'google',
            model: m,
            usage: data.usageMetadata || null
          };
        }

        var errText = await r.text();

        // 503/429：当前模型繁忙，重试或降级
        if (r.status === 503 || r.status === 429) {
          if (attempt < maxRetriesPerModel) {
            console.warn('[Google] ' + m + ' returned ' + r.status + ', retrying in ' + delay + 'ms...');
            await new Promise(function(resolve) { setTimeout(resolve, delay); });
            delay *= 2; // 指数退避
            continue;
          } else {
            console.warn('[Google] ' + m + ' exhausted retries, downgrading...');
            lastError = new Error('Google ' + r.status + ': ' + errText.slice(0, 200));
            break; // 跳出重试循环，降级到下一个模型
          }
        }

        // 404：模型不存在或已下线，直接降级
        if (r.status === 404) {
          console.warn('[Google] ' + m + ' not found (404), downgrading...');
          lastError = new Error('Google 404: model ' + m + ' not found');
          break;
        }

        // 其他错误（如 400 语法错误）：直接抛出，不降级
        throw new Error('Google ' + r.status + ': ' + errText.slice(0, 300));

      } catch (err) {
        // 网络错误等：记录，降级
        if (attempt < maxRetriesPerModel && err.message.indexOf('Google ') === -1) {
          console.warn('[Google] Fetch error with ' + m + ', retrying...', err.message);
          await new Promise(function(resolve) { setTimeout(resolve, delay); });
          delay *= 2;
          continue;
        }
        lastError = err;
        break;
      }
    }
  }

  // 所有模型都失败了
  throw lastError || new Error('All Gemini models failed');
}

async function callGroq(prompt, model, options) {
  var key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not configured');

  var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('Groq ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '',
    provider: 'groq',
    model: data.model,
    usage: data.usage
  };
}

async function callOpenAI(prompt, model, options) {
  var key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  var r = await fetch('https://api.openai.com/v1/chat/completions', {
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

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('OpenAI ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '',
    provider: 'openai',
    model: data.model,
    usage: data.usage
  };
}

async function callAnthropic(prompt, model, options) {
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');

  var r = await fetch('https://api.anthropic.com/v1/messages', {
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

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('Anthropic ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.content && data.content[0] && data.content[0].text) || '',
    provider: 'anthropic',
    model: data.model,
    usage: data.usage
  };
}

async function callDeepSeek(prompt, model, options) {
  var key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured');

  var r = await fetch('https://api.deepseek.com/v1/chat/completions', {
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

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('DeepSeek ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '',
    provider: 'deepseek',
    model: data.model,
    usage: data.usage
  };
}
