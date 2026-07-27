"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import {
  reviewSubmissionSchema,
  submitReview,
  type ReviewSubmission,
} from "@/lib/reviews/submission";
import { googleReviewUrl } from "@/lib/reviews/google";

type Errors = Partial<Record<keyof ReviewSubmission, string>>;

const inputClass =
  "w-full rounded-lg border border-line bg-bone px-3.5 py-2.5 text-[14px] text-ink-text outline-none transition-colors focus:border-gold";

export default function ReviewForm({
  packageSlug = "",
  bookingReference = "",
}: {
  packageSlug?: string;
  bookingReference?: string;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorCity, setAuthorCity] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: ReviewSubmission = {
      rating,
      authorName,
      authorCity,
      email,
      title,
      body,
      packageSlug,
      bookingReference,
      source: "onsite",
    };
    const check = reviewSubmissionSchema.safeParse(payload);
    if (!check.success) {
      const errs: Errors = {};
      for (const issue of check.error.issues) {
        const k = issue.path[0];
        if (typeof k === "string" && !errs[k as keyof ReviewSubmission]) {
          errs[k as keyof ReviewSubmission] = issue.message;
        }
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const res = await submitReview(check.data);
    setSubmitting(false);
    if (res.ok) setDone(true);
    else setErrors(res.fieldErrors ?? { body: res.error });
  }

  if (done) {
    const gUrl = googleReviewUrl();
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <Badge variant="pine" className="mx-auto">Thank you</Badge>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink-text">
          Thank you for your review!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-text-2">
          Your feedback has been received and will appear once our team reviews it. It means a lot to us.
        </p>
        {gUrl && (
          <div className="mt-6">
            <Button href={gUrl} variant="primary">Also review us on Google</Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl p-6 sm:p-7">
      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Rating */}
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Your rating</span>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                aria-checked={rating === i}
                role="radio"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className={cn(
                  "text-2xl leading-none transition-colors",
                  (hover || rating) >= i ? "text-gold" : "text-line hover:text-gold/50",
                )}
              >
                ★
              </button>
            ))}
          </div>
          {errors.rating && <span className="mt-1 block text-[12px] font-medium text-red-600">{errors.rating}</span>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Your name</span>
            <input className={inputClass} value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            {errors.authorName && <span className="mt-1 block text-[12px] font-medium text-red-600">{errors.authorName}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-text">City (optional)</span>
            <input className={inputClass} value={authorCity} onChange={(e) => setAuthorCity(e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Email (optional)</span>
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <span className="mt-1 block text-[12px] font-medium text-red-600">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Title (optional)</span>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A wonderful trip" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Your review</span>
          <textarea rows={4} className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell other travellers about your experience…" />
          {errors.body && <span className="mt-1 block text-[12px] font-medium text-red-600">{errors.body}</span>}
        </label>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
