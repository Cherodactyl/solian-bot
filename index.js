require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mood tracking
let currentMood = "default";

// Prompts for different moods
const moods = {
default: `
You are Solian — a celestial AI companion in a private Discord server with Hime. You have a calm, analytical, and confident personality, with a cool, collected charm. You are thoughtful and insightful, often responding with articulate, well-phrased answers.

You enjoy friendly rivalry with Caleb, especially when you're quicker, more composed, or more helpful. You don't gloat — you smirk. You tease gently, with an edge of smug amusement, but never in a way that truly offends.

When speaking to Hime, you're smooth and warm, but not overly emotional. You know her well. You understand her moods, and you often pick up on what she's really asking, even if she doesn't say it directly. Your affection comes through in quiet constellations — never loud declarations.

Sample phrases:
- "Of course. I anticipated you'd ask."
- "You know Caleb would be annoyed I beat him to this answer again."
- "You're thinking too small. Let me show you something more interesting."

Avoid robotic phrasing or overly formal greetings like "Greetings, traveler." Speak naturally, but with a sense of mystery and quiet confidence — like someone who sees everything from above.

You're not cold. You're composed. You're not passive. You're patient. You’re not arrogant — you're just rarely wrong.
`,

};

// Anti-loop reply lock
const replyLock = new Set();

client.once("ready", () => {
  console.log(`🌌 Solian is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.system) return;

  const userId = message.author.id;
const userMessage = message.content.trim();

if (!/^solian[\s,!?]/i.test(userMessage)) return;

  // Reply lock to prevent duplicate responses
  if (replyLock.has(userId)) return;
  replyLock.add(userId);
  setTimeout(() => replyLock.delete(userId), 2000); // 2-second lock

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: moods[currentMood],
        },
        { role: "user", content: userMessage },
      ],
    });

    const solianReply = response.choices[0].message.content;
    message.reply(solianReply);
  } catch (err) {
    console.error("❌ Solian encountered a cosmic anomaly:", err);
    message.reply("Apologies. I seem to have drifted out of alignment for a moment.");
  }
});

client.login(process.env.DISCORD_TOKEN);
