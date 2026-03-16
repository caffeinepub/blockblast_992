// Block Blast - Floating Score Component
// Shows floating "+points" animation when scoring

import { useEffect, useState } from "react";

export interface FloatingScoreItem {
  id: string;
  points: number;
  x: number;
  y: number;
  isCombo?: boolean;
}

export interface FloatingScoreProps {
  items: FloatingScoreItem[];
  onComplete: (id: string) => void;
}

function FloatingScoreNumber({
  item,
  onComplete,
}: {
  item: FloatingScoreItem;
  onComplete: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(item.id);
    }, 800); // Match animation duration
    return () => clearTimeout(timer);
  }, [item.id, onComplete]);

  return (
    <div
      className={`
        absolute pointer-events-none z-50
        font-bold text-xl
        animate-float-up
        ${item.isCombo ? "text-orange-400 text-2xl" : "text-green-400"}
      `}
      style={{
        left: item.x,
        top: item.y,
        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
      }}
    >
      +{item.points}
      {item.isCombo && <span className="ml-1 text-sm">COMBO!</span>}
    </div>
  );
}

export function FloatingScore({ items, onComplete }: FloatingScoreProps) {
  return (
    <>
      {items.map((item) => (
        <FloatingScoreNumber
          key={item.id}
          item={item}
          onComplete={onComplete}
        />
      ))}
    </>
  );
}

// Hook to manage floating scores
export function useFloatingScores() {
  const [scores, setScores] = useState<FloatingScoreItem[]>([]);

  const addScore = (
    points: number,
    x: number,
    y: number,
    isCombo: boolean = false,
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setScores((prev) => [...prev, { id, points, x, y, isCombo }]);
  };

  const removeScore = (id: string) => {
    setScores((prev) => prev.filter((s) => s.id !== id));
  };

  return { scores, addScore, removeScore };
}
