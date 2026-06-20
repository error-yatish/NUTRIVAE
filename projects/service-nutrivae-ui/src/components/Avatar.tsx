import { clsx } from "clsx";

type AvatarProps = { name: string; size?: "sm" | "md" | "lg" };

export function Avatar({ name, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700",
        size === "sm" && "h-8 w-8 text-[11px]",
        size === "md" && "h-10 w-10 text-xs",
        size === "lg" && "h-12 w-12 text-sm"
      )}
    >
      {initials}
    </span>
  );
}
