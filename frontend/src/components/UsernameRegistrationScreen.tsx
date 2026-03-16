import React, { useState, useEffect } from "react";
import { MenuBackground } from "./menu/MenuBackground";
import { GameLogo } from "./menu/GameLogo";
import { useIsUsernameTaken, useRegisterUsername } from "../hooks/useQueries";

interface UsernameRegistrationScreenProps {
  onComplete: () => void;
}

export const UsernameRegistrationScreen: React.FC<
  UsernameRegistrationScreenProps
> = ({ onComplete }) => {
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: isTaken, isFetching: isCheckingAvailability } =
    useIsUsernameTaken(username);
  const registerMutation = useRegisterUsername();

  // Validate username on change
  useEffect(() => {
    if (!username) {
      setValidationError(null);
      return;
    }

    if (username.length < 3) {
      setValidationError("Username must be at least 3 characters");
      return;
    }

    if (username.length > 20) {
      setValidationError("Username must be at most 20 characters");
      return;
    }

    // Check for valid characters (alphanumeric and underscore)
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(username)) {
      setValidationError("Only letters, numbers, and underscores allowed");
      return;
    }

    setValidationError(null);
  }, [username]);

  const isValid = username.length >= 3 && !validationError && !isTaken;
  const isLoading = registerMutation.isPending || isCheckingAvailability;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    try {
      await registerMutation.mutateAsync(username);
      onComplete();
    } catch {
      // Error handled by mutation's onError
    }
  };

  const getInputBorderColor = () => {
    if (!username) return "border-white/20";
    if (validationError || isTaken) return "border-red-500";
    if (isCheckingAvailability) return "border-yellow-500";
    if (isValid) return "border-green-500";
    return "border-white/20";
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <MenuBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm">
        {/* Game Logo */}
        <GameLogo />

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-white mb-2">
              Choose Your Username
            </h2>
            <p className="text-sm text-white/60">
              This will be displayed on leaderboards
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              maxLength={20}
              className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm
                         text-white font-medium text-lg rounded-xl
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-purple-500
                         border-2 ${getInputBorderColor()}
                         transition-all`}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Status indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCheckingAvailability && username.length >= 3 && (
                <span className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin inline-block" />
              )}
              {!isCheckingAvailability && isValid && (
                <span className="text-green-500 text-xl">&#10003;</span>
              )}
              {!isCheckingAvailability && isTaken && (
                <span className="text-red-500 text-xl">&#10007;</span>
              )}
            </div>
          </div>

          {/* Validation message */}
          <div className="h-5 text-sm">
            {validationError && (
              <p className="text-red-400">{validationError}</p>
            )}
            {!validationError && isTaken && (
              <p className="text-red-400">This username is already taken</p>
            )}
            {!validationError && !isTaken && isValid && (
              <p className="text-green-400">Username is available!</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500
                       text-white font-bold text-lg rounded-xl
                       hover:from-purple-600 hover:to-pink-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-lg hover:shadow-xl hover:scale-105
                       border-2 border-white/20"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <p className="text-xs text-white/40 text-center">
          3-20 characters. Letters, numbers, and underscores only.
        </p>
      </div>
    </div>
  );
};
