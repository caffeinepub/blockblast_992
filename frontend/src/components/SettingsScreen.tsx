// Block Blast - Settings Screen Component
import { useState } from "react";
import {
  ArrowLeft,
  Settings,
  Palette,
  Check,
  Volume2,
  Music,
  Vibrate,
  Trash2,
} from "lucide-react";
import { MenuBackground } from "./menu/MenuBackground";
import { useTheme, THEMES, type ThemeId } from "../hooks/useTheme";
import { useSettings } from "../hooks/useSettings";
import { ConfirmDialog } from "./ConfirmDialog";

interface SettingsScreenProps {
  onBack: () => void;
}

function ThemeOption({
  themeId,
  isSelected,
  onSelect,
}: {
  themeId: ThemeId;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = THEMES[themeId];

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full p-4 rounded-xl border transition-all duration-200
        ${
          isSelected
            ? "border-white/40 bg-white/10 scale-[1.02]"
            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Theme preview */}
        <div
          className={`
          w-12 h-12 rounded-lg bg-gradient-to-br ${theme.background}
          border border-white/20 flex items-center justify-center
        `}
        >
          <div className={`w-4 h-4 rounded bg-gradient-to-r ${theme.accent}`} />
        </div>

        {/* Theme name */}
        <div className="flex-1 text-left">
          <div className="text-white font-medium">{theme.name}</div>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

/** Toggle switch component */
function ToggleSwitch({
  enabled,
  onToggle,
  label,
  icon: Icon,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon
          className={`w-5 h-5 ${enabled ? "text-white" : "text-white/40"}`}
        />
        <span
          className={`font-medium ${enabled ? "text-white" : "text-white/60"}`}
        >
          {label}
        </span>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`
          relative w-12 h-7 rounded-full transition-colors duration-200
          ${enabled ? "bg-green-500" : "bg-white/20"}
        `}
      >
        <div
          className={`
            absolute top-1 w-5 h-5 rounded-full bg-white shadow-md
            transition-transform duration-200
            ${enabled ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { themeId, setThemeId } = useTheme();
  const {
    settings,
    setSoundEnabled,
    setMusicEnabled,
    setHapticsEnabled,
    resetSettings,
  } = useSettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetProgress = () => {
    // Reset settings
    resetSettings();
    // Clear local storage game data
    try {
      localStorage.removeItem("blockblast_highscore");
      localStorage.removeItem("blockblast_stats");
      localStorage.removeItem("blockblast_achievements");
    } catch {
      // Ignore errors
    }
    setShowResetConfirm(false);
  };

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
          <Settings className="w-6 h-6 text-white/80" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 pb-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Audio & Haptics Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">
              Audio & Haptics
            </h2>
            <div className="divide-y divide-white/10">
              <ToggleSwitch
                enabled={settings.soundEnabled}
                onToggle={setSoundEnabled}
                label="Sound Effects"
                icon={Volume2}
              />
              <ToggleSwitch
                enabled={settings.musicEnabled}
                onToggle={setMusicEnabled}
                label="Music"
                icon={Music}
              />
              <ToggleSwitch
                enabled={settings.hapticsEnabled}
                onToggle={setHapticsEnabled}
                label="Haptic Feedback"
                icon={Vibrate}
              />
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Theme</h2>
            </div>

            <div className="space-y-3">
              {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                <ThemeOption
                  key={id}
                  themeId={id}
                  isSelected={themeId === id}
                  onSelect={() => setThemeId(id)}
                />
              ))}
            </div>
          </div>

          {/* Data Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Data</h2>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4
                bg-red-500/20 hover:bg-red-500/30 border border-red-500/30
                text-red-400 font-medium rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Reset Progress
            </button>
            <p className="text-white/40 text-xs text-center mt-2">
              This will clear your local high score and settings
            </p>
          </div>

          {/* About Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-3">About</h2>
            <div className="space-y-2 text-white/50 text-sm">
              <p>Block Blast v1.0.0</p>
              <p>A puzzle game built on the Internet Computer</p>
            </div>
          </div>
        </div>
      </main>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Progress?"
        message="This will clear your local high score and settings. Your cloud-synced stats and achievements will remain. This action cannot be undone."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleResetProgress}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
