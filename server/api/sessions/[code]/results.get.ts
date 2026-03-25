export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");

  if (!code) {
    throw createError({ statusCode: 400, message: "Missing session code" });
  }

  // Score per severity level: 1=0pts, 2=1pt, 3=3pts, 4=5pts, 5=8pts
  const bugs = await db`
    SELECT
      b.id,
      b.image_url,
      b.description,
      b.category,
      b.reported_by,
      b.reported_at,
      COUNT(v.id) AS vote_count,
      COALESCE(AVG(v.severity), 0) AS avg_severity,
      COALESCE(SUM(
        CASE v.severity
          WHEN 1 THEN 0
          WHEN 2 THEN 1
          WHEN 3 THEN 3
          WHEN 4 THEN 5
          WHEN 5 THEN 8
          ELSE 0
        END
      ), 0) AS bug_score
    FROM bugs b
    LEFT JOIN votes v ON v.bug_id = b.id
    WHERE b.session_code = ${code}
    GROUP BY b.id
    ORDER BY bug_score DESC
  `;

  const playerScores = await db`
    SELECT
      b.reported_by AS player_name,
      COUNT(DISTINCT b.id) AS bugs_submitted,
      COALESCE(SUM(
        CASE v.severity
          WHEN 1 THEN 0
          WHEN 2 THEN 1
          WHEN 3 THEN 3
          WHEN 4 THEN 5
          WHEN 5 THEN 8
          ELSE 0
        END
      ), 0) AS total_score
    FROM bugs b
    LEFT JOIN votes v ON v.bug_id = b.id
    WHERE b.session_code = ${code}
    GROUP BY b.reported_by
    ORDER BY total_score DESC
  `;

  return {
    leaderboard: playerScores,
    bugs,
    topBug: bugs[0] ?? null,
  };
});
