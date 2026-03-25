import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

const db = neon(process.env.DATABASE_URL!);

const SAMPLE_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bi害虫.jpg/320px-Bihai%E8%99%AB.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Hauscricket_aka.jpg/320px-Hauscricker_aka.jpg",
];

const CATEGORIES = [
  "Asset Misplacement",
  "Texture Error",
  "NPC Behaviour",
  "NPC Dialogue",
  "Gameplay System Error",
  "Other",
];

const PLAYERS = ["knch", "Benjamin", "Carmen", "Elliott"];

// Central London coords with small random offset
const londonCoord = (base: number, spread: number) =>
  base + (Math.random() - 0.5) * spread;

const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log("🌱 Seeding test session...");

  // Create session
  const code = "TESTAA";

  await db`DELETE FROM votes WHERE bug_id IN (
    SELECT id FROM bugs WHERE session_code = ${code}
  )`;
  await db`DELETE FROM bugs WHERE session_code = ${code}`;
  await db`DELETE FROM players WHERE session_code = ${code}`;
  await db`DELETE FROM sessions WHERE code = ${code}`;

  await db`INSERT INTO sessions (code) VALUES (${code})`;
  console.log(`✓ Session created: ${code}`);

  // Create players
  for (const name of PLAYERS) {
    await db`INSERT INTO players (session_code, name) VALUES (${code}, ${name})`;
  }
  console.log(`✓ ${PLAYERS.length} players created`);

  // Create bugs — 2 to 4 per player
  let bugCount = 0;
  for (const player of PLAYERS) {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      await db`
        INSERT INTO bugs (
          session_code, image_url, description, category,
          operating_system, reported_by, latitude, longitude
        ) VALUES (
          ${code},
          ${"https://picsum.photos/seed/" + Math.random().toString(36).slice(2) + "/800/600"},
          ${"Found a " + randomItem(CATEGORIES).toLowerCase() + " near the area"},
          ${randomItem(CATEGORIES)},
          ${randomItem(["iOS", "Android", "Windows", "macOS"])},
          ${player},
          ${londonCoord(51.505, 0.02)},
          ${londonCoord(-0.09, 0.03)}
        )
      `;
      bugCount++;
    }
  }
  console.log(`✓ ${bugCount} bugs created`);

  console.log(`\n✅ Done! Join with code: ${code}`);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
