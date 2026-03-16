// Block Blast - Game Logo Component
import { BLOCK_COLORS } from "../../types/game";

/** Game logo with blocky 3D text effect and entrance animation */
export function GameLogo() {
  return (
    <div className="flex flex-col items-center gap-2 animate-logo-entrance">
      {/* Main title */}
      <div className="relative">
        {/* Shadow layer */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight select-none"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px rgba(0,0,0,0.3)",
            transform: "translate(4px, 4px)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          BLOCK
        </h1>
        {/* Main text */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight select-none relative"
          style={{
            background: `linear-gradient(180deg, ${BLOCK_COLORS.cyan} 0%, ${BLOCK_COLORS.blue} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 40px rgba(59, 130, 246, 0.5)",
            filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.3))",
          }}
        >
          BLOCK
        </h1>
      </div>

      <div className="relative">
        {/* Shadow layer */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight select-none"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px rgba(0,0,0,0.3)",
            transform: "translate(4px, 4px)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          BLAST
        </h1>
        {/* Main text */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight select-none relative animate-pulse-glow"
          style={{
            background: `linear-gradient(180deg, ${BLOCK_COLORS.orange} 0%, ${BLOCK_COLORS.red} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 40px rgba(239, 68, 68, 0.5)",
            filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.3))",
          }}
        >
          BLAST
        </h1>
      </div>

      {/* Decorative blocks under the title */}
      <div className="flex gap-1.5 mt-4">
        {[
          BLOCK_COLORS.red,
          BLOCK_COLORS.orange,
          BLOCK_COLORS.yellow,
          BLOCK_COLORS.green,
          BLOCK_COLORS.cyan,
          BLOCK_COLORS.blue,
          BLOCK_COLORS.purple,
        ].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm animate-bounce"
            style={{
              backgroundColor: color,
              boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3), 0 0 10px ${color}40`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 2px 0 rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(239, 68, 68, 0.4));
          }
          50% {
            filter: drop-shadow(0 2px 0 rgba(0,0,0,0.3)) drop-shadow(0 0 30px rgba(239, 68, 68, 0.6));
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes logo-entrance {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          60% {
            transform: scale(1.05) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-logo-entrance {
          animation: logo-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
