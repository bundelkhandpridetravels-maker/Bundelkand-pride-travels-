import { contractIntakeSchema, intakeToContract } from "@/lib/contracts/contract-intake";
import { getContractRepository } from "@/lib/contracts/contract-repository";
import { CONTRACT_STATUS_LABELS } from "@/lib/contracts/model";
import { daysUntilExpiry } from "@/lib/contracts/renewal";

/**
 * Staff contract-register intake.
 *
 * INTERNAL, NOT PUBLIC. This endpoint creates legal records, so it is gated by
 * the console Basic Auth proxy — `/api/contracts/:path*` is in the proxy matcher
 * (src/proxy.ts) alongside `/dashboard/*` and `/api/vendors/*`, and fails closed
 * when FOUNDER_DASHBOARD_PASSWORD is unset. Do not move this route out from
 * under that prefix. The public sinks (/api/enquiries, /api/bookings,
 * /api/reviews) are unaffected and remain open by design.
 *
 * Every contract is created as a `draft`. Issuing it for signature, recording a
 * signature and terminating it are separate human-approved lifecycle actions —
 * this route cannot perform them.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contractIntakeSchema.safeParse(body);
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
    const contract = await getContractRepository().create(intakeToContract(parsed.data));

    return Response.json(
      {
        ok: true,
        id: contract.id,
        status: contract.status,
        statusLabel: CONTRACT_STATUS_LABELS[contract.status],
        expiryDate: contract.expiryDate ?? null,
        daysUntilExpiry: daysUntilExpiry(contract),
        // The response never echoes commercial terms back to the client.
        hasValue: contract.value !== undefined,
        // Honest about persistence until the database is connected.
        persisted: false,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Couldn't register the contract. Please try again." },
      { status: 500 },
    );
  }
}
