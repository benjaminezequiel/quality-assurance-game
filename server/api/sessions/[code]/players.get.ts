export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");

  if (!code) {
    throw createError({ statusCode: 400, message: "Invalid code" });
  }

  const players = await db`
    SELECT * FROM players
    WHERE session_code = ${code}
    ORDER BY created_at ASC
  `;

  return players;
});
