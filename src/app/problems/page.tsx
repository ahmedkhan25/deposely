"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import Link from "next/link";

// =============================================================================
// Animation variants
// =============================================================================

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
  visible: { transition: { staggerChildren: 0.15 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const fadeInFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const fadeInFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// =============================================================================
// Problem Section Wrapper
// =============================================================================

function ProblemSection({
  number,
  title,
  description,
  children,
  insight,
  linkTo,
  linkLabel,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
  insight: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={sectionVariants}
    >
      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-deposly-muted mb-2">
        Problem {number}
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm leading-relaxed text-deposly-muted max-w-2xl mb-8">
        {description}
      </p>

      {/* Diagram */}
      <div className="rounded-xl bg-[#1E1E1E] p-8 overflow-x-auto">
        {children}
      </div>

      {/* Insight card */}
      <div className="mt-4 rounded-xl border border-deposly-border bg-white p-5">
        <p className="text-sm leading-relaxed text-deposly-muted">
          <span className="font-semibold text-gray-900">So what? </span>
          {insight}
        </p>
        {linkTo && linkLabel && (
          <Link
            href={linkTo}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-deposly-blue hover:underline"
          >
            {linkLabel}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Diagram 1 — Lost in System Awareness (Animated Pyramid)
// =============================================================================

function SystemAwarenessDiagram() {
  const layers = [
    { label: "AI assistants · agents · tools", maxW: "max-w-sm", delay: 0.3 },
    { label: "emails · code · docs · plans · summaries", maxW: "max-w-md", delay: 0.5 },
    { label: "pipelines · integrations · scheduled agents · background tasks · APIs", maxW: "max-w-lg", delay: 0.7 },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col items-center"
    >
      {/* NASA callout */}
      <motion.div
        variants={fadeInFromLeft}
        className="self-start mb-6 rounded-lg border border-white/30 bg-white/10 px-4 py-3 max-w-xs"
      >
        <p className="text-xs text-white leading-relaxed">
          Astronauts at ISS faced this from mission control below.
        </p>
        <p className="text-xs text-amber-400/80 italic mt-1">
          Now you face it from AI above.
        </p>
      </motion.div>

      {/* You — apex with pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-lg border-2 border-amber-400 bg-amber-500/20 px-8 py-3 text-center mb-3"
      >
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute -inset-1.5 rounded-xl border border-amber-400/30 pointer-events-none"
        />
        <p className="text-sm font-bold text-amber-300">You</p>
        <p className="text-[11px] text-amber-300/80">decision maker</p>
      </motion.div>

      {/* Layers with staggered animation — each wider */}
      {layers.map((layer, i) => (
        <motion.div key={i} className="flex flex-col items-center w-full">
          {/* Animated arrow */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: layer.delay - 0.1, duration: 0.3 }}
            className="origin-top"
          >
            <ArrowDown size={16} className="text-white/40 my-1" />
          </motion.div>

          {/* Layer card */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.5 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: layer.delay, duration: 0.5, ease: "easeOut" as const }}
            className={`w-full ${layer.maxW} rounded-md border border-white/30 bg-white/10 px-6 py-3 text-center`}
          >
            <p className="text-xs text-white">{layer.label}</p>
          </motion.div>
        </motion.div>
      ))}

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.0 }}
        className="mt-5 text-[11px] text-white/60 text-center"
      >
        the pyramid grows automatically — you didn&apos;t ask for most of it
      </motion.p>
    </motion.div>
  );
}

// =============================================================================
// Diagram 2 — Semantic Drift (Procurement Specs)
// =============================================================================

function SemanticDriftDiagram() {
  const rows = [
    {
      person: "Procurement lead",
      spec: '"Lobby chair, COM Grade III,\nhigh-back wing, 24 qty"',
      aiResult: "Spec includes lounge seating,\nno wing profile mentioned",
      drift: "low",
    },
    {
      person: "Project manager",
      spec: '"Lobby seating per arch spec,\nbudget: $120K"',
      aiResult: "Selects cheapest vendor,\nignores design intent",
      drift: "medium",
    },
    {
      person: "Junior buyer",
      spec: '"24 chairs for lobby,\ncopy from last Marriott project"',
      aiResult: "Copies wrong spec entirely,\ndifferent hotel brand standards",
      drift: "high",
    },
  ];

  const driftColors: Record<string, { border: string; bg: string; text: string }> = {
    low: { border: "border-amber-400/50", bg: "bg-amber-400/10", text: "text-amber-300" },
    medium: { border: "border-orange-400/50", bg: "bg-orange-400/10", text: "text-orange-300" },
    high: { border: "border-red-400/50", bg: "bg-red-400/10", text: "text-red-300" },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 mb-4 items-end">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          Person writes spec
        </p>
        <div />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60 text-center">
          AI interprets &amp; generates
        </p>
        <div />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60 text-center">
          Drift level
        </p>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row, i) => {
          const dc = driftColors[row.drift];
          return (
            <motion.div
              key={row.person}
              variants={staggerItem}
              className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-center"
            >
              {/* Person + spec */}
              <div className="rounded-lg border border-teal-400/50 bg-teal-400/10 px-4 py-3">
                <p className="text-xs font-semibold text-teal-300">{row.person}</p>
                <p className="mt-1 text-[11px] text-white/80 whitespace-pre-line leading-relaxed">{row.spec}</p>
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}
              >
                <ArrowRight size={16} className="text-white/40" />
              </motion.div>

              {/* AI output */}
              <div className={`rounded-lg border ${dc.border} ${dc.bg} px-4 py-3`}>
                <p className="text-[11px] text-white/80 whitespace-pre-line leading-relaxed">{row.aiResult}</p>
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 + 0.2, ease: "easeInOut" }}
              >
                <ArrowRight size={16} className="text-white/40" />
              </motion.div>

              {/* Drift indicator */}
              <motion.div
                animate={row.drift === "high" ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`rounded-full border ${dc.border} ${dc.bg} px-4 py-2 text-center`}
              >
                <p className={`text-xs font-bold uppercase ${dc.text}`}>{row.drift} drift</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Drift scale bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-6 origin-left"
      >
        <div className="h-2 rounded-full bg-gradient-to-r from-amber-400/40 via-orange-400/40 to-red-500/60" />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-amber-300/70">original intent</span>
          <span className="text-[10px] text-red-300/70">completely wrong outcome</span>
        </div>
      </motion.div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.0 }}
        className="mt-4 text-[11px] text-white/60 text-center"
      >
        each person writes a slightly different spec — AI amplifies the difference into divergent outcomes
      </motion.p>
    </motion.div>
  );
}

// =============================================================================
// Diagram 3 — Lost in AI Slop (Animated Voices → AI → Flat Output)
// =============================================================================

function AISlopDiagram() {
  const voices = [
    { label: "Your breakthrough idea", color: "border-amber-400/60 bg-amber-400/15 text-amber-300" },
    { label: "Colleague's challenge", color: "border-amber-400/60 bg-amber-400/15 text-amber-300" },
    { label: "Client's real need", color: "border-teal-400/60 bg-teal-400/15 text-teal-300" },
    { label: "Domain expertise", color: "border-teal-400/60 bg-teal-400/15 text-teal-300" },
    { label: "Hard-won context", color: "border-teal-400/60 bg-teal-400/15 text-teal-300" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          Distinct voices entering
        </p>
        <div />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          What people receive
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Left — voices with stagger */}
        <motion.div variants={staggerContainer} className="space-y-2">
          {voices.map((v) => (
            <motion.div
              key={v.label}
              variants={fadeInFromLeft}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className={`rounded-md border px-3 py-2 ${v.color}`}
            >
              <p className="text-xs font-medium">{v.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Center — AI content layer with pulse */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                className="h-px w-6 border-t border-dashed border-white/50"
              />
            ))}
          </div>
          <div className="relative rounded-lg border border-white/30 bg-white/10 px-6 py-6 text-center">
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -inset-1 rounded-xl border border-white/10 pointer-events-none"
            />
            <p className="text-sm font-semibold text-white">AI content</p>
            <p className="text-[11px] text-white/70">layer</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 + 0.5 }}
                className="h-px w-6 border-t border-dashed border-white/50"
              />
            ))}
          </div>
        </motion.div>

        {/* Right — flat output */}
        <motion.div
          variants={fadeInFromRight}
          className="rounded-lg border border-white/30 bg-white/10 p-4 space-y-2"
        >
          <p className="text-[11px] text-white/70 mb-3">
            AI slop — confident, fluent, flat
          </p>
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 3 }} className="h-2 w-4/5 rounded bg-white/20" />
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 3, delay: 0.3 }} className="h-2 w-3/5 rounded bg-white/20" />
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 3, delay: 0.6 }} className="h-2 w-full rounded bg-white/20" />
          {/* The buried insight */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="rounded border border-teal-400/50 bg-teal-400/15 px-3 py-1.5 my-1"
          >
            <p className="text-[11px] font-medium text-teal-300">
              real insight + innovation
            </p>
          </motion.div>
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 3, delay: 0.9 }} className="h-2 w-4/5 rounded bg-white/20" />
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 3, delay: 1.2 }} className="h-2 w-2/3 rounded bg-white/20" />
        </motion.div>
      </div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-[11px] text-white/60 text-center"
      >
        original voices and insight → absorbed, flattened, indistinguishable from filler
      </motion.p>
    </motion.div>
  );
}

// =============================================================================
// Page Root
// =============================================================================

export default function ProblemsPage() {
  return (
    <div className="min-h-screen bg-deposly-gray">
      <div className="mx-auto max-w-4xl p-8 space-y-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Three Problems With AI at Scale
          </h1>
          <p className="mt-2 max-w-2xl text-deposly-muted">
            Every team using AI tools runs into the same structural traps — not
            because the tools are bad, but because the system around them
            wasn&apos;t designed for the person at the top.
          </p>
        </motion.div>

        <ProblemSection
          number="01"
          title="Lost in System Awareness"
          description="As AI tools multiply, the volume of activity happening beneath you grows exponentially. You didn't ask for most of it. But you're responsible for all of it."
          insight="This is why Deposly needs a central orchestrator with human-in-the-loop gates — not a dozen disconnected AI tools each doing their own thing. One system, one place to see what's happening, confidence-based routing to decide what reaches you."
          linkTo="/strategy"
          linkLabel="See Agent Strategy: Intelligence vs Judgment"
        >
          <SystemAwarenessDiagram />
        </ProblemSection>

        <ProblemSection
          number="02"
          title="Semantic Drift"
          description="Three people on the same team write specs for the same Ritz-Carlton lobby chairs. Each writes it slightly differently. AI interprets each version literally — and the gap between original design intent and actual outcome widens at every step."
          insight='This is why deterministic walls matter. The spec should be extracted once, validated against the source document, and locked. Financial calculations run as real Python code in a Daytona sandbox, not LLM inference. The agent writes the code — the sandbox runs it exactly.'
          linkTo="/strategy"
          linkLabel="See Finance Agent: Daytona Sandbox"
        >
          <SemanticDriftDiagram />
        </ProblemSection>

        <ProblemSection
          number="03"
          title="Lost in AI Slop"
          description="Distinct voices — your breakthrough idea, a colleague's challenge, a client's real need — enter an AI content layer and come out the other side as confident, fluent, flat text. The real insight is buried in filler."
          insight="This is why Stripe caps agent CI at 2 rounds and enforces mandatory human review on every PR. Volume without quality gates is noise. Deposly's Blueprint pattern ensures what reaches a human is worth reviewing."
          linkTo="/ai-coding"
          linkLabel="See AI Coding: The Blueprint Pattern"
        >
          <AISlopDiagram />
        </ProblemSection>

        <div className="h-8" />
      </div>
    </div>
  );
}
