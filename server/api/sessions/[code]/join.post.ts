export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const { name } = await readBody(event);

  if (!code || !name?.trim()) {
    throw createError({ statusCode: 400, message: "Invalid code or name" });
  }

  // 🔥 CHECK SESSION EXISTS FIRST
  const [session] = await db`
    SELECT * FROM sessions WHERE code = ${code}
  `;

  if (!session) {
    throw createError({ statusCode: 404, message: "Session not found" });
  }

  const [player] = await db`
    INSERT INTO players (session_code, name)
    VALUES (${code}, ${name.trim()})
    RETURNING *
  `;

  return player;
});
