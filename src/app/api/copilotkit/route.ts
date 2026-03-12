import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

let _endpoint: ReturnType<typeof copilotRuntimeNextJSAppRouterEndpoint> | null = null;

function getEndpoint() {
  if (!_endpoint) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as any;
    const runtime = new CopilotRuntime();
    _endpoint = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: new OpenAIAdapter({ openai }),
      endpoint: "/api/copilotkit",
    });
  }
  return _endpoint;
}

export async function POST(req: Request) {
  return getEndpoint().handleRequest(req);
}
