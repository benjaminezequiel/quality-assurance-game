export default defineEventHandler(async (event) => {
  const sessionCode = getRouterParam(event, "code");

  if (!sessionCode) {
    throw createError({ statusCode: 400, message: "Session code is required" });
  }

  const bugs = await db`
    SELECT * FROM bugs
    WHERE session_code = ${sessionCode}
    ORDER BY reported_at DESC
  `;

  return bugs;
});
