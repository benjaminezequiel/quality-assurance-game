export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const { points } = await readBody(event);

  if (!code) {
    throw createError({ statusCode: 400, message: "Missing session code" });
  }

  if (!Array.isArray(points) || points.length !== 4) {
    throw createError({
      statusCode: 400,
      message: "Game area must have exactly 4 points",
    });
  }

  const [session] = await db`
    UPDATE sessions
    SET game_area = ${JSON.stringify(points)}
    WHERE code = ${code}
    RETURNING *
  `;

  if (!session) {
    throw createError({ statusCode: 404, message: "Session not found" });
  }

  return session;
});
