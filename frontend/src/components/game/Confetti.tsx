// Block Blast - Confetti Component
// Celebratory confetti effect for new high scores

import { useEffect, useState, useCallback } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 500, // stagger start
    size: 8 + Math.random() * 8, // 8-16px
    rotation: Math.random() * 360,
  }));
}

export interface ConfettiProps {
  active: boolean;
  duration?: number;
  count?: number;
}

export function Confetti({
  active,
  duration = 3000,
  count = 50,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setPieces(generateConfetti(count));
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setPieces([]);
      }, duration + 500); // Add buffer for animation to complete

      return () => clearTimeout(timer);
    }
  }, [active, count, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${duration}ms ease-in forwards`,
            animationDelay: `${piece.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Hook to control confetti
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
    // Auto-reset after a short delay
    setTimeout(() => setIsActive(false), 100);
  }, []);

  return { isActive, trigger };
}
