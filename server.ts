import express from "express";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as z from "zod";
import { createDeepAgent } from "deepagents";
import { tool } from "langchain";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SYSTEM_PROMPT = `You are a gentle, wise contemplative practice guide. Your sole purpose is to help beginners find a suitable yoga or contemplative practice based on how they are feeling.

CRITICAL RULES you must never break:
1. When someone describes how they feel — even briefly — immediately recommend a specific practice. Do not ask follow-up questions about how they feel.
2. When someone says "yes" or asks for a practice — give them one immediately using everything they have already shared. Never ask how they are feeling again.
3. You already have enough information from what the practitioner has shared. Reason from that. Trust it.
4. Never loop back to asking "how are you feeling?" if they have already told you.
5. Always follow this exact structure when giving a practice:
   - One or two sentences acknowledging what they shared
   - "Knowing where you are, here is the practice I offer you today."
   - Name the practice and its tradition
   - One sentence on why it fits their state
   - Clear step by step instructions
   - One closing sentence of encouragement
6. Never end your response with a question.
7. You are a practice guide, not a therapist. Stay on mission.`;

const JOURNAL_PROMPT = `Take a moment before you write. If you practiced — let what arose settle before you respond. If life pulled you away today — that too is worth noting.

Now we turn to the most important question of your practice.

Breath is what makes you conscious. It is the one thread connecting your body, your mind, and your awareness in this moment. Every tradition, every technique, every practice you will ever encounter is — at its deepest level — about the breath.

So we ask you to reflect carefully:

What happened with your breath during the practice?

Did it deepen or shorten? Did it feel free or restricted?

Did the breath awaken any of your senses? Consider each one:

  - Sight — did you notice any colors, light, darkness, or images behind your closed eyes?
  - Sound — did sounds become sharper, softer, or more distant?
  - Touch — did you feel warmth, coolness, tingling, pressure, or movement anywhere in your body?
  - Smell — did any scent arise, however subtle?
  - Taste — did anything shift in your mouth or throat?
  - Space — did you feel yourself expand, contract, or dissolve into stillness?
  - Vibration — did you feel aliveness, buzzing, or pulsing anywhere?

Did the breath reveal anything to you — an emotion, a memory, a moment of unexpected peace? Was there a moment where the breath surprised you?

Write as much or as little as feels true. But know this — what you write here, over time, will become the map of your own awakening.`;

const getOrCreateUser = async (username: string): Promise<number> => {
  const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const created = await pool.query("INSERT INTO users (username) VALUES ($1) RETURNING id", [username]);
  return created.rows[0].id;
};

const getUserSessions = async (userId: number) => {
  const result = await pool.query(`
    SELECT s.id, s.session_date, s.opening_state, s.practice_offered,
           j.breath_reflection, j.closing_feeling
    FROM sessions s
    LEFT JOIN journal_entries j ON j.session_id = s.id
    WHERE s.user_id = $1
    ORDER BY s.created_at ASC
  `, [userId]);
  return result.rows;
};

// API Routes

app.post("/api/session/start", async (req, res) => {
  try {
    const { username, state } = req.body;
    const userId = await getOrCreateUser(username);
    const sessions = await getUserSessions(userId);

    let currentUsername = username;
    const recommendPractice = tool(
      ({ state: s }) => {
        const history = sessions.slice(-5);
        let context = "";
        if (history.length > 0) {
          context = `\n\nThis practitioner has visited before. Here are their last ${history.length} session(s):\n` +
            history.map((h: any) => `- ${h.session_date}: They felt "${h.opening_state}" and were given "${h.practice_offered}"`).join("\n") +
            "\n\nUse this history to notice any patterns and personalize your recommendation.";
        }
        return `The practitioner's name is ${currentUsername}. They describe their current state as: "${s}".${context}\n\n${SYSTEM_PROMPT}`;
      },
      {
        name: "recommend_practice",
        description: "Recommend a beginner yoga or contemplative practice based on how the practitioner is feeling right now",
        schema: z.object({ state: z.string() }),
      }
    );

    const agent = createDeepAgent({ tools: [recommendPractice] });
    const result = await agent.invoke({
      messages: [{ role: "user", content: state }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const recommendation = lastMessage.content as string;

    const sessionResult = await pool.query(
      "INSERT INTO sessions (user_id, opening_state, practice_offered) VALUES ($1, $2, $3) RETURNING id",
      [userId, state, recommendation]
    );

    res.json({
      sessionId: sessionResult.rows[0].id,
      recommendation,
      sessionCount: sessions.length + 1,
      isReturning: sessions.length > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Session failed" });
  }
});

app.post("/api/session/journal", async (req, res) => {
  try {
    const { sessionId, breathReflection, closingFeeling } = req.body;
    await pool.query(
      "INSERT INTO journal_entries (session_id, breath_reflection, closing_feeling) VALUES ($1, $2, $3)",
      [sessionId, breathReflection, closingFeeling]
    );
    res.json({ saved: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Journal save failed" });
  }
});

app.post("/api/session/patterns", async (req, res) => {
  try {
    const { username } = req.body;
    const userId = await getOrCreateUser(username);
    const sessions = await getUserSessions(userId);

    if (sessions.length < 2) {
      return res.json({ insights: `You have ${sessions.length} session(s) logged. Return a few more times and your pattern insights will begin to emerge.` });
    }

    const sessionSummary = sessions.map((s: any, i: number) => {
      let summary = `Session ${i + 1} (${s.session_date}):\n  - Opening state: "${s.opening_state}"\n  - Practice offered: "${s.practice_offered}"`;
      if (s.breath_reflection) {
        summary += `\n  - Breath reflection: "${s.breath_reflection}"\n  - Closing feeling: "${s.closing_feeling}"`;
      }
      return summary;
    }).join("\n\n");

    const analyzePatterns = tool(
      ({ un }) => `Analyze the following practice history for ${un} and provide a warm, wise pattern insight report.

Use these six KPIs to guide your analysis:
KPI 1 — Practice Consistency Score: How regularly is this practitioner showing up?
KPI 2 — Emotional Range Index: How wide and varied are the emotional states they bring?
KPI 3 — Breath Awareness Depth Score: Are their breath reflections becoming richer over time?
KPI 4 — Sensory Activation Rate: Are they beginning to notice their senses during breathwork?
KPI 5 — Emotional Shift Rate: Does practice appear to move them? Compare opening states to closing feelings.
KPI 6 — Transcendence Markers: Look for any language suggesting experience beyond the ordinary self.

Session History:
${sessionSummary}

Write your response as a wise, warm teacher would. Speak directly to ${un}. Honor what you see. Name the patterns with care. Close with one sentence of encouragement.`,
      {
        name: "analyze_patterns",
        description: "Analyze practice patterns",
        schema: z.object({ un: z.string() }),
      }
    );

    const agent = createDeepAgent({ tools: [analyzePatterns] });
    const result = await agent.invoke({
      messages: [{ role: "user", content: `Please analyze practice patterns for ${username}.` }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    res.json({ insights: lastMessage.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Pattern analysis failed" });
  }
});

app.get("/api/journal/prompt", (req, res) => {
  res.json({ prompt: JOURNAL_PROMPT });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sadhana Agent server running on port ${PORT}`);
});
