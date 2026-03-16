// Block Blast - How to Play Screen Component
import {
  ArrowLeft,
  HelpCircle,
  Move,
  Trash2,
  Star,
  Lightbulb,
  Grid3X3,
} from "lucide-react";
import { MenuBackground } from "./menu/MenuBackground";
import { BLOCK_COLORS } from "../types/game";

interface HowToPlayScreenProps {
  onBack: () => void;
}

/** Mini block shape for instruction visuals */
function MiniBlock({ shape, color }: { shape: boolean[][]; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      {shape.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-0.5">
          {row.map((cell, colIdx) => (
            <div
              key={colIdx}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: cell ? color : "transparent",
                boxShadow: cell
                  ? "inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "none",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Instruction section component */
function InstructionSection({
  icon: Icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-white/70 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  // Example block shapes for visuals
  const lShape = [
    [true, false],
    [true, false],
    [true, true],
  ];
  const lineShape = [[true, true, true]];
  const squareShape = [
    [true, true],
    [true, true],
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Animated background */}
      <MenuBackground />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Back to menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">How to Play</h1>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 pb-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {/* Goal Section */}
          <InstructionSection
            icon={Grid3X3}
            iconColor="bg-purple-500"
            title="Goal"
          >
            <p>
              Fill an 8×8 grid by placing blocks. Clear lines by completing
              entire rows or columns. The game ends when you can't place any
              more blocks.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <MiniBlock shape={lShape} color={BLOCK_COLORS.blue} />
              <MiniBlock shape={lineShape} color={BLOCK_COLORS.green} />
              <MiniBlock shape={squareShape} color={BLOCK_COLORS.orange} />
            </div>
          </InstructionSection>

          {/* Drag & Drop Section */}
          <InstructionSection
            icon={Move}
            iconColor="bg-blue-500"
            title="Place Blocks"
          >
            <p>
              <strong>Drag</strong> blocks from the tray at the bottom and{" "}
              <strong>drop</strong> them onto the grid. Blocks must fit within
              the grid and not overlap existing blocks.
            </p>
            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="px-2 py-1 bg-white/10 rounded">
                  Touch & hold
                </span>
                <span>→</span>
                <span className="px-2 py-1 bg-white/10 rounded">Drag</span>
                <span>→</span>
                <span className="px-2 py-1 bg-green-500/30 rounded text-green-300">
                  Drop
                </span>
              </div>
            </div>
          </InstructionSection>

          {/* Line Clearing Section */}
          <InstructionSection
            icon={Trash2}
            iconColor="bg-red-500"
            title="Clear Lines"
          >
            <p>
              When you fill a complete <strong>row</strong> or{" "}
              <strong>column</strong>, it clears automatically! Plan your
              placements to clear multiple lines at once.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded animate-pulse" />
              <span className="text-xs text-white/40">Line cleared!</span>
            </div>
          </InstructionSection>

          {/* Scoring Section */}
          <InstructionSection
            icon={Star}
            iconColor="bg-yellow-500"
            title="Scoring"
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">•</span>
                <span>
                  Each block placed:{" "}
                  <strong className="text-white">+1 point per cell</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">•</span>
                <span>
                  Line cleared:{" "}
                  <strong className="text-white">+10 points</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">•</span>
                <span>
                  <strong className="text-orange-400">Combos!</strong> Clear
                  multiple lines at once for bonus points
                </span>
              </li>
            </ul>
          </InstructionSection>

          {/* Tips Section */}
          <InstructionSection
            icon={Lightbulb}
            iconColor="bg-green-500"
            title="Pro Tips"
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400">💡</span>
                <span>Keep the center of the grid clear for flexibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">💡</span>
                <span>Place large blocks first when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">💡</span>
                <span>Try to set up multiple line clears at once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">💡</span>
                <span>Don't let the corners get too crowded</span>
              </li>
            </ul>
          </InstructionSection>

          {/* Got it button */}
          <button
            onClick={onBack}
            className="w-full mt-6 px-8 py-4 rounded-xl font-bold text-lg
              bg-gradient-to-r from-blue-500 to-purple-500 text-white
              shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
              hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Got it!
          </button>
        </div>
      </main>
    </div>
  );
}
