"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Terminal,
  Globe,
  Code2,
  Server,
  ShieldCheck,
  GitPullRequest,
  Cpu,
  Database,
  HardDrive,
  Mic,
  Brain,
  Search,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "1,300+", label: "PRs/week at Stripe" },
  { value: "0%", label: "Human-written code" },
  { value: "~10s", label: "Devbox spin-up" },
  { value: "2", label: "max CI retry rounds" },
];

interface PipelineStep {
  number: number;
  title: string;
  color: string;
  bgColor: string;
  summary: string;
  details: React.ReactNode;
}

const pipelineSteps: PipelineStep[] = [
  {
    number: 1,
    title: "Trigger",
    color: "text-deposly-blue",
    bgColor: "bg-deposly-blue",
    summary: "CLI / API / Web",
    details: (
      <div className="space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-deposly-blue">
            CLI
          </span>
          <pre className="mt-1 rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto">
{`claude -p "Add contradiction severity scoring to live depo SSE stream" \\
  --allowedTools Read,Write,Edit,Bash \\
  --max-turns 15`}
          </pre>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-deposly-blue">
            API
          </span>
          <pre className="mt-1 rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto">
{`POST /api/agent/run
{
  "task": "Generate fact extraction endpoint for case documents",
  "budget_cap": "$2.00"
}`}
          </pre>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-deposly-blue">
            Web
          </span>
          <p className="mt-1 text-sm text-deposly-muted">
            Internal dashboard where team members describe a task in plain
            English, select a repo + branch, and click &quot;Run Agent.&quot;
          </p>
        </div>
      </div>
    ),
  },
  {
    number: 2,
    title: "Devbox",
    color: "text-deposly-accent",
    bgColor: "bg-deposly-accent",
    summary: "Docker Sandbox + AWS EC2",
    details: (
      <div className="space-y-2 text-sm text-deposly-muted">
        <p>
          Every agent run spins up a fresh, isolated Docker container (or an AWS
          EC2 instance for heavier workloads). The devbox contains a full clone
          of the repo, pre-installed dependencies, and network-isolated access
          to staging databases.
        </p>
        <p>
          Spin-up target: <span className="font-mono text-gray-900">~10 seconds</span>.
          Containers are destroyed after the run completes — no state leaks
          between tasks.
        </p>
      </div>
    ),
  },
  {
    number: 3,
    title: "Agent Execution",
    color: "text-deposly-coral",
    bgColor: "bg-deposly-coral",
    summary: "Blueprint pattern — deterministic + agentic steps",
    details: (
      <div className="space-y-2 text-sm text-deposly-muted">
        <p>The agent follows a structured &quot;blueprint&quot; that interleaves deterministic shell steps with agentic reasoning:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Clone repo &amp; checkout branch (deterministic)</li>
          <li>Read context, understand task, plan approach (agentic)</li>
          <li>Write the code implementation (agentic)</li>
          <li>Run <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">tsc --noEmit && eslint --fix</code> (deterministic)</li>
          <li>Run <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">npm test -- --relevant</code> (deterministic)</li>
          <li>Fix failures — max 2 rounds (agentic)</li>
          <li>Push branch &amp; create PR from template (deterministic)</li>
        </ol>
      </div>
    ),
  },
  {
    number: 4,
    title: "Quality Gates",
    color: "text-[#4ECBA0]",
    bgColor: "bg-[#4ECBA0]",
    summary: "tsc, eslint, jest, semgrep",
    details: (
      <div className="space-y-2 text-sm text-deposly-muted">
        <p>
          Every agent run must pass all four gates before it can open a PR:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {["tsc --noEmit", "eslint --fix", "jest --relevant", "semgrep --config auto"].map(
            (cmd) => (
              <div
                key={cmd}
                className="rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700"
              >
                {cmd}
              </div>
            )
          )}
        </div>
        <p>
          If a gate fails, the agent gets up to <strong>2 retry rounds</strong>{" "}
          to self-heal. After 2 failures the run is marked as failed and a human
          is notified.
        </p>
      </div>
    ),
  },
  {
    number: 5,
    title: "PR for Review",
    color: "text-[#7C3AED]",
    bgColor: "bg-[#7C3AED]",
    summary: "Structured PR with context for human review",
    details: (
      <div className="space-y-3 text-sm text-deposly-muted">
        <p>The agent creates a pull request using a standardized template:</p>
        <pre className="rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto">
{`## What
Add contradiction severity scoring to live depo SSE stream

## Why
Attorneys need real-time severity indicators during depositions
to prioritize follow-up questions.

## How
- Added SeverityScorer service with 3-level classification
- Integrated scorer into existing SSE pipeline
- Added unit tests for edge cases

## Test plan
- [x] tsc --noEmit passes
- [x] eslint --fix clean
- [x] jest (12 new tests, all green)
- [x] Manual test with sample transcript`}
        </pre>
      </div>
    ),
  },
];

const surfaces = [
  {
    title: "CLI",
    icon: <Terminal size={20} />,
    borderColor: "border-deposly-accent",
    tagColor: "bg-deposly-accent/10 text-deposly-accent",
    code: `claude -p "Add witness credibility scoring \\
  to depo analysis pipeline" \\
  --allowedTools Read,Write,Edit,Bash \\
  --max-turns 15 \\
  --budget-cap 2.00`,
    bestFor: [
      "Quick feature scaffolding",
      "Bug fixes from error logs",
      "Refactoring tasks",
      "Adding new API endpoints",
    ],
  },
  {
    title: "API",
    icon: <Globe size={20} />,
    borderColor: "border-deposly-blue",
    tagColor: "bg-deposly-blue/10 text-deposly-blue",
    code: `POST /api/agent/run
{
  "task": "Create pgvector migration for
    exhibit embedding storage",
  "repo": "deposly/deposly-app",
  "branch": "feat/exhibit-embeddings",
  "budget_cap": "$2.00",
  "notify": "#eng-agents"
}`,
    bestFor: [
      "CI/CD triggered tasks",
      "Scheduled migrations",
      "Batch code generation",
      "Webhook-driven workflows",
    ],
  },
  {
    title: "Web Dashboard",
    icon: <Code2 size={20} />,
    borderColor: "border-deposly-coral",
    tagColor: "bg-deposly-coral/10 text-deposly-coral",
    code: `// Internal dashboard
// Team members describe tasks in plain English,
// select repo + branch, configure budget,
// and monitor agent progress in real-time.
//
// Features:
//   - Live streaming logs
//   - Cost tracking per run
//   - One-click PR review`,
    bestFor: [
      "Non-CLI team members",
      "Task monitoring & cost tracking",
      "Agent run history",
      "Team-wide visibility",
    ],
  },
];

const devboxProperties = [
  {
    title: "Isolation",
    desc: "Every run gets a clean environment. No state leaks. A rogue agent can't corrupt the main repo or other runs.",
  },
  {
    title: "Parallelism",
    desc: "Spin up 10 devboxes at once. Each agent works independently on its own task, branch, and container.",
  },
  {
    title: "Predictability",
    desc: "Same image, same deps, same results. No 'works on my machine' — the devbox IS the machine.",
  },
];

const blueprintSteps = [
  { label: "Clone repo, checkout branch", type: "deterministic" as const },
  { label: "Read context, understand task, plan", type: "agentic" as const },
  { label: "Write code implementation", type: "agentic" as const },
  { label: "tsc --noEmit && eslint --fix", type: "deterministic" as const },
  { label: "npm test -- --relevant", type: "deterministic" as const },
  { label: "Fix failures (max 2 rounds)", type: "agentic" as const },
  { label: "git push, create PR from template", type: "deterministic" as const },
];

const mcpTools = [
  {
    name: "GitHub MCP",
    tag: "Pre-built",
    icon: <GitPullRequest size={20} />,
    desc: "Repo access, PR creation, issue reading",
    color: "text-deposly-accent",
    bgColor: "bg-deposly-accent/10",
  },
  {
    name: "PostgreSQL MCP",
    tag: "Pre-built",
    icon: <Database size={20} />,
    desc: "Schema inspection, pgvector queries, migration validation",
    color: "text-deposly-blue",
    bgColor: "bg-deposly-blue/10",
  },
  {
    name: "S3 MCP",
    tag: "Pre-built",
    icon: <HardDrive size={20} />,
    desc: "Document storage, presigned URLs",
    color: "text-deposly-coral",
    bgColor: "bg-deposly-coral/10",
  },
  {
    name: "Recall.ai MCP",
    tag: "Custom",
    icon: <Mic size={20} />,
    desc: "Transcription bot management, webhook configuration",
    color: "text-[#4ECBA0]",
    bgColor: "bg-[#4ECBA0]/10",
  },
  {
    name: "OpenAI MCP",
    tag: "Pre-built",
    icon: <Brain size={20} />,
    desc: "Model monitoring, usage tracking",
    color: "text-[#7C3AED]",
    bgColor: "bg-[#7C3AED]/10",
  },
  {
    name: "pgvector MCP",
    tag: "Custom",
    icon: <Search size={20} />,
    desc: "Embedding inspection, similarity search debugging",
    color: "text-deposly-blue",
    bgColor: "bg-deposly-blue/10",
  },
];

interface RoadmapPhase {
  stage: string;
  title: string;
  color: string;
  bgColor: string;
  items: string[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    stage: "Stage 1",
    title: "Foundation",
    color: "text-deposly-accent",
    bgColor: "bg-deposly-accent",
    items: [
      "Write CLAUDE.md with repo conventions and Deposly domain context",
      "Create shell scripts for common agent tasks (new endpoint, new service, migration)",
      "Set budget caps per run ($2 default, $5 max)",
      "Establish baseline metrics: time-to-PR, pass rate, cost per task",
    ],
  },
  {
    stage: "Stage 2",
    title: "Safety & Isolation",
    color: "text-deposly-blue",
    bgColor: "bg-deposly-blue",
    items: [
      "Docker sandbox with repo clone, deps pre-installed, network isolation",
      "Quality gates: tsc, eslint, jest, semgrep — all must pass before PR",
      "Max 2 CI retry rounds, then fail-and-notify",
      "Team training on prompt engineering and agent review workflows",
    ],
  },
  {
    stage: "Stage 3",
    title: "MCP Integration",
    color: "text-[#4ECBA0]",
    bgColor: "bg-[#4ECBA0]",
    items: [
      "GitHub MCP + PostgreSQL MCP for agent context",
      "Custom S3 MCP for document storage access",
      "Recall.ai MCP for transcription pipeline context",
      "Metrics tracking: cost, duration, pass rate per task type",
    ],
  },
  {
    stage: "Stage 4",
    title: "Orchestration",
    color: "text-deposly-coral",
    bgColor: "bg-deposly-coral",
    items: [
      "LangGraph workflow for multi-step agent orchestration",
      "Identify and optimize top 3 task types by volume",
      "Observability dashboard: cost, duration, success rate, agent logs",
      "Web dashboard for non-CLI team members",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Expandable wrapper                                                 */
/* ------------------------------------------------------------------ */
function Expandable({
  children,
  header,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group"
      >
        {header}
        <ChevronDown
          size={16}
          className={`text-deposly-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AICodingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-24">
        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              AI Coding at Scale
            </h1>
            <p className="text-lg text-deposly-muted max-w-2xl">
              How Deposly can implement production-grade AI coding agents —
              adapted from{" "}
              <a
                href="https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-deposly-blue hover:underline inline-flex items-center gap-1"
              >
                Stripe&apos;s Minions architecture
                <ExternalLink size={14} />
              </a>
            </p>
          </div>

          {/* Context card */}
          <div className="rounded-xl border border-deposly-border bg-deposly-gray p-5">
            <p className="text-sm text-deposly-muted leading-relaxed">
              Stripe merged{" "}
              <span className="font-semibold text-gray-900">
                1,300+ pull requests per week
              </span>{" "}
              written entirely by AI agents — zero human-written code. They did
              this by combining Claude with sandboxed &quot;devboxes,&quot;
              structured blueprints, and MCP tool integrations. This page
              outlines how we can apply the same architecture to Deposly.
            </p>
          </div>

          {/* Stat cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="rounded-xl border border-deposly-border bg-white p-5 text-center"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-deposly-muted mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ============================================================ */}
        {/*  SECTION 1: THE 5-LAYER PIPELINE                             */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
              Section 1
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              The 5-Layer Pipeline
            </h2>
            <p className="text-deposly-muted mt-2">
              From trigger to pull request — every agent run follows these five
              layers.
            </p>
          </div>

          {/* Vertical connector line on left */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-deposly-border" />

            <div className="space-y-4">
              {pipelineSteps.map((step) => (
                <div key={step.number} className="relative">
                  {/* Colored circle */}
                  <div
                    className={`absolute -left-8 top-5 w-[14px] h-[14px] rounded-full ${step.bgColor} ring-4 ring-white z-10`}
                  />

                  <div className="rounded-xl border border-deposly-border bg-white overflow-hidden">
                    <Expandable
                      defaultOpen={step.number === 1}
                      header={
                        <div className="p-5 flex items-center gap-3">
                          <span
                            className={`text-xs font-bold ${step.color} w-5`}
                          >
                            {step.number}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {step.title}
                          </span>
                          <span className="text-sm text-deposly-muted">
                            — {step.summary}
                          </span>
                        </div>
                      }
                    >
                      <div className="px-5 pb-5">{step.details}</div>
                    </Expandable>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/*  SECTION 2: THREE SURFACES                                   */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
              Section 2
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Three Surfaces
            </h2>
            <p className="text-deposly-muted mt-2">
              Three ways to trigger an agent run — same pipeline underneath.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {surfaces.map((surface) => (
              <motion.div
                key={surface.title}
                variants={staggerItem}
                className={`rounded-xl border border-deposly-border bg-white overflow-hidden border-t-4 ${surface.borderColor}`}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`${surface.tagColor} p-2 rounded-lg`}>
                      {surface.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {surface.title}
                    </h3>
                  </div>

                  <pre className="rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                    {surface.code}
                  </pre>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
                      Best for
                    </p>
                    <ul className="space-y-1">
                      {surface.bestFor.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-deposly-muted flex items-start gap-2"
                        >
                          <span className="text-deposly-accent mt-1">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ============================================================ */}
        {/*  SECTION 3: CLOUD DEVBOXES                                   */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
              Section 3
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Cloud Devboxes
            </h2>
            <p className="text-deposly-muted mt-2">
              Isolated, ephemeral environments where agents run safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Three properties */}
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900 text-lg">
                Three Properties of a Good Devbox
              </h3>
              <div className="space-y-4">
                {devboxProperties.map((prop, i) => (
                  <div
                    key={prop.title}
                    className="rounded-xl border border-deposly-border bg-white p-5"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-deposly-accent/10 flex items-center justify-center text-deposly-accent text-xs font-bold">
                        {i + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {prop.title}
                      </h4>
                    </div>
                    <p className="text-sm text-deposly-muted pl-10">
                      {prop.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Implementation */}
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900 text-lg">
                Implementation Options
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-deposly-border bg-white p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Server size={16} className="text-deposly-blue" />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Docker (Default)
                    </h4>
                  </div>
                  <pre className="rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto">
{`FROM node:20-slim
WORKDIR /workspace

# Pre-install deps for fast startup
COPY package*.json ./
RUN npm ci

# Clone repo at run time
ENTRYPOINT ["./scripts/agent-entrypoint.sh"]`}
                  </pre>
                </div>

                <div className="rounded-xl border border-deposly-border bg-white p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu size={16} className="text-deposly-coral" />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      AWS EC2 (Heavy workloads)
                    </h4>
                  </div>
                  <pre className="rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto">
{`aws ec2 run-instances \\
  --image-id ami-deposly-agent-v3 \\
  --instance-type t3.medium \\
  --security-group-ids sg-agent-sandbox \\
  --user-data file://agent-bootstrap.sh \\
  --tag-specifications \\
    "ResourceType=instance,Tags=[{Key=purpose,Value=agent-run}]"`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/*  SECTION 4: THE BLUEPRINT PATTERN                            */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
              Section 4
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              The Blueprint Pattern
            </h2>
            <p className="text-deposly-muted mt-2">
              Interleave deterministic shell commands with agentic reasoning for
              reliable, auditable runs.
            </p>
          </div>

          {/* Steps with arrow connectors */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {blueprintSteps.map((step, i) => (
              <motion.div key={i} variants={staggerItem}>
                <div className="flex items-center gap-4">
                  {/* Step number + color indicator */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                      step.type === "deterministic"
                        ? "bg-deposly-accent"
                        : "bg-deposly-blue"
                    }`}
                  >
                    {i + 1}
                  </div>

                  {/* Label */}
                  <div className="flex-1 rounded-xl border border-deposly-border bg-white px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {step.label}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          step.type === "deterministic"
                            ? "bg-deposly-accent/10 text-deposly-accent"
                            : "bg-deposly-blue/10 text-deposly-blue"
                        }`}
                      >
                        {step.type === "deterministic"
                          ? "Deterministic"
                          : "Agentic"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                {i < blueprintSteps.length - 1 && (
                  <div className="flex justify-start pl-[18px] py-1">
                    <ArrowRight
                      size={14}
                      className="text-deposly-border rotate-90"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-deposly-accent" />
              <span className="text-deposly-muted">Deterministic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-deposly-blue" />
              <span className="text-deposly-muted">Agentic</span>
            </div>
          </div>

          {/* "Why this works" callout */}
          <div className="rounded-xl border border-deposly-accent/20 bg-deposly-accent/5 p-5">
            <h4 className="font-semibold text-gray-900 mb-2">
              Why this works
            </h4>
            <p className="text-sm text-deposly-muted leading-relaxed">
              By wrapping the agentic steps (planning, coding, fixing) inside
              deterministic bookends (clone, lint, test, push), you get the
              creativity of an LLM with the reliability of a CI pipeline. The
              agent can&apos;t skip tests, can&apos;t push to main, and
              can&apos;t merge its own PRs. Every run is auditable and
              reproducible.
            </p>
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/*  SECTION 5: MCP TOOLS FOR DEPOSLY                            */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
              Section 5
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              MCP Tools for Deposly
            </h2>
            <p className="text-deposly-muted mt-2">
              Model Context Protocol integrations that give agents access to
              Deposly&apos;s infrastructure.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {mcpTools.map((tool) => (
              <motion.div
                key={tool.name}
                variants={staggerItem}
                className="rounded-xl border border-deposly-border bg-white p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`${tool.bgColor} p-2 rounded-lg`}>
                    <div className={tool.color}>{tool.icon}</div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      tool.tag === "Pre-built"
                        ? "bg-deposly-accent/10 text-deposly-accent"
                        : "bg-deposly-blue/10 text-deposly-blue"
                    }`}
                  >
                    {tool.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-deposly-muted">{tool.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ============================================================ */}
        {/*  SECTION 6: IMPLEMENTATION ROADMAP                           */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-deposly-muted mb-2">
              Section 6
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Implementation Roadmap
            </h2>
            <p className="text-deposly-muted mt-2">
              Four stages from first agent run to full orchestration.
            </p>
          </div>

          {/* Vertical connector line on left */}
          <div className="relative pl-8">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-deposly-border" />

            <div className="space-y-4">
              {roadmapPhases.map((phase) => (
                <div key={phase.title} className="relative">
                  {/* Colored circle */}
                  <div
                    className={`absolute -left-8 top-5 w-[14px] h-[14px] rounded-full ${phase.bgColor} ring-4 ring-white z-10`}
                  />

                  <div className="rounded-xl border border-deposly-border bg-white overflow-hidden">
                    <Expandable
                      header={
                        <div className="p-5 flex items-center gap-3">
                          <span
                            className={`text-xs font-bold ${phase.color}`}
                          >
                            {phase.stage}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {phase.title}
                          </span>
                        </div>
                      }
                    >
                      <div className="px-5 pb-5">
                        <ul className="space-y-2">
                          {phase.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm text-deposly-muted flex items-start gap-2"
                            >
                              <ShieldCheck
                                size={14}
                                className={`mt-0.5 shrink-0 ${phase.color}`}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Expandable>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/*  BOTTOM CALLOUT                                              */}
        {/* ============================================================ */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="rounded-xl border border-deposly-accent/20 bg-deposly-accent/5 p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              The starting point is simple
            </h3>
            <p className="text-sm text-deposly-muted max-w-xl mx-auto">
              You don&apos;t need orchestration, devboxes, or MCP servers on day
              one. Start with a single command and expand from there.
            </p>
            <div className="inline-block rounded-lg bg-gray-950 px-5 py-3">
              <code className="text-sm text-gray-300">
                claude -p{" "}
                <span className="text-deposly-accent">
                  &quot;your task here&quot;
                </span>{" "}
                --allowedTools Read,Write,Edit,Bash
              </code>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
