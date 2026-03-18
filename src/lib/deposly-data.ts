// ─── Landscape ───────────────────────────────────────────────────────────────

export const landscapeStats = [
  { label: "Legal Professionals Using AI", target: 52, suffix: "%", source: "Thomson Reuters 2025" },
  { label: "Legal AI Market by 2028", target: 12.5, prefix: "$", suffix: "B", source: "Grand View Research" },
  { label: "Time Saved on Doc Review", target: 60, suffix: "%", source: "McKinsey Legal 2024" },
];

export const protocolLayers = [
  {
    name: "AG-UI",
    subtitle: "Agent–User Interface Protocol",
    description:
      "Streams live deposition analysis to the frontend — real-time contradiction flags, transcript updates, and confidence scores rendered as they happen.",
    details: [
      "Server-Sent Events for live transcript streaming",
      "Incremental UI updates as agents process testimony",
      "Confidence-scored contradiction badges in real time",
    ],
  },
  {
    name: "A2A",
    subtitle: "Agent-to-Agent Protocol",
    description:
      "Coordinates multi-agent pipelines: fact extraction → contradiction detection → summary generation, with structured handoffs between specialist agents.",
    details: [
      "Fact Extraction Agent hands structured entities to Contradiction Detector",
      "Contradiction Detector cross-references with Document Ingestion Agent's embeddings",
      "Summary Writer aggregates outputs from all upstream agents",
    ],
  },
  {
    name: "MCP",
    subtitle: "Model Context Protocol",
    description:
      "Connect to case management systems, court databases, and legal research APIs (Westlaw, LexisNexis) through standardized tool interfaces.",
    details: [
      "PostgreSQL MCP for pgvector-powered case search",
      "S3 MCP for document ingestion and retrieval",
      "Future: Westlaw/LexisNexis API connectors, PACER integration",
    ],
  },
];

export const frameworkComparison = [
  { name: "LangGraph", type: "Code-first DAG", strengths: "Fine-grained control, cycles, persistence", legal: "Complex multi-step legal reasoning chains", highlight: false },
  { name: "CrewAI", type: "Role-based agents", strengths: "Natural role definitions, delegation", legal: "Assign attorney / paralegal / researcher roles", highlight: false },
  { name: "OpenAI Agents SDK", type: "Tool-calling agents", strengths: "Native OpenAI integration, Responses API", legal: "Simple tool-calling workflows, GPT-5 access", highlight: false },
  { name: "Google ADK", type: "Multi-agent toolkit", strengths: "A2A protocol, Google ecosystem", legal: "Cross-agent coordination with Google Workspace", highlight: false },
  { name: "CopilotKit", type: "UI-integrated agents", strengths: "AG-UI streaming, React components, CoAgents", legal: "Deposly's current stack — live UI updates during depositions", highlight: true },
];

export const legalLLMTiers = [
  { tier: "Elite", models: "GPT-5, Gemini 2.5 Pro", note: "Highest LegalBench scores but even GPT-5 only hits 84.6% — human review is non-negotiable" },
  { tier: "Strong", models: "o3, Grok 3, Grok 3 Mini", note: "Strong reasoning with cost/latency tradeoffs; o3 excels at multi-step legal analysis" },
  { tier: "Reliable", models: "Claude Opus, Llama 4 Maverick", note: "Good balance of quality and cost; Claude excels at long-context document analysis" },
];

export const legalLLMCallouts = [
  "Best model on LegalBench (GPT-5) only hits 84.6% — human-in-the-loop is non-negotiable",
  "Performance varies wildly by legal task type — a model great at contract interpretation may fail at procedural rule recall",
  "Format compliance matters — legal apps need specific citation styles and document structures",
];

export const embeddingInsight = {
  headline: "General embedding rankings are misleading for legal RAG",
  body: "Gemini Embedding is #1 on MTEB (general) but only #7 on MLEB (legal). Kanon 2 Embedder leads legal retrieval at 4x faster inference than Voyage 3 Large.",
  callout: "Deposly uses pgvector with domain-evaluated embeddings, not generic ones",
  models: [
    { name: "Kanon 2 Embedder", focus: "Legal-specific, fastest inference", rank: "#1 MLEB" },
    { name: "Voyage Law 2", focus: "Harvey partnership, 20B+ tokens US case law", rank: "Top-3 MLEB" },
    { name: "Noxtua Voyage Embed", focus: "European law specialist", rank: "Top-5 MLEB" },
    { name: "Gemini Embedding", focus: "Best general-purpose, weak on legal", rank: "#1 MTEB / #7 MLEB" },
  ],
};

export const glmOcrHighlights = {
  name: "GLM-OCR",
  tagline: "0.9B-param OCR model that beats 235B-parameter models",
  specs: [
    { label: "Parameters", value: "0.9B" },
    { label: "VRAM", value: "<1.5GB" },
    { label: "License", value: "MIT" },
    { label: "OmniDocBench", value: "#1 (94.62)" },
  ],
  keyPoints: [
    "Multi-Token Prediction: ~50% throughput boost over standard autoregressive decoding",
    "RL-trained (GRPO) with task-specific reward functions — goes beyond supervised fine-tuning",
    "Runs 100% locally — privacy-preserving for sensitive legal documents",
  ],
  legalRelevance: [
    "Scanned depositions and handwritten court notes",
    "Legacy documents and faxed exhibits",
    "Privacy-preserving local processing — no data leaves the firm",
  ],
  deployment: ["Ollama", "llama.cpp (GGUF)", "vLLM", "LM Studio", "MLX (Apple Silicon)"],
};

export const marketData = [
  { year: "2023", value: 2.1 },
  { year: "2024", value: 3.4 },
  { year: "2025", value: 5.1 },
  { year: "2026", value: 7.2 },
  { year: "2027", value: 9.8 },
  { year: "2028", value: 12.5 },
];

// ─── Strategy ────────────────────────────────────────────────────────────────

export const automationItems = [
  "Fact extraction from transcripts",
  "Document search & retrieval",
  "Contradiction detection",
  "Outline generation",
  "Timeline construction",
  "Named entity recognition",
];

export const expertItems = [
  "Cross-examination strategy",
  "Witness credibility assessment",
  "Legal theory selection",
  "Settlement negotiation",
  "Ethical judgment calls",
  "Jury perception analysis",
];

export const agentPatterns = [
  { name: "Prompt Chaining", desc: "Sequential LLM calls where each step's output feeds the next" },
  { name: "Routing", desc: "Classify input and direct to specialized handlers" },
  { name: "Parallelization", desc: "Run multiple LLM calls concurrently, aggregate results" },
  { name: "Orchestrator-Workers", desc: "Central agent delegates tasks to specialist agents", highlight: true },
  { name: "Evaluator-Optimizer", desc: "One LLM generates, another evaluates and iterates" },
  { name: "Autonomous Agent", desc: "LLM loops with tools until task is complete" },
];

export const contradictionResearch = {
  legalWiz: {
    title: "LegalWiz (arXiv:2510.03418)",
    description: "Multi-agent framework with 3 coordinated agents — Content Generator, Contradiction Mining (NLI + LLM judge), Human-in-the-Loop",
    keyPoints: [
      "Models 6 structured contradiction types (self-contradictions + pairwise inconsistencies)",
      "Uses Natural Language Inference (NLI) classifiers combined with LLM-as-judge for high precision",
      "Human-in-the-loop validation for legal-grade accuracy",
    ],
  },
  contraDoc: {
    title: "ContraDoc (NAACL 2024)",
    description: "First human-annotated dataset for self-contradictions in long documents",
    keyPoints: [
      "Provides ground truth for evaluating contradiction detection systems",
      "Covers multiple document types including legal and technical writing",
    ],
  },
  deposlyApproach: "Deposly implements contradiction detection using a similar multi-agent approach during live depositions — combining NLI scoring with LLM-based judgment and real-time human review.",
};

export const orchestrationNodes = [
  { id: "orchestrator", label: "Deposition Orchestrator", type: "orchestrator" as const },
  { id: "doc-ingestion", label: "Document Ingestion Agent", desc: "Chunking, embedding, GLM-OCR for scanned docs" },
  { id: "fact-extraction", label: "Fact Extraction Agent", desc: "NER, relation extraction, event extraction" },
  { id: "outline-gen", label: "Outline Generator Agent", desc: "Theme clustering, question generation" },
  { id: "live-depo", label: "Live Depo Agent", desc: "Transcript processing via Recall.ai, real-time analysis" },
  { id: "contradiction", label: "Contradiction Detector Agent", desc: "Cross-reference facts vs testimony (LegalWiz approach)" },
  { id: "summary", label: "Summary Writer Agent", desc: "Key admissions, narrative generation" },
];

export const roadmapPhases = [
  {
    phase: 1,
    title: "RAG Foundation",
    timeline: "Stage 1",
    items: ["Doc ingestion & chunking", "pgvector embeddings (Kanon 2-class)", "Semantic search", "Citation extraction"],
    status: "complete" as const,
  },
  {
    phase: 2,
    title: "Single-Agent Workflows",
    timeline: "Stage 2",
    items: ["Fact extraction", "Outline generation", "Document Q&A", "Template-based summaries"],
    status: "active" as const,
  },
  {
    phase: 3,
    title: "Multi-Agent Orchestration",
    timeline: "Stage 3",
    items: ["Live depo pipeline", "Contradiction detection", "Cross-agent memory", "AG-UI streaming", "Confidence-based HITL"],
    status: "upcoming" as const,
  },
  {
    phase: 4,
    title: "Predictive Intelligence",
    timeline: "Stage 4",
    items: ["Predict contradictions before they happen", "Case strategy recommendations", "Cross-case pattern analysis"],
    status: "upcoming" as const,
  },
];

// ─── Demos ───────────────────────────────────────────────────────────────────

export const depositionTranscript = `Q: Dr. Martinez, can you describe your involvement in the patient's care on the night of March 15th?

A: Yes, I was the attending physician on call that evening. I first saw the patient at approximately 9:15 PM when the nursing staff alerted me to deteriorating vital signs.

Q: And what were those vital signs showing?

A: Blood pressure had dropped to 85 over 55, heart rate was elevated at 118, and oxygen saturation was declining — it was at 91% when I arrived.

Q: What action did you take at that point?

A: I ordered an immediate CT scan and started the patient on IV fluids. I also called for a surgical consult because I suspected internal bleeding based on the abdominal distension.

Q: How long did it take to get the CT scan results?

A: The scan was completed within 20 minutes. Results confirmed a significant retroperitoneal hemorrhage.

Q: And the surgical consult — when did the surgeon arrive?

A: Dr. Chen arrived approximately 45 minutes after my call, around 10:15 PM. There was a delay because she was finishing another procedure.

Q: During that 45-minute wait, did the patient's condition change?

A: Yes, it continued to deteriorate. We had to increase the IV fluid rate and begin a blood transfusion. The patient's blood pressure dropped further to 78 over 50.`;

export const extractedFacts = [
  { text: "Dr. Martinez was attending physician on call", category: "testimony", confidence: 0.97, entity: "Dr. Martinez" },
  { text: "Patient first seen at approximately 9:15 PM", category: "timeline", confidence: 0.95, entity: "9:15 PM" },
  { text: "Blood pressure dropped to 85/55", category: "evidence", confidence: 0.98, entity: "85/55 BP" },
  { text: "Heart rate elevated at 118 BPM", category: "evidence", confidence: 0.96, entity: "118 BPM" },
  { text: "Oxygen saturation at 91%", category: "evidence", confidence: 0.94, entity: "91% O2" },
  { text: "CT scan ordered and completed within 20 minutes", category: "timeline", confidence: 0.93, entity: "CT Scan" },
  { text: "Retroperitoneal hemorrhage confirmed by CT", category: "evidence", confidence: 0.99, entity: "Hemorrhage" },
  { text: "Dr. Chen arrived at approximately 10:15 PM", category: "timeline", confidence: 0.92, entity: "Dr. Chen" },
  { text: "45-minute delay for surgical consult", category: "contradiction", confidence: 0.88, entity: "Delay" },
  { text: "Blood pressure dropped further to 78/50", category: "evidence", confidence: 0.97, entity: "78/50 BP" },
];

export const depoOutline = [
  {
    theme: "Standard of Care — Response Time",
    questions: [
      { q: "What is the hospital's protocol for responding to deteriorating vital signs?", rationale: "Establish baseline standard of care", source: "Hospital Policy Manual" },
      { q: "Was the 45-minute surgical consult delay within acceptable response times?", rationale: "Key liability question — delay during active hemorrhage", source: "Plaintiff Deposition" },
      { q: "Were there other surgeons available who could have responded sooner?", rationale: "Explore alternatives that could have prevented deterioration", source: "Staff Schedule" },
    ],
  },
  {
    theme: "Clinical Decision-Making",
    questions: [
      { q: "Why was a CT scan ordered instead of immediately proceeding to surgery?", rationale: "Challenge whether diagnostic delay was justified", source: "Medical Records" },
      { q: "At what point did you determine internal bleeding was the likely cause?", rationale: "Timeline of clinical reasoning affects liability", source: "Defendant Deposition" },
      { q: "What alternative diagnoses were considered?", rationale: "Thoroughness of differential diagnosis", source: "Medical Records" },
    ],
  },
  {
    theme: "Patient Monitoring During Delay",
    questions: [
      { q: "What monitoring was in place during the 45-minute wait for Dr. Chen?", rationale: "Assess adequacy of interim care", source: "Nursing Notes" },
      { q: "Were any additional interventions considered when BP dropped to 78/50?", rationale: "Explore whether escalation protocols were followed", source: "Medical Records" },
      { q: "Was the patient's family notified of the deteriorating condition?", rationale: "Informed consent and communication obligations", source: "Hospital Policy" },
    ],
  },
  {
    theme: "Causation — Delay and Outcome",
    questions: [
      { q: "In your medical opinion, would earlier surgical intervention have changed the outcome?", rationale: "Direct causation question — central to malpractice claim", source: "Expert Report" },
      { q: "What is the mortality risk increase per hour of untreated retroperitoneal hemorrhage?", rationale: "Quantify the impact of the delay", source: "Medical Literature" },
    ],
  },
];

export const contradictionFlags = [
  {
    id: "c1",
    testimonyText: "I first saw the patient at approximately 9:15 PM",
    conflictingText: "Nursing log shows Dr. Martinez was paged at 8:45 PM but did not respond until 9:20 PM",
    source: "Nursing Station Log, p. 14",
    severity: "critical" as const,
    confidence: 0.91,
  },
  {
    id: "c2",
    testimonyText: "The scan was completed within 20 minutes",
    conflictingText: "Radiology timestamp shows CT ordered at 9:35 PM, completed at 10:02 PM (27 minutes)",
    source: "Radiology Records, p. 3",
    severity: "warning" as const,
    confidence: 0.85,
  },
  {
    id: "c3",
    testimonyText: "Dr. Chen arrived approximately 45 minutes after my call",
    conflictingText: "OR schedule shows Dr. Chen completed her prior procedure at 9:50 PM — arrival at 10:15 PM is only 25 minutes",
    source: "Operating Room Log, p. 7",
    severity: "info" as const,
    confidence: 0.78,
  },
];

export const agentCards = [
  {
    name: "Fact Extractor",
    status: "active" as const,
    fields: [
      { label: "Entities Found", value: 24 },
      { label: "Relations Mapped", value: 18 },
      { label: "Events Identified", value: 7 },
    ],
  },
  {
    name: "Contradiction Detector",
    status: "active" as const,
    fields: [
      { label: "Contradictions Found", value: 3 },
      { label: "Critical", value: 1 },
      { label: "Warnings", value: 2 },
    ],
  },
  {
    name: "Outline Generator",
    status: "complete" as const,
    fields: [
      { label: "Themes Identified", value: 4 },
      { label: "Questions Generated", value: 14 },
    ],
  },
  {
    name: "Summary Writer",
    status: "waiting" as const,
    fields: [
      { label: "Key Admissions", value: 0 },
      { label: "Narrative Sections", value: 0 },
    ],
  },
];

// ─── Case Review ─────────────────────────────────────────────────────────────

export const documentComparisons = [
  {
    name: "Plaintiff Deposition — Dr. Martinez",
    factCount: 12,
    confidence: 0.94,
    badge: "2 Contradictions Found",
    badgeColor: "red" as const,
    facts: [
      { text: "First saw patient at 9:15 PM", category: "timeline", source: "p. 12", confidence: 0.95 },
      { text: "Ordered CT scan immediately upon arrival", category: "testimony", source: "p. 14", confidence: 0.93 },
      { text: "CT completed within 20 minutes", category: "timeline", source: "p. 15", confidence: 0.85 },
      { text: "Called surgical consult at 9:30 PM", category: "testimony", source: "p. 16", confidence: 0.92 },
      { text: "Blood pressure dropped to 78/50 during wait", category: "evidence", source: "p. 18", confidence: 0.97 },
    ],
  },
  {
    name: "Defendant Deposition — Dr. Chen",
    factCount: 9,
    confidence: 0.91,
    badge: "Key Admission",
    badgeColor: "amber" as const,
    facts: [
      { text: "Received consult call while in surgery", category: "testimony", source: "p. 8", confidence: 0.94 },
      { text: "Prior procedure was not emergent", category: "testimony", source: "p. 9", confidence: 0.89 },
      { text: "Arrived at 10:15 PM", category: "timeline", source: "p. 11", confidence: 0.96 },
      { text: "Acknowledged delay could have been shorter", category: "testimony", source: "p. 14", confidence: 0.91 },
    ],
  },
  {
    name: "Medical Records — Metro Hospital",
    factCount: 15,
    confidence: 0.97,
    badge: "Timeline Established",
    badgeColor: "green" as const,
    facts: [
      { text: "Nursing page sent at 8:45 PM", category: "timeline", source: "p. 3", confidence: 0.99 },
      { text: "Dr. Martinez response logged at 9:20 PM", category: "timeline", source: "p. 3", confidence: 0.98 },
      { text: "CT ordered at 9:35 PM, completed 10:02 PM", category: "timeline", source: "p. 7", confidence: 0.99 },
      { text: "Blood transfusion started at 9:55 PM", category: "evidence", source: "p. 9", confidence: 0.97 },
      { text: "OR booked at 10:20 PM", category: "timeline", source: "p. 12", confidence: 0.98 },
    ],
  },
];

export const caseTimeline = [
  { time: "8:45 PM", event: "Nursing staff pages Dr. Martinez", source: "Nursing Log" },
  { time: "9:15 PM", event: "Dr. Martinez reports first seeing patient", source: "Plaintiff Depo" },
  { time: "9:20 PM", event: "Dr. Martinez response logged (per hospital records)", source: "Medical Records" },
  { time: "9:30 PM", event: "Surgical consult requested", source: "Plaintiff Depo" },
  { time: "9:35 PM", event: "CT scan ordered", source: "Radiology Records" },
  { time: "9:55 PM", event: "Blood transfusion initiated", source: "Medical Records" },
  { time: "10:02 PM", event: "CT scan completed — hemorrhage confirmed", source: "Radiology Records" },
  { time: "10:15 PM", event: "Dr. Chen arrives for surgical consult", source: "Both Depositions" },
  { time: "10:20 PM", event: "Operating room booked", source: "OR Log" },
];

export const caseBudget = [
  { category: "Expert Witnesses", amount: 45000 },
  { category: "Depo Costs", amount: 28000 },
  { category: "Doc Review", amount: 18000 },
  { category: "Court Filing", amount: 5200 },
  { category: "Mediation", amount: 12000 },
];

// ─── Evals ───────────────────────────────────────────────────────────────────

export const pyramidLayers = [
  {
    name: "Deterministic",
    pct: "~50%",
    color: "bg-deposly-blue",
    items: ["Fact parsing accuracy", "Date/entity extraction", "Confidence threshold calibration", "Citation format validation"],
  },
  {
    name: "Integration",
    pct: "~30%",
    color: "bg-deposly-accent",
    items: ["RAG retrieval accuracy (recall@10, MRR)", "Tool call sequence validation", "Embedding similarity scoring", "Cross-document linking"],
  },
  {
    name: "Probabilistic",
    pct: "~15%",
    color: "bg-amber-500",
    items: ["LLM-as-judge for outline quality", "Summary coherence scoring", "Majority voting across 3+ evaluations", "Rubric-based grading"],
  },
  {
    name: "E2E Simulations",
    pct: "~5%",
    color: "bg-deposly-coral",
    items: ["Full pipeline: ingest → outline → live depo → contradictions → summary", "Multi-agent coordination testing", "Latency and throughput benchmarks"],
  },
];

export const graderTypes = [
  { name: "Exact Match", use: "Entity extraction", desc: "Binary — extracted entity matches gold standard or it doesn't", icon: "check" as const },
  { name: "Rubric-Based", use: "Outline quality", desc: "Multi-criteria scoring: completeness, relevance, question quality, source coverage", icon: "list" as const },
  { name: "LLM-as-Judge", use: "Summary evaluation", desc: "GPT-5 evaluates coherence, accuracy, and completeness against reference summaries", icon: "brain" as const },
  { name: "Human Review", use: "Legal accuracy", desc: "Attorney review of 150–250 labeled examples for domain-specific correctness", icon: "user" as const },
];

export const benchmarkInsights = [
  {
    name: "LegalBench",
    finding: "162 tasks across 6 reasoning types — issue-spotting, rule-recall, rule-conclusion, rule-application, interpretation, rhetorical understanding",
    insight: "Even the best model (GPT-5) only achieves 84.6% — legal AI must include human review loops.",
  },
  {
    name: "MLEB (Legal Embeddings)",
    finding: "10 datasets, 6 jurisdictions — proves general embedding rankings (MTEB) don't transfer to legal retrieval",
    insight: "Kanon 2 Embedder leads legal retrieval; Gemini Embedding drops from #1 (general) to #7 (legal).",
  },
  {
    name: "Legal RAG Bench (arXiv:2603.01710)",
    finding: "First end-to-end legal RAG benchmark — evaluates retrieval + generation together",
    insight: "Most hallucinations are actually retrieval failures, not generation errors. Fix retrieval first.",
  },
  {
    name: "CaseFacts (Jan 2026)",
    finding: "Tested whether augmenting LLMs with web search improves legal accuracy",
    insight: "Web search DEGRADES legal LLM accuracy — noisy non-authoritative precedents hurt more than they help.",
  },
];

export const evalMetrics = [
  { label: "Fact Extraction Accuracy", value: 94.2 },
  { label: "Contradiction Precision", value: 89.7 },
  { label: "Outline Quality Score", value: 91.3 },
  { label: "Summary Coherence", value: 93.1 },
];

// ─── AI Coding ───────────────────────────────────────────────────────────────

export const codingPipeline = [
  {
    layer: "Trigger",
    desc: 'CLI / API / Web',
    example: 'claude -p "Add contradiction severity scoring to live depo SSE stream"',
  },
  {
    layer: "Devbox",
    desc: "Docker sandbox or AWS EC2",
    example: "Isolated environment with full repo clone, DB access, test suite",
  },
  {
    layer: "Agent Execution",
    desc: "Blueprint pattern — deterministic + agentic alternation",
    example: "Scaffold files (deterministic) → implement logic (agentic) → wire routes (deterministic)",
  },
  {
    layer: "Quality Gates",
    desc: "TypeScript, ESLint, Jest, Semgrep",
    example: "All checks must pass before PR creation — no --no-verify shortcuts",
  },
  {
    layer: "PR Delivery",
    desc: "Templated PR to human engineer",
    example: "Summary, test plan, architecture impact, Co-Authored-By tag",
  },
];

export const mcpTools = [
  { name: "GitHub MCP", desc: "Repository access, PR creation, issue management", status: "available" as const },
  { name: "PostgreSQL MCP", desc: "Neon database queries, pgvector search, schema inspection", status: "available" as const },
  { name: "S3 MCP", desc: "Document upload/download, presigned URL generation", status: "available" as const },
  { name: "Recall.ai MCP", desc: "Transcription bot management, webhook configuration", status: "planned" as const },
  { name: "OpenAI MCP", desc: "Model monitoring, usage tracking, fine-tuning management", status: "planned" as const },
];

export const codingRoadmap = [
  { week: "1", milestone: "Claude Code integration + GitHub MCP", status: "complete" as const },
  { week: "2", milestone: "PostgreSQL MCP + pgvector queries", status: "active" as const },
  { week: "3", milestone: "S3 MCP + document processing pipeline", status: "upcoming" as const },
  { week: "4", milestone: "Recall.ai MCP + live depo tooling", status: "upcoming" as const },
];

// ─── Competitive ─────────────────────────────────────────────────────────────

export const competitors = [
  {
    name: "Deposly",
    features: { transcription: true, contradiction: true, outline: true, rag: true, live: true, summary: true, custom: true, local: true },
    pricing: "TBD",
    badges: ["Open Architecture", "AI-Native", "Full Pipeline"],
    highlight: true,
  },
  {
    name: "SmartDepo (Rev)",
    features: { transcription: true, contradiction: false, outline: false, rag: false, live: false, summary: true, custom: false, local: false },
    pricing: "$1/page",
    badges: [],
    highlight: false,
  },
  {
    name: "Filevine Depo Copilot",
    features: { transcription: true, contradiction: true, outline: false, rag: false, live: true, summary: true, custom: false, local: false },
    pricing: "Custom",
    badges: [],
    highlight: false,
  },
  {
    name: "Lexitas Insights+",
    features: { transcription: true, contradiction: true, outline: false, rag: true, live: false, summary: true, custom: false, local: false },
    pricing: "Bundled",
    badges: [],
    highlight: false,
  },
  {
    name: "Skribe.ai",
    features: { transcription: true, contradiction: false, outline: false, rag: false, live: true, summary: false, custom: false, local: false },
    pricing: "$99–$349/hr",
    badges: [],
    highlight: false,
  },
  {
    name: "AthenaHQ",
    features: { transcription: false, contradiction: false, outline: false, rag: false, live: false, summary: false, custom: false, local: false },
    pricing: "$295–$499/mo",
    badges: [],
    highlight: false,
  },
  {
    name: "Everlaw Story Builder",
    features: { transcription: false, contradiction: false, outline: false, rag: true, live: false, summary: true, custom: false, local: false },
    pricing: "Enterprise",
    badges: [],
    highlight: false,
  },
];

export const featureColumns = [
  { key: "transcription", label: "Real-time Transcription" },
  { key: "contradiction", label: "AI Contradiction Detection" },
  { key: "outline", label: "Depo Outline Generation" },
  { key: "rag", label: "Document RAG/Q&A" },
  { key: "live", label: "Live Depo Analysis" },
  { key: "summary", label: "Post-Depo Summary" },
  { key: "custom", label: "Custom AI Models" },
  { key: "local", label: "Local/Private Processing" },
] as const;

export const competitorDeepDive = [
  {
    name: "SmartDepo (Rev)",
    desc: "Verified page-line citations, human-in-loop summaries, Rev's transcription engine. Acquired by Rev in early 2025. Strengths: proven accuracy with human QA layer. Weakness: no real-time capability, no contradiction detection.",
  },
  {
    name: "Filevine Depo Copilot",
    desc: "Real-time AI insights during depositions, integrated with Filevine case management. Goal tracking, inconsistency flagging, follow-up suggestions. Closest direct competitor to Deposly's live depo feature. Weakness: locked into Filevine ecosystem.",
  },
  {
    name: "Lexitas Insights+",
    desc: "Semantic search, contradiction identification, video analysis with behavioral cues (body language, stress indicators). Unique angle: non-verbal analysis. Weakness: no real-time processing, bundled with Lexitas court reporting.",
  },
  {
    name: "Skribe.ai",
    desc: "Real-time transcription + video indexing, digital reporting focus. Staffed by certified notary for legal compliance. Strength: fast turnaround. Weakness: limited AI analysis beyond transcription.",
  },
];

export const integrationOpportunities = [
  {
    category: "MCP Server",
    items: ["Claude Code / Claude Desktop integration", "Expose case search, document Q&A, depo outlines as MCP tools", "Open-source (Apache 2.0) for community adoption"],
  },
  {
    category: "Court Systems",
    items: ["PACER integration for federal court filings", "State court e-filing API connectors", "Court calendar synchronization"],
  },
  {
    category: "Legal Research",
    items: ["Westlaw API connector", "LexisNexis API connector", "Google Scholar case law search"],
  },
  {
    category: "Case Management",
    items: ["Filevine integration", "Clio integration", "MyCase integration"],
  },
  {
    category: "Transcription",
    items: ["Recall.ai (current)", "AssemblyAI Universal-2", "Deepgram Nova-3"],
  },
];

export const seoKeywords = [
  { keyword: "AI deposition tool", volume: "High", difficulty: "Medium", status: "Target" as const },
  { keyword: "AI deposition preparation", volume: "Medium", difficulty: "Low", status: "Target" as const },
  { keyword: "legal AI contradiction detection", volume: "Low", difficulty: "Low", status: "Opportunity" as const },
  { keyword: "automated deposition summary", volume: "Medium", difficulty: "Medium", status: "Target" as const },
  { keyword: "AI deposition analysis software", volume: "Medium", difficulty: "Medium", status: "Target" as const },
  { keyword: "real-time deposition AI", volume: "Low", difficulty: "Low", status: "Opportunity" as const },
];

// ─── About ───────────────────────────────────────────────────────────────────

export const aboutProfile = {
  name: "Ahmed Khan",
  title: "Senior AI Engineer",
  highlight: "Built the Deposly POC in one day.",
  links: {
    linkedin: "https://linkedin.com/in/ahmedkhan",
    website: "https://ahmedkhan-ai.com",
  },
};

export const valueProps = [
  {
    title: "Legal AI Data Moat",
    desc: "Deposition transcripts + extracted facts = compounding dataset. Every case processed makes the system smarter — embeddings improve, contradiction patterns sharpen, outlines get more relevant.",
  },
  {
    title: "Full-Stack AI Opportunity",
    desc: "Every step from document ingestion to live contradiction detection is an AI problem. RAG, NER, multi-agent orchestration, real-time streaming — this is a complete AI engineering challenge.",
  },
  {
    title: "Minimum Awesome Product",
    desc: "Ship beautifully, iterate quickly. The goal isn't feature completeness — it's a polished experience that demonstrates what AI-native legal tools should feel like.",
  },
];
