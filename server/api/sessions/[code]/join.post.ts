export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const { name } = await readBody(event);

  if (!code || !name?.trim()) {
    throw createError({ statusCode: 400, message: "Invalid code or name" });
  }

  const [session] = await db`
    SELECT * FROM sessions WHERE code = ${code}
  `;

  if (!session) {
    throw createError({ statusCode: 404, message: "Session not found" });
  }

  // If a player with the same name exists in this session, return them instead of inserting
  const [player] = await db`
    INSERT INTO players (session_code, name)
    VALUES (${code}, ${name.trim()})
    ON CONFLICT (session_code, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING *
  `;

  return player;
});
