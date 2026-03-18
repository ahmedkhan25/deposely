"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { SectionHeader } from "@/components/SectionHeader";
import { benchmarkInsights } from "@/lib/deposly-data";
import {
  ChevronDown,
  Code2,
  Brain,
  User,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  Layers,
  Zap,
  Scale,
} from "lucide-react";

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ─── Data ────────────────────────────────────────────────────────────────── */

const heroStats = [
  { label: "Typical Per-Trial Success", value: 75, suffix: "%" },
  { label: "pass^3 Reliability", value: 42, suffix: "%" },
  { label: "Orgs Running Offline Evals", value: 52, suffix: "%" },
];

const pyramidLayers = [
  {
    label: "E2E Simulations & Human Review",
    width: "35%",
    color: "#C74B2A",
    count: "~5%",
    description:
      "Full deposition workflow: ingest docs \u2192 extract facts \u2192 detect contradictions \u2192 generate summary. Binary outcome.",
    example: {
      title: "Full Deposition Pipeline",
      code: `Input: 3 case documents + live transcript
Expected: 12 facts extracted, 3 contradictions
  flagged, summary with key admissions
Result: 11/12 facts, 3/3 contradictions, summary complete
Verdict: CONDITIONAL PASS \u2014 attorney review required`,
    },
  },
  {
    label: "Probabilistic Benchmarks / LLM-as-Judge",
    width: "55%",
    color: "#4F6EF7",
    count: "~15%",
    description:
      "Multi-trial evaluation. Run 3-5 times, aggregate. Regression = rate drops, not output changes.",
    example: {
      title: "Outline Quality Scoring",
      code: `Rubric: { theme_relevance: 5, question_quality: 5,
  source_coverage: 5, completeness: 5 }

Trial 1: 17/20 \u2192 PASS
Trial 2: 18/20 \u2192 PASS
Trial 3: 16/20 \u2192 PASS

Majority verdict: PASS (threshold: 15/20)`,
    },
  },
  {
    label: "Component / Integration Tests",
    width: "75%",
    color: "#4ECBA0",
    count: "~30%",
    description:
      "Record-and-replay pattern. Capture real LLM calls, replay deterministically in tests.",
    example: {
      title: "Contradiction Detection Tool Sequence",
      code: `// Recorded fixture: contradiction-detection-medsmal.json
assertToolSequence(replay, [
  "extract_facts",
  "embed_facts",
  "search_documents",
  "compare_statements"
]);
// \u2713 All 4 tools called in correct order`,
    },
  },
  {
    label: "Deterministic Unit Tests",
    width: "100%",
    color: "#2D8B5E",
    count: "~50%",
    description:
      "Fact parsing, entity extraction, confidence thresholds. 100% deterministic, runs on every commit.",
    example: {
      title: "Confidence Threshold Check",
      code: `// Vitest \u2014 runs in milliseconds, every commit
expect(requiresHumanReview(0.84)).toBe(true);
expect(requiresHumanReview(0.85)).toBe(false);

expect(extractDate("March 15th")).toBe("2024-03-15");
expect(classifyFact("BP dropped to 78/50")).toBe("evidence");`,
    },
  },
];

const graderTypes = [
  {
    icon: Code2,
    title: "Code-Based Graders",
    color: "#2D8B5E",
    description:
      "Deterministic. String match, regex, tool call verification. Fast, objective, zero ambiguity.",
    examples: [
      { label: "ENTITY EXTRACTION", code: 'assert extractedEntity === "Dr. Martinez"' },
      { label: "TOOL CALL", code: 'assert lastToolCall.name\n  === "search_documents"' },
      {
        label: "CONFIDENCE",
        code: "assert fact.confidence >= 0.85\n  || fact.flaggedForReview === true",
      },
    ],
    bestFor: "Entity extraction, confidence thresholds, citation validation",
  },
  {
    icon: Brain,
    title: "Model-Based Graders",
    color: "#4F6EF7",
    description:
      "Flexible. LLM-as-judge with rubric scoring. Run 3x with majority vote. 85% alignment with human judgment.",
    examples: [
      {
        label: "RUBRIC SCORE",
        code: "Completeness:  5/5\nAccuracy:      4/5\nFormatting:    5/5\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nTotal: 14/15 \u2192 PASS",
      },
    ],
    bestFor: "Outline quality, summary coherence, contradiction severity assessment",
  },
  {
    icon: User,
    title: "Human Graders",
    color: "#C74B2A",
    description:
      "Gold standard for calibration. Build 150-250 labeled examples. Validate LLM judge against expert assessments.",
    examples: [
      {
        label: "CALIBRATION",
        code: "Attorney reviews\n50 contradiction outputs.\n\nCohen's Kappa vs LLM judge:\n  \u03BA = 0.87 \u2192 Judge reliable",
      },
    ],
    bestFor: "Legal accuracy, contradiction severity, cross-examination strategy",
  },
];

const passAtKData = [
  { k: "k=1", passAtK: 75, passExpK: 42 },
  { k: "k=2", passAtK: 87, passExpK: 42 },
  { k: "k=3", passAtK: 94, passExpK: 42 },
  { k: "k=5", passAtK: 97, passExpK: 42 },
  { k: "k=10", passAtK: 99, passExpK: 42 },
];

const keyMetrics = [
  { label: "Fact Extraction Accuracy", value: 94.2, icon: Target },
  { label: "Contradiction Precision", value: 89.7, icon: Shield },
  { label: "Outline Quality Score", value: 91.3, icon: Layers },
  { label: "Summary Coherence", value: 93.1, icon: Zap },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function EvalsPage() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-deposly-gray">
      <div className="mx-auto max-w-6xl p-8 space-y-16">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center pt-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4 px-4 py-1.5 text-xs font-semibold rounded-full bg-deposly-blue/10 text-deposly-blue tracking-wide uppercase"
          >
            Evaluation Framework
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Evaluating AI Agents
          </h1>
          <p className="text-lg text-deposly-muted max-w-3xl mx-auto leading-relaxed">
            A practical guide to testing, grading, and monitoring AI agents in
            production &mdash; with real deposition preparation examples
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10"
          >
            {heroStats.map((s) => (
              <motion.div
                key={s.label}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-deposly-border p-6 shadow-sm"
              >
                <div className="text-3xl font-bold text-deposly-blue">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-sm text-deposly-muted mt-2">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── Section 1: Testing Pyramid ───────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="The Testing Pyramid"
            badge="Strategy"
            subtitle="Wider at the base = more tests. Narrower at the top = fewer, more expensive tests."
          />

          <div className="flex flex-col items-center gap-3">
            {pyramidLayers.map((layer, i) => (
              <div key={i} style={{ width: layer.width }} className="w-full">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() =>
                    setExpandedLayer(expandedLayer === i ? null : i)
                  }
                  className="w-full rounded-xl border border-deposly-border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="font-semibold text-gray-900 text-sm md:text-base text-left">
                        {layer.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: layer.color + "15",
                          color: layer.color,
                        }}
                      >
                        {layer.count}
                      </span>
                      <motion.div
                        animate={{ rotate: expandedLayer === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-deposly-muted" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {expandedLayer === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-xl bg-deposly-dark text-white p-5">
                        <p className="text-sm text-gray-300 mb-4">
                          {layer.description}
                        </p>
                        <div className="bg-black/30 rounded-lg p-4">
                          <p className="text-xs font-semibold text-deposly-blue mb-2">
                            {layer.example.title}
                          </p>
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {layer.example.code}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-deposly-muted">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#2D8B5E" }}
              />
              Fast &amp; Cheap
            </span>
            <span className="mx-2">&rarr;</span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#C74B2A" }}
              />
              Slow &amp; Expensive
            </span>
          </div>
        </motion.section>

        {/* ── Section 2: Three Grader Types ────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Three Grader Types"
            badge="Grading"
            subtitle="How to evaluate AI outputs with increasing levels of nuance"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {graderTypes.map((g) => {
              const Icon = g.icon;
              return (
                <motion.div
                  key={g.title}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-deposly-border shadow-sm overflow-hidden"
                  style={{ borderTopWidth: 4, borderTopColor: g.color }}
                >
                  <div className="p-6">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: g.color + "15" }}
                    >
                      <Icon size={20} style={{ color: g.color }} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {g.title}
                    </h3>
                    <p className="text-sm text-deposly-muted leading-relaxed mb-4">
                      {g.description}
                    </p>

                    <div className="space-y-3">
                      {g.examples.map((ex) => (
                        <div
                          key={ex.label}
                          className="bg-deposly-dark rounded-lg p-3"
                        >
                          <p className="text-[10px] font-semibold text-deposly-blue uppercase tracking-wider mb-1.5">
                            {ex.label}
                          </p>
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {ex.code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-deposly-gray border-t border-deposly-border">
                    <p className="text-xs text-deposly-muted">
                      <span className="font-semibold text-gray-700">
                        Best for:{" "}
                      </span>
                      {g.bestFor}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        {/* ── Section 3: Can It Do It? vs Can You Trust It? ────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Can It Do It? vs Can You Trust It?"
            badge="Reliability"
            subtitle="The critical distinction between capability and reliability in AI agents"
          />

          {/* Intro card */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-deposly-border p-6 shadow-sm mb-6"
          >
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              AI agents are <strong>non-deterministic</strong>. The same input
              can produce different outputs each time. This means you need two
              separate metrics to understand your system:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-deposly-accent/5 border border-deposly-accent/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-deposly-accent" />
                  <span className="font-semibold text-deposly-accent text-sm">
                    Can it do it at all?
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Does the agent succeed at least once across multiple attempts?
                  This is your <strong>capability</strong> score &mdash;
                  pass@k.
                </p>
              </div>
              <div className="rounded-xl bg-deposly-coral/5 border border-deposly-coral/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-deposly-coral" />
                  <span className="font-semibold text-deposly-coral text-sm">
                    Can I trust it every time?
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Does the agent succeed on <em>every</em> attempt? This is your{" "}
                  <strong>reliability</strong> score &mdash; pass^k.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Two big metric cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6"
          >
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-deposly-border shadow-sm overflow-hidden"
              style={{ borderTopWidth: 4, borderTopColor: "#2D8B5E" }}
            >
              <div className="p-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-deposly-accent mb-3">
                  Capability Score
                </p>
                <div className="text-4xl font-bold text-deposly-accent mb-2">
                  <AnimatedCounter target={98.4} suffix="%" />
                </div>
                <p className="text-sm text-deposly-muted">
                  It works at least once in 3 tries
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-deposly-border shadow-sm overflow-hidden"
              style={{ borderTopWidth: 4, borderTopColor: "#C74B2A" }}
            >
              <div className="p-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-deposly-coral mb-3">
                  Reliability Score
                </p>
                <div className="text-4xl font-bold text-deposly-coral mb-2">
                  <AnimatedCounter target={42.2} suffix="%" />
                </div>
                <p className="text-sm text-deposly-muted">
                  It works every single time
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Warning callout */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl border-l-4 border-deposly-coral p-5 shadow-sm mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="text-deposly-coral flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  Why this matters for depositions
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  When analyzing a witness&apos;s testimony for contradictions
                  against 500 pages of medical records, &ldquo;it usually
                  works&rdquo; isn&apos;t good enough. A missed contradiction in
                  a malpractice case could mean the difference between a $2M
                  settlement and a dismissed claim. You need reliability, not
                  just capability.
                </p>
              </div>
            </div>
          </motion.div>

          {/* pass@k vs pass^k chart */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-deposly-border p-6 shadow-sm"
          >
            <div className="flex items-center gap-6 mb-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-deposly-accent" />
                <span className="text-deposly-muted font-medium">
                  pass@k (Capability)
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-deposly-coral" />
                <span className="text-deposly-muted font-medium">
                  pass^k (Reliability)
                </span>
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={passAtKData} barGap={4}>
                <XAxis
                  dataKey="k"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v, name) => [
                    `${v}%`,
                    name === "passAtK" ? "Capability" : "Reliability",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E5E5",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="passAtK"
                  fill="#2D8B5E"
                  radius={[6, 6, 0, 0]}
                  name="passAtK"
                />
                <Bar
                  dataKey="passExpK"
                  fill="#C74B2A"
                  radius={[6, 6, 0, 0]}
                  name="passExpK"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.section>

        {/* ── Section 4: Legal-Specific Benchmarks ─────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Legal-Specific Benchmarks"
            badge="Research"
            subtitle="Key takeaways from legal AI evaluation research"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {benchmarkInsights.map((b) => (
              <motion.div
                key={b.name}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-deposly-border p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-deposly-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scale size={16} className="text-deposly-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{b.name}</h3>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                      {b.finding}
                    </p>
                    <div className="mt-3 p-3 bg-deposly-blue/5 rounded-lg border border-deposly-blue/20">
                      <p className="text-sm text-deposly-blue font-medium">
                        {b.insight}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── Section 5: Key Metrics ───────────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Key Metrics"
            subtitle="Current performance across Deposly's AI pipeline"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
          >
            {keyMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-deposly-border p-6 shadow-sm text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-deposly-blue/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-deposly-blue" />
                  </div>
                  <div className="text-2xl font-bold text-deposly-blue">
                    <AnimatedCounter target={m.value} suffix="%" />
                  </div>
                  <p className="text-xs text-deposly-muted mt-2">{m.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <div className="h-8" />
      </div>
    </div>
  );
}
