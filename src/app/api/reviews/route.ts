import { reviewSubmissionSchema } from "@/lib/reviews/submission";
import { getReviewRepository } from "@/lib/reviews/review-repository";

/**
 * The one review submission sink. Validates with the shared Zod schema and
 * persists via the repository (console today → Payload/Neon later). New reviews
 * are created `pending` for human moderation before they publish.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = reviewSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return Response.json(
      { ok: false, fieldErrors, error: "Please check the highlighted fields." },
      { status: 422 },
    );
  }

  try {
    const result = await getReviewRepository().submit(parsed.data);
    return Response.json({ ok: true, id: result.id, status: result.status }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Couldn't save your review. Please try again." }, { status: 500 });
  }
}
