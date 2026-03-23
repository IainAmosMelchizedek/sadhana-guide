# Sadhana Guide

**A contemplative practice agent for beginning yoga practitioners.**

Live at: [http://95.216.201.23:3001](http://95.216.201.23:3001)

Built by [Iain Melchizedek](https://github.com/IainAmosMelchizedek) — Safe Passage Technologies

---

## The Problem This Solves

Most yoga and wellness apps assume you already know what you are doing. They offer libraries of poses and sequences, but they do not meet you where you actually are — which for a beginner is often confused, inconsistent, and searching.

This agent is a gentle first guide for people just beginning the journey. It asks how you feel, learns your patterns over time, and recommends a simple starting practice drawn from real traditions — without overwhelming you with choices you are not yet equipped to make.

---

## Philosophy

At the heart of this tool is a single conviction:

**Breath is what makes you conscious.**

It is the one thread connecting body, mind, and awareness in every moment. Every tradition, every technique, every practice — at its deepest level — is about the breath. This agent is designed to teach that truth not through instruction, but through direct experience. By asking the practitioner to reflect on their breath after every session, the tool gradually builds breath awareness as a foundation for all future practice.

---

## Application Flow

### 1. Arrival
Before any question is asked, the practitioner is guided through a brief arrival ritual — a moment of grounding through breath before they describe their state. This distinguishes the tool from every other wellness app and signals from the first moment that this is different.

### 2. State Input
The practitioner describes how they are feeling in plain language — no menus, no checkboxes. The agent accepts whatever they bring.

### 3. Practice Recommendation
Claude reasons from the described state and the practitioner's session history to recommend one specific, tradition-grounded practice. The agent draws from multiple lineages including Vedic, Buddhist, Zen, Tantric, and somatic traditions. It does not match keywords — it reasons about meaning.

### 4. Conversation
The practitioner may continue the conversation after receiving their recommendation. The agent stays on mission as a practice guide throughout.

### 5. Practice Journal
After the session, the practitioner is invited to reflect on their breath experience during the practice. The journal prompt guides them through each of the seven sensory dimensions:

- **Sight** — colors, light, darkness, or images
- **Sound** — sharpening, softening, or distance of sounds
- **Touch** — warmth, coolness, tingling, pressure, or movement
- **Smell** — subtle or strong scents
- **Taste** — shifts in the mouth or throat
- **Space** — expansion, contraction, or dissolution into stillness
- **Vibration** — aliveness, buzzing, or pulsing

The practitioner is also asked how they feel after the practice — compared against how they felt coming in.

### 6. Pattern Insights
At any point during a session, the practitioner may request a pattern analysis. Claude reasons across the full session history and produces a warm, teacher-like insight report evaluated against six KPIs.

---

## The Six KPIs

These KPIs are not measured through keyword matching or numerical scoring alone. Claude reasons about meaning — understanding context, emotion, and experience the way a teacher would.

### KPI 1 — Practice Consistency Score
**What it measures:** How regularly the practitioner shows up.

**Formula:** Sessions completed in the last 30 days ÷ 30

A score of 1.0 means daily practice. A score of 0.5 means every other day. Consistency is the single most reliable predictor of long-term growth in contemplative practice.

---

### KPI 2 — Emotional Range Index
**What it measures:** The breadth and variety of emotional states the practitioner brings to practice — a proxy for growing self-awareness.

**Formula:** Number of distinct emotional states described ÷ total sessions

A practitioner who always arrives feeling "anxious" has a narrow range. One who arrives feeling closed, fearful, shaky, grateful, still, and expansive across sessions is developing genuine emotional literacy.

---

### KPI 3 — Breath Awareness Depth Score
**What it measures:** The richness and detail of breath journal entries over time.

**Formula:** Average word count of breath journal entries across all sessions, combined with Claude's qualitative assessment of observational depth.

Short entries early in practice are expected. Longer, more specific entries over time indicate that the practitioner is genuinely paying attention to breath — the core purpose of the tool.

---

### KPI 4 — Sensory Activation Rate
**What it measures:** Whether the practitioner is beginning to notice their senses during breathwork — a sign that contemplative awareness is developing.

**Formula:** Percentage of journal entries that reference at least one of the seven sensory dimensions (sight, sound, touch, smell, taste, space, vibration).

Claude does not match exact words — it identifies sensory language by meaning. "I saw blue and purple" counts for sight. "I felt like I disappeared into something vast" counts for space.

---

### KPI 5 — Emotional Shift Rate
**What it measures:** Whether practice actually moves the practitioner — the most direct measure of the tool's effectiveness.

**Formula:** Percentage of sessions where the closing feeling (post-practice) meaningfully differs from the opening state (pre-practice).

Claude compares the opening state against the closing feeling and reasons about whether a genuine shift occurred. "I came in anxious and left calm" is a positive shift. "I came in heavy and left heavy" is not.

---

### KPI 6 — Transcendence Markers
**What it measures:** How often the practitioner reports experiences that point beyond ordinary self-awareness — expansion, dissolution, peace, vastness, or a sense of something greater.

**Formula:** Percentage of journal entries containing language of transcendence, as assessed by Claude through meaning rather than keyword matching.

This KPI is unique to this tool. No other wellness application measures this dimension of contemplative experience. Examples of transcendence language that Claude identifies: "I felt something beyond spirituality," "I disappeared into something vast," "my breath moved up and down my spine," "I tasted cake and rainbows" (recognized as synesthetic dissolution of sensory boundaries).

---

## Technical Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v20 |
| Language | TypeScript |
| AI Framework | LangChain + DeepAgents |
| AI Model | Anthropic Claude (claude-sonnet) |
| Web Server | Express.js |
| Database | PostgreSQL 16 |
| Hosting | Hetzner Cloud (Helsinki) |
| Process Manager | PM2 |

---

## Architecture

The application is a single Express server (`server.ts`) serving a static HTML frontend (`public/index.html`) and three API endpoints:

- `POST /api/session/start` — creates or retrieves a user, runs the practice recommendation agent, saves the session to PostgreSQL
- `POST /api/session/journal` — saves the breath reflection and closing feeling to the journal_entries table
- `POST /api/session/patterns` — runs the pattern analysis agent across the full session history and returns a KPI insight report
- `GET /api/journal/prompt` — returns the breath awareness journal prompt

### Database Schema

```sql
users (id, username, created_at)
sessions (id, user_id, session_date, opening_state, practice_offered, created_at)
journal_entries (id, session_id, breath_reflection, closing_feeling, created_at)
```

---

## Design Principles

The interface was designed to embody the practice itself — clean, still, unhurried. No emojis, no clutter, no noise. Typography drawn from serif tradition. A muted, warm palette. Every element communicates calm before the user reads a single word.

---

## About

This tool was built by Iain Melchizedek under the banner of Safe Passage Technologies.

**Building tools that go beyond spirituality.**

The Sadhana Guide is one demonstration of a broader principle: that AI agents can carry genuine philosophical depth, not just functional utility.

&copy; 2026 Iain Melchizedek — Safe Passage Technologies. All rights reserved.
