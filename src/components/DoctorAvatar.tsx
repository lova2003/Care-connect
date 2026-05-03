import { getInitials } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
  xl: "h-28 w-28 text-3xl",
};

export function DoctorAvatar({ name, size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-serif font-semibold",
        "bg-primary-soft text-primary border border-primary/30",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
