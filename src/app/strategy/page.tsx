"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  type Node,
  type Edge,
  Position,
  Handle,
  type NodeProps,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import { SectionHeader } from "@/components/SectionHeader";
import {
  Bot,
  Brain,
  FileSearch,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowDown,
  Search,
  List,
  MessageSquare,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  Circle,
  User,
  ExternalLink,
  Code,
  Play,
  Terminal,
  Database,
  Layers,
  Target,
  Network,
  Settings,
} from "lucide-react";
import {
  contradictionResearch,
} from "@/lib/deposly-data";

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const automationItems = [
  "Fact extraction from transcripts",
  "Document search & retrieval",
  "Contradiction detection",
  "Outline generation",
  "Timeline construction",
  "Named entity recognition",
];

const expertItems = [
  "Cross-examination strategy",
  "Witness credibility assessment",
  "Legal theory selection",
  "Settlement negotiation",
  "Ethical judgment calls",
  "Jury perception analysis",
];

const agentPatterns: {
  name: string;
  type: string;
  typeColor: string;
  flow: string;
  desc: string;
  highlight?: boolean;
}[] = [
  {
    name: "Prompt Chaining",
    type: "WORKFLOW",
    typeColor: "bg-deposly-blue",
    flow: "LLM → LLM → LLM → Output",
    desc: "Sequential LLM calls where each step's output feeds the next. Simple and predictable.",
  },
  {
    name: "Routing",
    type: "WORKFLOW",
    typeColor: "bg-deposly-blue",
    flow: "Input → Router → Handler A | B | C",
    desc: "Classify input and direct to specialized handlers. Good for multi-domain queries.",
  },
  {
    name: "Parallelization",
    type: "WORKFLOW",
    typeColor: "bg-deposly-blue",
    flow: "Task → LLM || LLM || LLM → Merge",
    desc: "Run multiple LLM calls concurrently and aggregate results. Faster throughput.",
  },
  {
    name: "Orchestrator-Workers",
    type: "DEPOSLY'S APPROACH",
    typeColor: "bg-deposly-accent",
    flow: "Orchestrator → Worker A | B | C → Synthesize",
    desc: "Central agent delegates tasks to specialist agents. Deposly's core architecture.",
    highlight: true,
  },
  {
    name: "Evaluator-Optimizer",
    type: "ADVANCED",
    typeColor: "bg-deposly-coral",
    flow: "Generate → Evaluate → Refine ↻",
    desc: "One LLM generates, another evaluates and iterates until quality threshold is met.",
  },
  {
    name: "Autonomous Agent",
    type: "AGENT",
    typeColor: "bg-deposly-coral",
    flow: "Prompt → LLM → Tool → Observe ↻",
    desc: "LLM loops autonomously with tools until the task is complete. Most flexible, least predictable.",
  },
];

const orchestrationAgents = [
  {
    id: "doc-ingestion",
    label: "Doc Ingestion",
    icon: FileSearch,
    subtitle: "Parses case documents",
    desc: "Handles document chunking, embedding generation, and OCR for scanned documents. Supports PDF, DOCX, and image formats.",
    details: [
      "GLM-OCR for scanned depositions",
      "Semantic chunking with overlap",
      "Metadata extraction (dates, names, case numbers)",
    ],
  },
  {
    id: "fact-extraction",
    label: "Fact Extraction",
    icon: Search,
    subtitle: "NER & relation extraction",
    desc: "Identifies named entities, relationships between parties, and key factual assertions from testimony and documents.",
    details: [
      "Named entity recognition (people, dates, locations)",
      "Relation extraction (who did what, when)",
      "Confidence scoring per fact",
    ],
  },
  {
    id: "outline-gen",
    label: "Outline Generator",
    icon: List,
    subtitle: "Theme clustering",
    desc: "Groups extracted facts into thematic clusters and generates targeted deposition questions for each theme.",
    details: [
      "Automatic theme identification",
      "Question generation with rationale",
      "Source attribution per question",
    ],
  },
  {
    id: "live-depo",
    label: "Live Depo",
    icon: MessageSquare,
    subtitle: "Real-time transcription",
    desc: "Processes live deposition audio via Recall.ai, streaming transcript and analysis in real-time during proceedings.",
    details: [
      "Recall.ai bot integration",
      "Real-time SSE streaming",
      "Live contradiction flagging",
    ],
  },
  {
    id: "contradiction",
    label: "Contradiction Detector",
    icon: ShieldCheck,
    subtitle: "Cross-reference facts",
    desc: "Compares current testimony against previously extracted facts and document evidence to identify inconsistencies.",
    details: [
      "NLI-based contradiction scoring",
      "LLM-as-judge verification",
      "Severity classification (critical/warning/info)",
    ],
  },
  {
    id: "summary",
    label: "Summary Writer",
    icon: FileText,
    subtitle: "Key admissions & narrative",
    desc: "Synthesizes outputs from all upstream agents into a coherent deposition summary with key admissions highlighted.",
    details: [
      "Key admission extraction",
      "Narrative generation",
      "Cross-referenced with contradiction findings",
    ],
  },
];

const orchestrationTypes = [
  {
    name: "Centralized",
    color: "deposly-accent",
    badge: "Deposly's Model",
    desc: "A single orchestrator coordinates all specialist agents. Simple, predictable, and easy to debug. Best for well-defined pipelines with clear dependencies.",
  },
  {
    name: "Decentralized",
    color: "deposly-blue",
    badge: null,
    desc: "Agents communicate peer-to-peer without a central coordinator. Highly resilient but harder to reason about. Good for distributed systems.",
  },
  {
    name: "Hierarchical",
    color: "deposly-coral",
    badge: null,
    desc: "Multi-level coordination where managers delegate to sub-managers who delegate to workers. Scales well for complex organizations.",
  },
  {
    name: "Federated",
    color: "purple-600",
    badge: null,
    desc: "Independent systems coordinate through shared protocols. Each system maintains autonomy. Best for cross-organizational collaboration.",
  },
];

const daytonaSteps = [
  {
    step: 1,
    title: "LLM identifies entities",
    desc: "The language model extracts names, dates, locations, and key events from the deposition transcript.",
  },
  {
    step: 2,
    title: "Generate Python code",
    desc: "Based on extracted entities, the LLM writes deterministic Python code for timeline reconstruction.",
  },
  {
    step: 3,
    title: "Execute in sandbox",
    desc: "The code runs in an isolated Daytona sandbox — no access to the host system, network, or other data.",
  },
  {
    step: 4,
    title: "Return verified results",
    desc: "The sandbox returns structured timeline data that has been computed deterministically — no hallucination possible.",
  },
];

const roadmapPhases = [
  {
    phase: 1,
    title: "RAG Foundation",
    badge: "Current Focus",
    badgeColor: "bg-deposly-accent",
    status: "active" as const,
    items: [
      "Document ingestion & semantic chunking",
      "pgvector embeddings with legal-domain models",
      "Semantic search with confidence scoring",
      "Citation extraction and cross-referencing",
      "Ask Docs: natural language Q&A over case files",
    ],
  },
  {
    phase: 2,
    title: "Single-Agent Workflows",
    badge: null,
    badgeColor: "",
    status: "upcoming" as const,
    items: [
      "Fact extraction pipeline",
      "Automated outline generation",
      "Template-based deposition summaries",
      "Prompt chaining for multi-step analysis",
    ],
  },
  {
    phase: 3,
    title: "Multi-Agent Orchestration",
    badge: null,
    badgeColor: "",
    status: "upcoming" as const,
    items: [
      "Live deposition pipeline with Recall.ai",
      "Real-time contradiction detection",
      "Cross-agent memory and state management",
      "AG-UI streaming for live UI updates",
      "Confidence-based human-in-the-loop gates",
    ],
  },
  {
    phase: 4,
    title: "Predictive Intelligence",
    badge: null,
    badgeColor: "",
    status: "upcoming" as const,
    items: [
      "Predict contradictions before they surface",
      "Case strategy recommendations",
      "Cross-case pattern analysis",
      "Outcome probability modeling",
    ],
  },
];

const statusStyle = {
  complete: {
    icon: <CheckCircle2 size={14} className="text-deposly-accent" />,
    label: "Complete",
    color: "text-deposly-accent",
  },
  active: {
    icon: <Clock size={14} className="text-deposly-blue" />,
    label: "Active",
    color: "text-deposly-blue",
  },
  upcoming: {
    icon: <Circle size={14} className="text-deposly-muted" />,
    label: "Upcoming",
    color: "text-deposly-muted",
  },
};

/* ─── Custom ReactFlow Node ────────────────────────────────────────────────── */

interface AgentNodeData {
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isOrchestrator?: boolean;
}

function AgentNode({ data }: NodeProps<AgentNodeData>) {
  const Icon = data.icon;
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 shadow-sm ${
        data.isOrchestrator
          ? "bg-deposly-accent text-white border-deposly-accent"
          : "bg-white text-gray-900 border-deposly-border hover:border-deposly-blue/40"
      }`}
      style={{ minWidth: 140 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-deposly-accent !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Icon size={16} className={data.isOrchestrator ? "text-white" : "text-deposly-blue"} />
        <div>
          <p className={`text-xs font-semibold ${data.isOrchestrator ? "text-white" : "text-gray-900"}`}>
            {data.label}
          </p>
          <p className={`text-[10px] ${data.isOrchestrator ? "text-white/70" : "text-deposly-muted"}`}>
            {data.subtitle}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-deposly-accent !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode };

/* ─── Main Page Component ──────────────────────────────────────────────────── */

export default function StrategyPage() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});

  const toggleAgent = useCallback((id: string) => {
    setExpandedAgents((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* ── ReactFlow Nodes ── */
  const flowNodes: Node[] = useMemo(
    () => [
      {
        id: "orchestrator",
        type: "agentNode",
        data: {
          label: "Deposition Orchestrator",
          subtitle: "Central coordinator",
          icon: Brain,
          isOrchestrator: true,
        },
        position: { x: 280, y: 10 },
      },
      ...orchestrationAgents.map((a, i) => ({
        id: a.id,
        type: "agentNode",
        data: { label: a.label, subtitle: a.subtitle, icon: a.icon },
        position: { x: (i % 3) * 220 + 30, y: Math.floor(i / 3) * 110 + 130 },
      })),
    ],
    []
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      orchestrationAgents.map((a) => ({
        id: `orch-${a.id}`,
        source: "orchestrator",
        target: a.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#2D8B5E", strokeWidth: 2 },
      })),
    []
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 1: Intelligence vs Judgment
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="Intelligence vs Judgment"
          badge="AI Engineering"
          subtitle="What to automate vs. what requires expert judgment — confidence-based routing decides"
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-0 items-stretch">
          {/* Left: Automate */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border border-deposly-border rounded-xl p-6 bg-white"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-deposly-accent/10 flex items-center justify-center">
                <Bot size={18} className="text-deposly-accent" />
              </div>
              <h3 className="font-bold text-gray-900">Automate</h3>
              <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-deposly-accent/10 text-deposly-accent uppercase tracking-wider">
                AI Handles
              </span>
            </div>
            <div className="space-y-2.5">
              {automationItems.map((item, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-deposly-gray transition-colors border-l-4 border-deposly-accent"
                >
                  <span className="text-sm text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Center: Confidence divider */}
          <div className="hidden md:flex flex-col items-center justify-center px-6 py-8">
            <div className="w-px flex-1 bg-gradient-to-b from-deposly-accent via-deposly-blue to-deposly-blue" />
            <div className="my-4 px-3 py-2 rounded-lg bg-deposly-gray border border-deposly-border text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-deposly-muted mb-1">
                Confidence-Based Routing
              </p>
              <p className="text-xs text-deposly-accent font-semibold">&ge;0.85 &rarr; Auto</p>
              <p className="text-xs text-deposly-blue font-semibold">&lt;0.85 &rarr; Human</p>
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-deposly-blue via-deposly-blue to-deposly-accent" />
          </div>

          {/* Mobile divider */}
          <div className="flex md:hidden items-center justify-center py-4">
            <div className="flex-1 h-px bg-deposly-border" />
            <div className="mx-4 px-3 py-1.5 rounded-lg bg-deposly-gray border border-deposly-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-deposly-muted">
                &ge;0.85 Auto &middot; &lt;0.85 Human
              </p>
            </div>
            <div className="flex-1 h-px bg-deposly-border" />
          </div>

          {/* Right: Expert Judgment */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border border-deposly-border rounded-xl p-6 bg-white"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-deposly-blue/10 flex items-center justify-center">
                <User size={18} className="text-deposly-blue" />
              </div>
              <h3 className="font-bold text-gray-900">Expert Judgment</h3>
              <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-deposly-blue/10 text-deposly-blue uppercase tracking-wider">
                Human Required
              </span>
            </div>
            <div className="space-y-2.5">
              {expertItems.map((item, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-deposly-gray transition-colors border-l-4 border-deposly-blue"
                >
                  <span className="text-sm text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 2: What is an Agent?
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="What is an Agent?"
          subtitle={undefined}
        />
        <p className="text-deposly-muted -mt-6 mb-8">
          Building blocks from simple workflows to autonomous agents &mdash; via{" "}
          <a
            href="https://www.anthropic.com/engineering/building-effective-agents"
            target="_blank"
            rel="noopener noreferrer"
            className="text-deposly-blue hover:underline inline-flex items-center gap-1"
          >
            Anthropic <ExternalLink size={12} />
          </a>
        </p>

        {/* Definition cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border border-deposly-border rounded-xl p-5 bg-white border-l-4 border-l-deposly-blue"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <Settings size={14} className="text-deposly-blue" />
              Workflows
            </h3>
            <p className="text-sm text-deposly-muted">
              LLMs and tools orchestrated through <strong>predefined code paths</strong>. Predictable, reliable, and easier to reason about.
            </p>
          </motion.div>
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border border-deposly-border rounded-xl p-5 bg-white border-l-4 border-l-deposly-coral"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <Zap size={14} className="text-deposly-coral" />
              Agents
            </h3>
            <p className="text-sm text-deposly-muted">
              LLMs <strong>dynamically direct their own processes</strong> and tool usage, maintaining control over how they accomplish tasks.
            </p>
          </motion.div>
        </div>

        {/* THE AGENT LOOP */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border border-deposly-border rounded-xl p-6 bg-white mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-deposly-muted mb-6 text-center">
            The Agent Loop
          </p>
          <div className="flex flex-col items-center gap-4">
            {/* Row 1: Prompt -> LLM Evaluates */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="px-4 py-2 bg-deposly-gray rounded-lg border border-deposly-border text-sm text-gray-700 font-medium">
                Your Prompt
              </div>
              <ArrowRight size={16} className="text-deposly-muted" />
              <div className="px-4 py-2 bg-white rounded-lg border-2 border-deposly-accent text-sm text-gray-900 font-medium flex items-center gap-2">
                <Brain size={14} className="text-deposly-accent" />
                LLM Evaluates
              </div>
            </div>

            <ArrowDown size={16} className="text-deposly-muted" />

            {/* Agentic Loop */}
            <motion.div
              animate={{ borderColor: ["#E5E5E5", "#4F6EF7", "#E5E5E5"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="border-2 border-dashed rounded-xl px-8 py-5 bg-deposly-gray/50 flex items-center gap-4 flex-wrap justify-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-deposly-blue w-full text-center mb-2">
                Agentic Loop
              </p>
              <div className="px-4 py-2 bg-white rounded-lg border border-deposly-border text-sm text-gray-700 font-medium flex items-center gap-2">
                <Code size={14} className="text-deposly-blue" />
                Tool Call(s)
              </div>
              <motion.div
                animate={{ x: [0, 6, 0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={16} className="text-deposly-blue" />
              </motion.div>
              <div className="px-4 py-2 bg-white rounded-lg border border-deposly-border text-sm text-gray-700 font-medium flex items-center gap-2">
                <Target size={14} className="text-deposly-blue" />
                Evaluate
              </div>
              <motion.div
                animate={{ x: [0, -6, 0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={16} className="text-deposly-blue rotate-180" />
              </motion.div>
            </motion.div>

            <div className="flex items-center gap-2">
              <ArrowDown size={16} className="text-deposly-muted" />
              <span className="text-xs text-deposly-muted italic">no tool calls</span>
            </div>

            {/* Final Answer */}
            <div className="px-5 py-2.5 bg-deposly-accent/10 rounded-lg border border-deposly-accent/30 text-sm text-deposly-accent font-semibold">
              Final Answer
            </div>
          </div>
        </motion.div>

        {/* COMMON PATTERNS */}
        <p className="text-xs font-bold uppercase tracking-wider text-deposly-muted mb-4">
          Common Patterns
        </p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          {agentPatterns.map((p) => (
            <motion.div
              key={p.name}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className={`border rounded-xl p-5 bg-white transition-shadow hover:shadow-md ${
                p.highlight
                  ? "border-deposly-accent ring-2 ring-deposly-accent/20"
                  : "border-deposly-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${p.typeColor}`}
                >
                  {p.type}
                </span>
              </div>
              <div className="bg-deposly-gray rounded-lg p-3 mb-3 border border-deposly-border">
                <code className="text-xs font-mono text-gray-600 block text-center">
                  {p.flow}
                </code>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
              <p className="text-xs text-deposly-muted mt-1">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Deposly's Approach callout */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="p-5 bg-deposly-accent/5 rounded-xl border border-deposly-accent/20 flex items-start gap-4"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-deposly-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <Bot size={20} className="text-deposly-accent" />
          </motion.div>
          <div>
            <p className="font-bold text-gray-900 text-sm mb-1">
              Deposly&apos;s Approach: Orchestrator-Workers
            </p>
            <p className="text-sm text-deposly-muted">
              A central Deposition Orchestrator delegates to specialist agents (fact extraction, contradiction detection, outline generation) with human-in-the-loop gates for high-stakes legal decisions. Start with workflows, graduate to autonomous agents as confidence grows.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 3: Agent Orchestration
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="Agent Orchestration"
          subtitle="Deposly's multi-agent deposition pipeline — centralized orchestrator with specialist workers"
        />

        {/* ReactFlow Diagram */}
        <div
          className="border border-deposly-border rounded-xl bg-white overflow-hidden mb-6"
          style={{ height: 400 }}
        >
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#E5E5E5" gap={20} />
          </ReactFlow>
        </div>

        {/* Expandable Agent Detail Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
        >
          {orchestrationAgents.map((agent) => {
            const Icon = agent.icon;
            const isOpen = expandedAgents[agent.id] || false;
            return (
              <motion.div
                key={agent.id}
                variants={staggerItem}
                className="border border-deposly-border rounded-xl bg-white overflow-hidden"
              >
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-deposly-blue/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-deposly-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{agent.label}</p>
                    <p className="text-xs text-deposly-muted mt-0.5">{agent.subtitle}</p>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-deposly-muted mt-1 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-deposly-muted mt-1 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-deposly-border pt-3">
                        <p className="text-xs text-gray-600 mb-2">{agent.desc}</p>
                        <ul className="space-y-1">
                          {agent.details.map((d, i) => (
                            <li key={i} className="text-xs text-deposly-muted flex items-start gap-2">
                              <span className="text-deposly-blue mt-0.5">&bull;</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Types of Agent Orchestration */}
        <p className="text-xs font-bold uppercase tracking-wider text-deposly-muted mb-4">
          Types of Agent Orchestration
        </p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Centralized */}
          <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Centralized</h4>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-deposly-accent/10 text-deposly-accent">
                Deposly&apos;s Model
              </span>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="140" height="120" viewBox="0 0 140 120">
                <circle cx="70" cy="30" r="16" fill="#2D8B5E" opacity="0.15" stroke="#2D8B5E" strokeWidth="2" />
                <text x="70" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2D8B5E">O</text>
                <circle cx="20" cy="95" r="12" fill="#2D8B5E" opacity="0.08" stroke="#2D8B5E" strokeWidth="1.5" />
                <text x="20" y="99" textAnchor="middle" fontSize="9" fill="#2D8B5E">A</text>
                <circle cx="55" cy="100" r="12" fill="#2D8B5E" opacity="0.08" stroke="#2D8B5E" strokeWidth="1.5" />
                <text x="55" y="104" textAnchor="middle" fontSize="9" fill="#2D8B5E">A</text>
                <circle cx="90" cy="100" r="12" fill="#2D8B5E" opacity="0.08" stroke="#2D8B5E" strokeWidth="1.5" />
                <text x="90" y="104" textAnchor="middle" fontSize="9" fill="#2D8B5E">A</text>
                <circle cx="122" cy="95" r="12" fill="#2D8B5E" opacity="0.08" stroke="#2D8B5E" strokeWidth="1.5" />
                <text x="122" y="99" textAnchor="middle" fontSize="9" fill="#2D8B5E">A</text>
                <line x1="70" y1="46" x2="20" y2="83" stroke="#2D8B5E" strokeWidth="1.5" opacity="0.5" />
                <line x1="70" y1="46" x2="55" y2="88" stroke="#2D8B5E" strokeWidth="1.5" opacity="0.5" />
                <line x1="70" y1="46" x2="90" y2="88" stroke="#2D8B5E" strokeWidth="1.5" opacity="0.5" />
                <line x1="70" y1="46" x2="122" y2="83" stroke="#2D8B5E" strokeWidth="1.5" opacity="0.5" />
              </svg>
            </div>
            <p className="text-xs text-deposly-muted">{orchestrationTypes[0].desc}</p>
          </motion.div>

          {/* Decentralized */}
          <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Decentralized</h4>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="140" height="120" viewBox="0 0 140 120">
                <circle cx="70" cy="20" r="12" fill="#4F6EF7" opacity="0.1" stroke="#4F6EF7" strokeWidth="1.5" />
                <text x="70" y="24" textAnchor="middle" fontSize="9" fill="#4F6EF7">N</text>
                <circle cx="25" cy="55" r="12" fill="#4F6EF7" opacity="0.1" stroke="#4F6EF7" strokeWidth="1.5" />
                <text x="25" y="59" textAnchor="middle" fontSize="9" fill="#4F6EF7">N</text>
                <circle cx="115" cy="55" r="12" fill="#4F6EF7" opacity="0.1" stroke="#4F6EF7" strokeWidth="1.5" />
                <text x="115" y="59" textAnchor="middle" fontSize="9" fill="#4F6EF7">N</text>
                <circle cx="40" cy="100" r="12" fill="#4F6EF7" opacity="0.1" stroke="#4F6EF7" strokeWidth="1.5" />
                <text x="40" y="104" textAnchor="middle" fontSize="9" fill="#4F6EF7">N</text>
                <circle cx="100" cy="100" r="12" fill="#4F6EF7" opacity="0.1" stroke="#4F6EF7" strokeWidth="1.5" />
                <text x="100" y="104" textAnchor="middle" fontSize="9" fill="#4F6EF7">N</text>
                {/* Mesh connections */}
                <line x1="70" y1="32" x2="25" y2="43" stroke="#4F6EF7" strokeWidth="1" opacity="0.3" />
                <line x1="70" y1="32" x2="115" y2="43" stroke="#4F6EF7" strokeWidth="1" opacity="0.3" />
                <line x1="25" y1="67" x2="40" y2="88" stroke="#4F6EF7" strokeWidth="1" opacity="0.3" />
                <line x1="115" y1="67" x2="100" y2="88" stroke="#4F6EF7" strokeWidth="1" opacity="0.3" />
                <line x1="40" y1="100" x2="100" y2="100" stroke="#4F6EF7" strokeWidth="1" opacity="0.3" />
                <line x1="25" y1="55" x2="115" y2="55" stroke="#4F6EF7" strokeWidth="1" opacity="0.15" />
                <line x1="70" y1="32" x2="40" y2="88" stroke="#4F6EF7" strokeWidth="1" opacity="0.15" />
                <line x1="70" y1="32" x2="100" y2="88" stroke="#4F6EF7" strokeWidth="1" opacity="0.15" />
                <line x1="25" y1="67" x2="100" y2="88" stroke="#4F6EF7" strokeWidth="1" opacity="0.15" />
                <line x1="115" y1="67" x2="40" y2="88" stroke="#4F6EF7" strokeWidth="1" opacity="0.15" />
              </svg>
            </div>
            <p className="text-xs text-deposly-muted">{orchestrationTypes[1].desc}</p>
          </motion.div>

          {/* Hierarchical */}
          <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Hierarchical</h4>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="140" height="120" viewBox="0 0 140 120">
                <circle cx="70" cy="18" r="12" fill="#C74B2A" opacity="0.1" stroke="#C74B2A" strokeWidth="1.5" />
                <text x="70" y="22" textAnchor="middle" fontSize="8" fill="#C74B2A">L1</text>
                <circle cx="35" cy="60" r="12" fill="#C74B2A" opacity="0.1" stroke="#C74B2A" strokeWidth="1.5" />
                <text x="35" y="64" textAnchor="middle" fontSize="8" fill="#C74B2A">L2</text>
                <circle cx="105" cy="60" r="12" fill="#C74B2A" opacity="0.1" stroke="#C74B2A" strokeWidth="1.5" />
                <text x="105" y="64" textAnchor="middle" fontSize="8" fill="#C74B2A">L2</text>
                <circle cx="15" cy="100" r="10" fill="#C74B2A" opacity="0.06" stroke="#C74B2A" strokeWidth="1" />
                <text x="15" y="103" textAnchor="middle" fontSize="7" fill="#C74B2A">L3</text>
                <circle cx="55" cy="100" r="10" fill="#C74B2A" opacity="0.06" stroke="#C74B2A" strokeWidth="1" />
                <text x="55" y="103" textAnchor="middle" fontSize="7" fill="#C74B2A">L3</text>
                <circle cx="85" cy="100" r="10" fill="#C74B2A" opacity="0.06" stroke="#C74B2A" strokeWidth="1" />
                <text x="85" y="103" textAnchor="middle" fontSize="7" fill="#C74B2A">L3</text>
                <circle cx="125" cy="100" r="10" fill="#C74B2A" opacity="0.06" stroke="#C74B2A" strokeWidth="1" />
                <text x="125" y="103" textAnchor="middle" fontSize="7" fill="#C74B2A">L3</text>
                <line x1="70" y1="30" x2="35" y2="48" stroke="#C74B2A" strokeWidth="1.5" opacity="0.4" />
                <line x1="70" y1="30" x2="105" y2="48" stroke="#C74B2A" strokeWidth="1.5" opacity="0.4" />
                <line x1="35" y1="72" x2="15" y2="90" stroke="#C74B2A" strokeWidth="1" opacity="0.3" />
                <line x1="35" y1="72" x2="55" y2="90" stroke="#C74B2A" strokeWidth="1" opacity="0.3" />
                <line x1="105" y1="72" x2="85" y2="90" stroke="#C74B2A" strokeWidth="1" opacity="0.3" />
                <line x1="105" y1="72" x2="125" y2="90" stroke="#C74B2A" strokeWidth="1" opacity="0.3" />
              </svg>
            </div>
            <p className="text-xs text-deposly-muted">{orchestrationTypes[2].desc}</p>
          </motion.div>

          {/* Federated */}
          <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Federated</h4>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="140" height="120" viewBox="0 0 140 120">
                {/* System 1 */}
                <rect x="5" y="15" width="38" height="50" rx="6" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
                <circle cx="24" cy="32" r="8" fill="#7C3AED" opacity="0.1" stroke="#7C3AED" strokeWidth="1" />
                <text x="24" y="35" textAnchor="middle" fontSize="7" fill="#7C3AED">S1</text>
                <circle cx="24" cy="52" r="6" fill="#7C3AED" opacity="0.06" stroke="#7C3AED" strokeWidth="1" />
                {/* System 2 */}
                <rect x="51" y="15" width="38" height="50" rx="6" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
                <circle cx="70" cy="32" r="8" fill="#7C3AED" opacity="0.1" stroke="#7C3AED" strokeWidth="1" />
                <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#7C3AED">S2</text>
                <circle cx="70" cy="52" r="6" fill="#7C3AED" opacity="0.06" stroke="#7C3AED" strokeWidth="1" />
                {/* System 3 */}
                <rect x="97" y="15" width="38" height="50" rx="6" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
                <circle cx="116" cy="32" r="8" fill="#7C3AED" opacity="0.1" stroke="#7C3AED" strokeWidth="1" />
                <text x="116" y="35" textAnchor="middle" fontSize="7" fill="#7C3AED">S3</text>
                <circle cx="116" cy="52" r="6" fill="#7C3AED" opacity="0.06" stroke="#7C3AED" strokeWidth="1" />
                {/* Connections */}
                <line x1="43" y1="40" x2="51" y2="40" stroke="#7C3AED" strokeWidth="1.5" opacity="0.5" />
                <line x1="89" y1="40" x2="97" y2="40" stroke="#7C3AED" strokeWidth="1.5" opacity="0.5" />
                {/* Protocol label */}
                <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#7C3AED" opacity="0.7">Shared Protocol</text>
                <line x1="20" y1="82" x2="120" y2="82" stroke="#7C3AED" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
              </svg>
            </div>
            <p className="text-xs text-deposly-muted">{orchestrationTypes[3].desc}</p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 4: Contradiction Detection Deep-Dive
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="Contradiction Detection Deep-Dive"
          badge="Research"
          subtitle="Niche research powering Deposly's approach to inconsistency detection"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {[contradictionResearch.legalWiz, contradictionResearch.contraDoc].map((r) => (
            <motion.div
              key={r.title}
              variants={staggerItem}
              className="border border-deposly-border rounded-xl p-6 bg-white"
            >
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileSearch size={16} className="text-deposly-blue" />
                {r.title}
              </h3>
              <p className="text-sm text-gray-700 mt-2">{r.description}</p>
              <ul className="mt-4 space-y-2">
                {r.keyPoints.map((p, i) => (
                  <li key={i} className="text-sm text-deposly-muted flex items-start gap-2">
                    <span className="text-deposly-blue mt-0.5">&bull;</span> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div
            variants={staggerItem}
            className="p-5 bg-deposly-blue/5 rounded-xl border border-deposly-blue/20 flex items-start gap-3"
          >
            <ShieldCheck size={18} className="text-deposly-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm text-deposly-blue font-medium">
              {contradictionResearch.deposlyApproach}
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 5: Deterministic Calculations via Daytona Sandbox
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="Legal Agent: Deterministic Calculations via Daytona Sandbox"
          badge="Infrastructure"
          subtitle="The LLM identifies entities and dates — Python code does the timeline reconstruction in an isolated sandbox"
        />

        <p className="text-sm text-deposly-muted mb-8 -mt-4">
          In legal analysis there is zero tolerance for error in timeline reconstruction or date calculations. LLMs can hallucinate dates and arithmetic — so we separate the <em>understanding</em> (LLM) from the <em>computation</em> (deterministic code in a sandboxed environment).
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: How it works */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border border-deposly-border rounded-xl p-6 bg-white"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-5 flex items-center gap-2">
              <Layers size={16} className="text-deposly-blue" />
              How it works
            </h3>
            <div className="space-y-4">
              {daytonaSteps.map((s) => (
                <motion.div key={s.step} variants={staggerItem} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-deposly-blue/10 flex items-center justify-center text-deposly-blue text-xs font-bold flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                    <p className="text-xs text-deposly-muted mt-0.5">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Code block */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden border border-gray-700"
          >
            <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2 border-b border-gray-700">
              <Terminal size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-mono">timeline_sandbox.py</span>
              <span className="ml-auto text-[9px] text-gray-500 font-mono">Daytona SDK</span>
            </div>
            <pre className="bg-gray-950 p-5 text-sm font-mono leading-relaxed overflow-x-auto">
              <code className="text-gray-300">
{`from daytona_sdk import Daytona
from datetime import datetime, timedelta

# Initialize isolated sandbox
daytona = Daytona()
sandbox = daytona.create()

# LLM-extracted entities (structured)
events = [
    {"time": "20:45", "event": "Nursing page sent"},
    {"time": "21:15", "event": "Dr. Martinez arrives"},
    {"time": "21:20", "event": "Response logged"},
    {"time": "21:35", "event": "CT scan ordered"},
    {"time": "22:02", "event": "CT completed"},
    {"time": "22:15", "event": "Dr. Chen arrives"},
]

# Deterministic timeline reconstruction
code = """
from datetime import datetime
events = %s
timeline = []
for i, e in enumerate(events):
    t = datetime.strptime(e["time"], "%H:%M")
    if i > 0:
        prev = datetime.strptime(
            events[i-1]["time"], "%H:%M"
        )
        gap = (t - prev).seconds // 60
        e["gap_minutes"] = gap
    timeline.append(e)
print(timeline)
""" % str(events)

# Execute in sandbox — no hallucination
result = sandbox.process.code_run(code)
print(result.output)`}
              </code>
            </pre>
          </motion.div>
        </div>

        {/* Why a sandbox? */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="p-5 bg-deposly-blue/5 rounded-xl border border-deposly-blue/20 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-deposly-blue/10 flex items-center justify-center flex-shrink-0">
            <Database size={20} className="text-deposly-blue" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm mb-1">Why a sandbox?</p>
            <p className="text-sm text-deposly-muted">
              LLM-generated code could contain errors, infinite loops, or access attempts to the host system. Daytona provides a fully isolated execution environment with resource limits, network isolation, and automatic cleanup. The LLM does the <em>thinking</em> — the sandbox does the <em>computing</em> — and never the other way around.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 6: The Data Flywheel
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="The Data Flywheel"
          subtitle="Every deposition processed makes the system smarter — a compounding data advantage"
        />

        <style>{`
          @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-rotate-slow {
            animation: rotate-slow 30s linear infinite;
          }
        `}</style>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-center">
          {/* Left: SVG Flywheel */}
          <div className="flex justify-center">
            <svg width="360" height="360" viewBox="0 0 360 360">
              {/* Background circle */}
              <circle cx="180" cy="180" r="150" fill="none" stroke="#E5E5E5" strokeWidth="2" />

              {/* Rotating outer ring */}
              <g className="animate-rotate-slow" style={{ transformOrigin: "180px 180px" }}>
                <circle cx="180" cy="180" r="140" fill="none" stroke="#4F6EF7" strokeWidth="2" opacity="0.2" strokeDasharray="8 4" />
              </g>

              {/* Connection arcs */}
              <path d="M 180 40 A 140 140 0 0 1 320 180" fill="none" stroke="#4F6EF7" strokeWidth="2" opacity="0.15" />
              <path d="M 320 180 A 140 140 0 0 1 180 320" fill="none" stroke="#2D8B5E" strokeWidth="2" opacity="0.15" />
              <path d="M 180 320 A 140 140 0 0 1 40 180" fill="none" stroke="#C74B2A" strokeWidth="2" opacity="0.15" />
              <path d="M 40 180 A 140 140 0 0 1 180 40" fill="none" stroke="#6B7280" strokeWidth="2" opacity="0.15" />

              {/* Arrow indicators on arcs */}
              <polygon points="316,168 324,180 312,180" fill="#4F6EF7" opacity="0.4" />
              <polygon points="192,316 180,324 180,312" fill="#2D8B5E" opacity="0.4" />
              <polygon points="44,192 36,180 48,180" fill="#C74B2A" opacity="0.4" />
              <polygon points="168,44 180,36 180,48" fill="#6B7280" opacity="0.4" />

              {/* Top node: Depositions / Process */}
              <g>
                <circle cx="180" cy="35" r="28" fill="white" stroke="#4F6EF7" strokeWidth="2" />
                <text x="180" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4F6EF7">Depositions</text>
                <text x="180" y="44" textAnchor="middle" fontSize="8" fill="#6B7280">Process</text>
              </g>

              {/* Right node: Data / Capture */}
              <g>
                <circle cx="325" cy="180" r="28" fill="white" stroke="#2D8B5E" strokeWidth="2" />
                <text x="325" y="177" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2D8B5E">Data</text>
                <text x="325" y="189" textAnchor="middle" fontSize="8" fill="#6B7280">Capture</text>
              </g>

              {/* Bottom node: Better AI / Train */}
              <g>
                <circle cx="180" cy="325" r="28" fill="white" stroke="#C74B2A" strokeWidth="2" />
                <text x="180" y="322" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#C74B2A">Better AI</text>
                <text x="180" y="334" textAnchor="middle" fontSize="8" fill="#6B7280">Train</text>
              </g>

              {/* Left node: Better Service / Improve */}
              <g>
                <circle cx="35" cy="180" r="28" fill="white" stroke="#6B7280" strokeWidth="2" />
                <text x="35" y="174" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">Better</text>
                <text x="35" y="184" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">Service</text>
                <text x="35" y="196" textAnchor="middle" fontSize="8" fill="#6B7280">Improve</text>
              </g>

              {/* Center text */}
              <text x="180" y="172" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1F2937">Data</text>
              <text x="180" y="196" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#4F6EF7">Moat</text>
            </svg>
          </div>

          {/* Right: Explanation cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-deposly-blue/10 flex items-center justify-center">
                  <Play size={14} className="text-deposly-blue" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Compounding Dataset</h4>
              </div>
              <p className="text-sm text-deposly-muted">
                Every deposition processed adds structured facts, entity relationships, and contradiction patterns to the training corpus. The more cases processed, the better the models become at legal-specific tasks.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-deposly-accent/10 flex items-center justify-center">
                  <Network size={14} className="text-deposly-accent" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Embedding Improvement</h4>
              </div>
              <p className="text-sm text-deposly-muted">
                Legal-domain embeddings improve with more case data. Cross-case patterns emerge — similar contradictions, common deposition strategies, and reusable question templates become discoverable through vector similarity.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="border border-deposly-border rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-deposly-coral/10 flex items-center justify-center">
                  <Zap size={14} className="text-deposly-coral" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Network Effects</h4>
              </div>
              <p className="text-sm text-deposly-muted">
                As more attorneys use the platform, the system learns from diverse case types and litigation strategies. This creates a defensible moat — new entrants cannot replicate years of accumulated legal intelligence.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 7: Roadmap
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <SectionHeader
          title="4-Phase Roadmap"
          subtitle="From RAG foundation to predictive intelligence"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {roadmapPhases.map((phase, i) => {
            const s = statusStyle[phase.status];
            const isOpen = expandedPhase === i;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className="border border-deposly-border rounded-xl bg-white overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPhase(isOpen ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-deposly-blue/10 flex items-center justify-center text-deposly-blue text-sm font-bold">
                      {phase.phase}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{phase.title}</span>
                      {phase.badge && (
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${phase.badgeColor}`}>
                          {phase.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 text-xs font-medium ${s.color}`}>
                      {s.icon} {s.label}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-deposly-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-deposly-muted" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-deposly-border pt-4">
                        <ul className="space-y-2">
                          {phase.items.map((item, j) => (
                            <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-deposly-blue mt-0.5">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>
    </div>
  );
}
