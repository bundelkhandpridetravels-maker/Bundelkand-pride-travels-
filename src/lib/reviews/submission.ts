import { z } from "zod";
import { REVIEW_SOURCES, type ReviewStatus } from "@/lib/reviews/model";

/**
 * Public review submission — the collection contract. Same typed-path pattern as
 * enquiry/booking: the UI never calls fetch directly or knows the backend.
 */
export const reviewSubmissionSchema = z.object({
  rating: z.coerce.number().int().min(1, "Please choose a rating.").max(5),
  authorName: z.string().trim().min(2, "Please enter your name.").max(80),
  authorCity: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().max(120).email("Enter a valid email, or leave it blank.").optional().or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Please share a few words.").max(2000),
  packageSlug: z.string().trim().max(80).optional().or(z.literal("")),
  bookingReference: z.string().trim().max(40).optional().or(z.literal("")),
  source: z.enum(REVIEW_SOURCES).default("onsite"),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;

export type SubmitReviewResult =
  | { ok: true; id: string; status: ReviewStatus }
  | { ok: false; fieldErrors?: Partial<Record<keyof ReviewSubmission, string>>; error?: string };

type ApiResponse = {
  ok?: boolean;
  id?: string;
  status?: ReviewStatus;
  error?: string;
  fieldErrors?: Partial<Record<keyof ReviewSubmission, string>>;
};

export async function submitReview(input: ReviewSubmission): Promise<SubmitReviewResult> {
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse;
    if (!res.ok || !data.ok) {
      return { ok: false, fieldErrors: data.fieldErrors, error: data.error ?? "Something went wrong. Please try again." };
    }
    return { ok: true, id: data.id ?? "", status: data.status ?? "pending" };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
