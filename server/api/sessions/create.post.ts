export default defineEventHandler(async () => {
  const code = generateCode();

  await db`INSERT INTO sessions (code) VALUES (${code})`;

  return { code };
});

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
