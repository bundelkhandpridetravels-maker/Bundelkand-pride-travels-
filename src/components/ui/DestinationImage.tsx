import Image from "next/image";

/**
 * The one image slot used by every destination/package visual.
 *
 * - With `src`: renders an optimised, lazy-loaded next/image (AVIF/WebP,
 *   responsive srcset) that scales on group-hover like the gradient did.
 * - Without `src`: falls back to the cinematic gradient placeholder, so the
 *   site never shows a broken or empty frame while photography is pending.
 *
 * Adding real photography is therefore a data change, not a code change.
 */
export default function DestinationImage({
  src,
  alt,
  gradient,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  className = "",
}: {
  src?: string;
  alt?: string;
  gradient: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${className}`}
        style={{ backgroundImage: gradient }}
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover transition-transform duration-500 group-hover:scale-110 ${className}`}
    />
  );
}
