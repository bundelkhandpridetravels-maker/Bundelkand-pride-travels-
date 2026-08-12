import { z } from "zod";
import { CONTRACT_PARTY_KINDS, CONTRACT_TYPES } from "@/lib/contracts/model";
import type { CreateContractInput } from "@/lib/contracts/contract-repository";

/**
 * Staff contract intake contract. Registers an agreement that already exists as
 * a real document — it does NOT author one. No clause, term, duration, rate or
 * payment condition is generated anywhere in this module; dates and value are
 * supplied by the operator from the actual signed paperwork.
 *
 * Field shapes mirror the Payload `contracts` collection so the backend swap is
 * a drop-in.
 */

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

/** ISO calendar date (YYYY-MM-DD) — what a date input submits. */
const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker (YYYY-MM-DD).")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a real date.")
  .optional()
  .or(z.literal(""));

export const contractIntakeSchema = z
  .object({
    title: z.string().trim().min(2, "Give the contract a title.").max(200),
    contractType: z.enum(CONTRACT_TYPES),

    partyKind: z.enum(CONTRACT_PARTY_KINDS),
    partyId: z.string().trim().min(1, "Identify the counterparty.").max(120),
    partyName: z.string().trim().min(2, "Enter the counterparty name.").max(160),

    effectiveDate: isoDate,
    expiryDate: isoDate,

    // Commercial terms — optional, founder-visible only. Never defaulted.
    valueAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
    valueCurrency: z.string().trim().length(3, "Use a 3-letter currency code.").toUpperCase().optional().or(z.literal("")),

    notes: optionalText(2000),
  })
  .refine(
    (v) =>
      !v.effectiveDate ||
      !v.expiryDate ||
      new Date(v.expiryDate).getTime() > new Date(v.effectiveDate).getTime(),
    { message: "Expiry must be after the effective date.", path: ["expiryDate"] },
  )
  .refine((v) => v.valueAmount === undefined || Boolean(v.valueCurrency), {
    message: "Select a currency for the contract value.",
    path: ["valueCurrency"],
  });

export type ContractIntake = z.infer<typeof contractIntakeSchema>;

const clean = (v?: string): string | undefined => {
  const t = v?.trim();
  return t ? t : undefined;
};

/** Map validated intake onto the repository's create input. */
export function intakeToContract(input: ContractIntake): CreateContractInput {
  return {
    title: input.title.trim(),
    contractType: input.contractType,
    party: {
      kind: input.partyKind,
      id: input.partyId.trim(),
      name: input.partyName.trim(),
    },
    effectiveDate: clean(input.effectiveDate),
    expiryDate: clean(input.expiryDate),
    value:
      input.valueAmount !== undefined && input.valueCurrency
        ? { amount: input.valueAmount, currency: input.valueCurrency }
        : undefined,
    notes: clean(input.notes),
  };
}
