/**
 * Import validation. Checks required fields and the format of key identifiers
 * (GST, PAN, phone, email) captured in the raw record. Pure.
 */
import type { VendorRecord } from "@/lib/vendor/model";
import type { ImportValidationResult, RawVendorImport } from "@/lib/vendor-import/model";

// India GST and PAN formats.
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_RE = /^[+0-9 ()-]{7,20}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateImport(
  raw: RawVendorImport,
  vendor: Partial<VendorRecord>,
): ImportValidationResult {
  const f = raw.fields;
  const missingFields: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required to become a vendor.
  if (!vendor.businessName) missingFields.push("businessName");
  if (!vendor.type || vendor.type === "other") warnings.push("Vendor type unrecognised — defaulted to 'other'.");

  const phone = f.phone || f.mobile || f.contact;
  const email = f.email;
  if (!phone && !email) missingFields.push("contact (phone or email)");

  // Format checks (only when present).
  if (phone && !PHONE_RE.test(phone.trim())) errors.push("Phone number format looks invalid.");
  if (email && !EMAIL_RE.test(email.trim())) errors.push("Email format looks invalid.");
  if (f.gst && !GST_RE.test(f.gst.trim().toUpperCase())) errors.push("GST number format looks invalid.");
  if (f.pan && !PAN_RE.test(f.pan.trim().toUpperCase())) errors.push("PAN format looks invalid.");

  // Soft completeness warnings.
  if (!vendor.destinations || vendor.destinations.length === 0) warnings.push("No destination captured.");
  if (!f.gst && !f.pan) warnings.push("No GST/PAN captured — verification will be limited.");

  return {
    ok: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
    warnings,
  };
}
