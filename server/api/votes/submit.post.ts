export default defineEventHandler(async (event) => {
  const { bugId, playerName, severity } = await readBody(event);

  if (!bugId || !playerName || !severity) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  if (severity < 1 || severity > 5) {
    throw createError({
      statusCode: 400,
      message: "Severity must be between 1 and 5",
    });
  }

  const [vote] = await db`
    INSERT INTO votes (bug_id, player_name, severity)
    VALUES (${bugId}, ${playerName}, ${severity})
    ON CONFLICT (bug_id, player_name)
    DO UPDATE SET severity = ${severity}, voted_at = NOW()
    RETURNING *
  `;

  return vote;
});
