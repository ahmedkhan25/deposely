import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

// Lazy proxy so existing `openai.xxx` imports keep working
export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getOpenAI(), prop, receiver);
  },
});
