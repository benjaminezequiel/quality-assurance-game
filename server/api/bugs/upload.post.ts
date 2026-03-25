import { put } from "@vercel/blob";

export default defineEventHandler(async (event) => {
  const form = await readFormData(event);

  const image = form.get("image") as File | null;
  const sessionCode = form.get("sessionCode") as string | null;
  const description = form.get("description") as string | null;
  const category = form.get("category") as string | null;
  const operatingSystem = form.get("operatingSystem") as string | null;
  const reportedBy = form.get("reportedBy") as string | null;
  const latitude = form.get("latitude") as string | null;
  const longitude = form.get("longitude") as string | null;

  if (!image || !sessionCode || !description || !category || !reportedBy) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  // Verify session exists before uploading anything
  const [session] = await db`
    SELECT code FROM sessions WHERE code = ${sessionCode}
  `;

  if (!session) {
    throw createError({ statusCode: 404, message: "Session not found" });
  }

  const arrayBuffer = await image.arrayBuffer();

  const { url } = await put(
    `bugs/${sessionCode}/${Date.now()}.jpg`,
    Buffer.from(arrayBuffer),
    {
      access: "public",
      contentType: "image/jpeg", // force correct type regardless of what mobile sent
    },
  );

  // Insert bug into database
  const [bug] = await db`
    INSERT INTO bugs (
      session_code,
      image_url,
      description,
      category,
      operating_system,
      reported_by,
      latitude,
      longitude
    ) VALUES (
      ${sessionCode},
      ${url},
      ${description},
      ${category},
      ${operatingSystem ?? null},
      ${reportedBy},
      ${latitude ? parseFloat(latitude) : null},
      ${longitude ? parseFloat(longitude) : null}
    )
    RETURNING *
  `;

  return bug;
});
