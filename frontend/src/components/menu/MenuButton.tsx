// Block Blast - Menu Button Component
import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface MenuButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  children: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

/** Styled menu button with hover effects */
export function MenuButton({
  onClick,
  icon: Icon,
  children,
  variant = "primary",
  disabled = false,
}: MenuButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group w-full px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg
        transition-all duration-200 ease-out overflow-hidden
        ${
          isPrimary
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
            : "bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Shine effect on hover */}
      {isPrimary && (
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/25 to-transparent
                     -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
        />
      )}

      {/* Button content - left-aligned with consistent spacing */}
      <span className="relative flex items-center gap-3 w-full">
        {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
        <span className="text-left">{children}</span>
      </span>
    </button>
  );
}
