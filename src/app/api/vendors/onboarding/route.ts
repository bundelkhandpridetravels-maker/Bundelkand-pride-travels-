import {
  intakeToProfile,
  vendorOnboardingIntakeSchema,
} from "@/lib/vendor/onboarding-intake";
import { getVendorOnboardingRepository } from "@/lib/vendor/onboarding-repository";
import {
  evaluateOnboarding,
  isChannelEnabled,
  ONBOARDING_STAGE_LABELS,
} from "@/lib/vendor/onboarding";

/**
 * Staff vendor-onboarding intake.
 *
 * INTERNAL, NOT PUBLIC. This endpoint creates supplier records, so it is gated
 * by the console Basic Auth proxy — `/api/vendors/:path*` is in the proxy
 * matcher (src/proxy.ts) alongside `/dashboard/*`, and fails closed when
 * FOUNDER_DASHBOARD_PASSWORD is unset. Do not move this route out from under
 * that prefix. The public sinks (/api/enquiries, /api/bookings, /api/reviews)
 * are unaffected and remain open by design.
 *
 * Phase 3 accepts the `staff` channel only — a curated, verified-supplier
 * ecosystem is reviewed by the operations team. Phase 4 enables `self_service`
 * and Phase 5 `import` by flipping their flag in ONBOARDING_CHANNELS; this route
 * already refuses anything not enabled.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Channel enforcement — never trust a client-supplied channel.
  if (!isChannelEnabled("staff")) {
    return Response.json(
      { ok: false, error: "Staff onboarding is not enabled." },
      { status: 403 },
    );
  }

  const parsed = vendorOnboardingIntakeSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return Response.json(
      { ok: false, fieldErrors, error: "Please check the highlighted fields." },
      { status: 422 },
    );
  }

  try {
    const profile = intakeToProfile(parsed.data);
    const record = await getVendorOnboardingRepository().create({
      profile,
      channel: "staff",
      assignedTo: parsed.data.assignedTo?.trim() || undefined,
    });

    const evaluation = evaluateOnboarding(profile);

    return Response.json(
      {
        ok: true,
        id: record.id,
        stage: record.stage,
        stageLabel: ONBOARDING_STAGE_LABELS[record.stage],
        completeness: evaluation.completeness,
        blockers: evaluation.blockers,
        // Honest about persistence until the database is connected.
        persisted: false,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Couldn't record the supplier. Please try again." },
      { status: 500 },
    );
  }
}
