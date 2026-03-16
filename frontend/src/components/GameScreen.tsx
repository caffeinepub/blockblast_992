// Block Blast - Game Screen Component
import { useEffect, useRef, useState, useCallback } from "react";
import { Grid } from "./game/Grid";
import { Tray } from "./game/Tray";
import { ScoreDisplay } from "./game/ScoreDisplay";
import { GameOverOverlay } from "./game/GameOverOverlay";
import { BlockShape } from "./game/DraggableBlock";
import { FloatingScore, useFloatingScores } from "./game/FloatingScore";
import { Confetti, useConfetti } from "./game/Confetti";
import { useGameState } from "../hooks/useGameState";
import { useDragDrop } from "../hooks/useDragDrop";
import { useSounds } from "../hooks/useSounds";
import { useHaptics } from "../hooks/useHaptics";
import {
  DnDProvider,
  useDropZone,
  DragOverlay,
  useDnDContext,
} from "../lib/dnd";
import { getBlockCells } from "../game/gameLogic";
import { type Block, type Position } from "../types/game";

interface GameContentProps {
  onGameActiveChange?: (isActive: boolean) => void;
}

/** Inner game content that uses DnD context */
function GameContent({ onGameActiveChange }: GameContentProps) {
  const {
    grid,
    score,
    highScore,
    tray,
    gameOver,
    lastLinesCleared,
    comboCount,
    placeBlock,
    restartGame,
    clearLinesAnimationDone,
  } = useGameState();

  const { dragState } = useDnDContext();

  // Sound and haptic feedback
  const { play: playSound } = useSounds();
  const haptics = useHaptics();

  // Floating scores for points animation
  const {
    scores: floatingScores,
    addScore: addFloatingScore,
    removeScore,
  } = useFloatingScores();

  // Confetti for high score celebration
  const confetti = useConfetti();

  // Grid container ref for positioning floating scores
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Track previous score to calculate points earned
  const prevScoreRef = useRef(score);
  const prevLinesRef = useRef<typeof lastLinesCleared>([]);

  // Wrap placeBlock to add sound/haptic feedback and floating scores
  const placeBlockWithFeedback = useCallback(
    (block: Block, position: Position): boolean => {
      const success = placeBlock(block, position);
      if (success) {
        playSound("blockPlace");
        haptics.blockPlace();
      }
      return success;
    },
    [placeBlock, playSound, haptics],
  );

  // Use drag drop hook - it manages the grid element reference internally
  const {
    previewPosition,
    previewBlock,
    canDrop,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setGridRef,
    getCellSize,
  } = useDragDrop(grid, placeBlockWithFeedback);

  // Track cell size for tray blocks - updated on mount and resize
  const [trayCellSize, setTrayCellSize] = useState(40);

  const updateTrayCellSize = useCallback(() => {
    setTrayCellSize(getCellSize());
  }, [getCellSize]);

  // Update tray cell size after a short delay to ensure grid is mounted
  useEffect(() => {
    const timer = setTimeout(updateTrayCellSize, 50);
    return () => clearTimeout(timer);
  }, [updateTrayCellSize]);

  // Also update on window resize
  useEffect(() => {
    window.addEventListener("resize", updateTrayCellSize);
    return () => {
      window.removeEventListener("resize", updateTrayCellSize);
    };
  }, [updateTrayCellSize]);

  // Track initial high score to detect new high score
  const initialHighScoreRef = useRef(highScore);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Detect new high score when game ends
  useEffect(() => {
    if (gameOver && score > initialHighScoreRef.current) {
      setIsNewHighScore(true);
      playSound("newHighScore");
      haptics.newHighScore();
      confetti.trigger();
    }
  }, [gameOver, score, playSound, haptics, confetti]);

  // Play game over sound
  useEffect(() => {
    if (gameOver && score <= initialHighScoreRef.current) {
      playSound("gameOver");
      haptics.gameOver();
    }
  }, [gameOver, score, playSound, haptics]);

  // Handle line clear sounds and haptics
  useEffect(() => {
    if (lastLinesCleared.length > 0 && prevLinesRef.current.length === 0) {
      const isCombo = comboCount > 1;
      if (isCombo) {
        playSound("comboClear");
        haptics.combo();
      } else {
        playSound("lineClear");
        haptics.lineClear();
      }
    }
    prevLinesRef.current = lastLinesCleared;
  }, [lastLinesCleared, comboCount, playSound, haptics]);

  // Show floating score when points are earned
  useEffect(() => {
    const pointsEarned = score - prevScoreRef.current;
    if (pointsEarned > 0 && gridContainerRef.current) {
      // Use container-relative coordinates since FloatingScore is positioned
      // absolute within the gridContainerRef
      const rect = gridContainerRef.current.getBoundingClientRect();
      const x = rect.width / 2 - 30; // Center of container
      const y = rect.height / 2;
      addFloatingScore(pointsEarned, x, y, comboCount > 1);
    }
    prevScoreRef.current = score;
  }, [score, comboCount, addFloatingScore]);

  // Reset new high score flag when restarting
  const handleRestart = useCallback(() => {
    initialHighScoreRef.current = highScore;
    setIsNewHighScore(false);
    playSound("buttonClick");
    restartGame();
  }, [highScore, playSound, restartGame]);

  // Keyboard shortcut: R to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (gameOver) {
          handleRestart();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, handleRestart]);

  // Clear lines animation timeout
  useEffect(() => {
    if (lastLinesCleared.length > 0) {
      const timer = setTimeout(() => {
        clearLinesAnimationDone();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [lastLinesCleared, clearLinesAnimationDone]);

  // Report game active state to parent
  // Game is active if score > 0 and game is not over
  useEffect(() => {
    const isActive = score > 0 && !gameOver;
    onGameActiveChange?.(isActive);
  }, [score, gameOver, onGameActiveChange]);

  // Setup drop zone for the grid
  const { dropZoneProps } = useDropZone<Block>({
    id: "game-grid",
    accept: "block",
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    canDrop: () => true,
  });

  // Calculate preview cells
  const previewCells =
    previewPosition && previewBlock
      ? getBlockCells(previewBlock, previewPosition)
      : [];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 sm:px-6 pt-4 pb-6 sm:pb-8 safe-area-inset-top safe-area-inset-bottom gap-4 sm:gap-6">
      {/* Score Display */}
      <ScoreDisplay
        score={score}
        highScore={highScore}
        comboCount={comboCount}
      />

      {/* Game Grid */}
      <div
        ref={gridContainerRef}
        className="flex-1 flex items-center justify-center relative min-h-0"
      >
        <div
          {...dropZoneProps}
          ref={(el) => {
            dropZoneProps.ref(el);
            setGridRef(el);
          }}
          className="w-full max-w-[min(100%,400px)] aspect-square"
        >
          <Grid
            grid={grid}
            previewCells={previewCells}
            previewColor={previewBlock?.color}
            canDrop={canDrop && dragState.isDragging}
            clearingLines={lastLinesCleared}
            isDimmed={gameOver}
          />
        </div>

        {/* Floating Scores */}
        <FloatingScore items={floatingScores} onComplete={removeScore} />
      </div>

      {/* Block Tray - fixed height to prevent scrollbar and enable vertical scaling */}
      <div className="h-28 sm:h-32 flex-shrink-0">
        <Tray tray={tray} cellSize={trayCellSize} />
      </div>

      {/* Confetti for new high score */}
      <Confetti active={confetti.isActive} />

      {/* Game Over Overlay */}
      {gameOver && (
        <GameOverOverlay
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
        />
      )}

      {/* Drag Overlay - renders the dragged block following cursor */}
      {/* Uses same getCellSize as useDragDrop for perfect alignment */}
      <DragOverlay scale={1} opacity={0.85} dropShadow centered>
        {(payload) => {
          const block = payload as Block;
          // Calculate cell size using same function as useDragDrop
          const cellSize = getCellSize();
          return <BlockShape block={block} cellSize={cellSize} />;
        }}
      </DragOverlay>
    </div>
  );
}

interface GameScreenProps {
  onGameActiveChange?: (isActive: boolean) => void;
}

/** Main Game Screen with DnD Provider */
export function GameScreen({ onGameActiveChange }: GameScreenProps) {
  return (
    <DnDProvider>
      <GameContent onGameActiveChange={onGameActiveChange} />
    </DnDProvider>
  );
}
