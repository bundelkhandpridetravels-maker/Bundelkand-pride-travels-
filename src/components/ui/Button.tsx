import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The one button/CTA primitive. Renders a Next <Link> when `href` is set,
 * otherwise a native <button>. Not a client component — so it works in both
 * server and client trees; interactivity (onClick) is supplied by the client
 * component that uses it.
 *
 * Consolidates the gold-CTA / outline / ghost markup that was copy-pasted across
 * the navbar, hero, cards and section CTAs.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // Gold CTA on light or dark surfaces.
  primary: "bg-gold text-ink hover:-translate-y-0.5 hover:bg-gold-bright",
  // Outline on light (paper/bone) surfaces.
  secondary:
    "border border-ink-text/20 text-ink-text hover:border-gold hover:text-ink",
  // Minimal text button.
  ghost: "text-ink-text-2 hover:text-ink-text",
  // Outline on dark (ink) surfaces.
  light: "border border-cream/30 text-cream hover:bg-cream/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-[12.5px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type AsLink = CommonProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type AsButton = CommonProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export default function Button(props: AsLink | AsButton) {
  if (props.href !== undefined) {
    const { variant = "primary", size = "md", className, children, href, ...rest } = props;
    return (
      <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...buttonProps}>
      {children}
    </button>
  );
}
