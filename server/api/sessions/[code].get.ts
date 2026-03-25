export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");

  const [session] = await db`
    SELECT * FROM sessions WHERE code = ${code}
  `;

  if (!session) {
    throw createError({ statusCode: 404, message: "Session not found" });
  }

  return { code: session.code };
});
