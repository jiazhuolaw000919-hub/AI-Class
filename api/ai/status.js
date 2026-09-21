// api/ai/status.js
// 诊断 endpoint — 检查环境变量是否配好

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  var keys = {
    GOOGLE_API_KEY: !!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
    GOOGLE_API_KEY_length: (process.env.GOOGLE_API_KEY || '').length,
    GOOGLE_API_KEY_prefix: (process.env.GOOGLE_API_KEY || '').slice(0, 6),
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
    node_version: process.version,
    vercel_env: process.env.VERCEL_ENV || 'unknown'
  };

  return res.status(200).json(keys);
}
