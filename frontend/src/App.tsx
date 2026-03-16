import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActor } from "./hooks/useActor";
import { useUsername } from "./hooks/useQueries";
import { LandingPage } from "./components/LandingPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { UsernameRegistrationScreen } from "./components/UsernameRegistrationScreen";
import { MainApp } from "./components/MainApp";
import { ThemeProvider } from "./hooks/useTheme";
import { SettingsProvider } from "./hooks/useSettings";

const App: React.FC = () => {
  const { identity, isInitializing, login, isLoggingIn, clear } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  // Clear query cache on logout
  useEffect(() => {
    if (!identity) {
      queryClient.clear();
    }
  }, [identity, queryClient]);

  // Show loading screen during authentication initialization
  if (isInitializing) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />
      </ThemeProvider>
    );
  }

  // Authenticated app - show main application
  // Using key={principal} forces remount on identity change to clear component state
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthenticatedApp
          key={identity?.getPrincipal().toString()}
          onLogout={clear}
        />
      </SettingsProvider>
    </ThemeProvider>
  );
};

interface AuthenticatedAppProps {
  onLogout: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ onLogout }) => {
  const { actor } = useActor();
  const {
    data: username,
    isLoading: isLoadingUsername,
    refetch: refetchUsername,
  } = useUsername();
  const [hasRegistered, setHasRegistered] = useState(false);

  // Loading actor or username check - show loading screen
  if (!actor || isLoadingUsername) {
    return <LoadingScreen />;
  }

  // No username registered yet - show registration screen
  if (!username && !hasRegistered) {
    return (
      <UsernameRegistrationScreen
        onComplete={() => {
          setHasRegistered(true);
          refetchUsername();
        }}
      />
    );
  }

  return <MainApp onLogout={onLogout} />;
};

export default App;
