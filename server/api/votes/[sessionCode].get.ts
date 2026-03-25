export default defineEventHandler(async (event) => {
  const sessionCode = getRouterParam(event, "sessionCode");
  const playerName = getQuery(event).playerName as string | undefined;

  if (!sessionCode || !playerName) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  // Fetch all votes this player has cast for bugs in this session
  const votes = await db`
    SELECT v.bug_id, v.severity
    FROM votes v
    JOIN bugs b ON b.id = v.bug_id
    WHERE b.session_code = ${sessionCode}
    AND v.player_name = ${playerName}
  `;

  return votes;
});
