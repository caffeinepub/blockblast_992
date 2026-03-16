// Block Blast - Screen Transition Wrapper Component
import { type ReactNode } from "react";

interface ScreenTransitionProps {
  children: ReactNode;
}

/** Wrapper that adds smooth animation when screens mount - no white flash */
export function ScreenTransition({ children }: ScreenTransitionProps) {
  return (
    <div className="animate-screen-enter min-h-screen">
      {children}
      <style>{`
        @keyframes screen-enter {
          0% {
            opacity: 0.85;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-screen-enter {
          animation: screen-enter 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
