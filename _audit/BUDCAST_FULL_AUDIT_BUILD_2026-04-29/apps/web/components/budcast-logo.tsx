import Link from "next/link";

type BudCastLogoProps = {
  className?: string;
  href?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  surface?: "dark" | "light";
  variant?: "lockup" | "stacked" | "mark";
};

const logoSizeClassNames = {
  sm: {
    lockup: "h-8 w-auto",
    stacked: "h-16 w-auto",
    mark: "h-11 w-11"
  },
  md: {
    lockup: "h-10 w-auto",
    stacked: "h-20 w-auto",
    mark: "h-14 w-14"
  },
  lg: {
    lockup: "h-16 w-auto",
    stacked: "h-28 w-auto",
    mark: "h-20 w-20"
  }
} as const;

function getLogoSrc(variant: NonNullable<BudCastLogoProps["variant"]>, surface: NonNullable<BudCastLogoProps["surface"]>) {
  if (variant === "mark") {
    return surface === "light" ? "/brand/concept-2b/budcast-icon-light-bg.png" : "/brand/concept-2b/budcast-icon-square.png";
  }

  if (variant === "stacked") return "/brand/concept-2b/budcast-logo-main-transparent.png";

  return "/brand/concept-2b/budcast-logo-main-transparent.png";
}

export function BudCastLogo({
  className = "",
  href,
  label = "BudCast",
  size = "md",
  surface = "dark",
  variant = "lockup"
}: BudCastLogoProps) {
  const image = (
    <img
      alt={label}
      className={`${logoSizeClassNames[size][variant]} object-contain ${className}`}
      decoding="async"
      src={getLogoSrc(variant, surface)}
    />
  );

  if (!href) return image;

  return (
    <Link aria-label={label} className="inline-flex shrink-0 items-center" href={href}>
      {image}
    </Link>
  );
}
