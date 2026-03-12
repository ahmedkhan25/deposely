import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as any;

const runtime = new CopilotRuntime();

const endpoint = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter: new OpenAIAdapter({ openai }),
  endpoint: "/api/copilotkit",
});

export const POST = endpoint.handleRequest;
