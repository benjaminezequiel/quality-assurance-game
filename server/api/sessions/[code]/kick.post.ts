export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const { playerId } = await readBody(event);

  if (!code || !playerId) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  await db`
    DELETE FROM players
    WHERE id = ${playerId} AND session_code = ${code}
  `;

  return { success: true };
});
