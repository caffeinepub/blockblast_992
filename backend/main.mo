import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Char "mo:core/Char";

actor {
  // ==================== Type Definitions ====================

  type Time = Time.Time;

  // Game score for leaderboard entries
  public type GameScore = {
    score : Nat;
    timestamp : Time;
    principal : Principal;
  };

  // Player statistics
  public type PlayerStats = {
    highScore : Nat;
    totalGamesPlayed : Nat;
    totalLinesCleared : Nat;
    totalBlocksPlaced : Nat;
    lastPlayed : Time;
  };

  // Achievement tracking
  public type Achievement = {
    id : Text;
    unlockedAt : Time;
  };

  // Daily challenge
  public type DailyChallenge = {
    date : Text; // Format: "YYYY-MM-DD"
    targetScore : Nat;
    completed : Bool;
    completedAt : ?Time;
  };

  // User profile with username
  public type UserProfile = {
    username : Text;
    principal : Principal;
    registeredAt : Time;
  };

  // ==================== Storage ====================

  // User profiles storage (Principal -> UserProfile)
  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();

  // Username to Principal mapping for uniqueness checking
  var usernameToPlayer : Map.Map<Text, Principal> = Map.empty<Text, Principal>();

  // Player stats storage (Principal -> PlayerStats)
  var playerStats : Map.Map<Principal, PlayerStats> = Map.empty<Principal, PlayerStats>();

  // Player achievements storage (Principal -> [Achievement])
  var playerAchievements : Map.Map<Principal, [Achievement]> = Map.empty<Principal, [Achievement]>();

  // Player daily challenges (Principal -> DailyChallenge)
  var playerChallenges : Map.Map<Principal, DailyChallenge> = Map.empty<Principal, DailyChallenge>();

  // Global leaderboard (stores top scores as array)
  var leaderboardEntries : [GameScore] = [];

  // Maximum leaderboard size
  let MAX_LEADERBOARD_SIZE : Nat = 100;

  // Username constraints
  let MIN_USERNAME_LENGTH : Nat = 3;
  let MAX_USERNAME_LENGTH : Nat = 20;

  // ==================== Helper Functions ====================

  func requireAuth(caller : Principal) : () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals not allowed");
    };
  };

  func toLowercase(text : Text) : Text {
    text.map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );
  };

  func getDefaultStats() : PlayerStats {
    {
      highScore = 0;
      totalGamesPlayed = 0;
      totalLinesCleared = 0;
      totalBlocksPlaced = 0;
      lastPlayed = Time.now();
    };
  };

  func insertIntoLeaderboard(newScore : GameScore) : () {
    // Find the insertion position (sorted descending by score)
    var insertPos : Nat = 0;
    for (entry in leaderboardEntries.vals()) {
      if (entry.score >= newScore.score) {
        insertPos += 1;
      };
    };

    // Build new array with the score inserted at the right position
    let currentSize = leaderboardEntries.size();
    let newSize = if (currentSize >= MAX_LEADERBOARD_SIZE) {
      MAX_LEADERBOARD_SIZE;
    } else { currentSize + 1 };

    // Don't insert if it would be beyond the max size
    if (insertPos >= MAX_LEADERBOARD_SIZE) {
      return;
    };

    leaderboardEntries := Array.tabulate<GameScore>(
      newSize,
      func(i) {
        if (i < insertPos) {
          leaderboardEntries[i];
        } else if (i == insertPos) {
          newScore;
        } else if (i <= currentSize) {
          leaderboardEntries[i - 1];
        } else {
          newScore; // This shouldn't happen, but needed for completeness
        };
      },
    );
  };

  // ==================== Username Functions ====================

  /// Check if a username is already taken
  public shared query func isUsernameTaken(username : Text) : async Bool {
    let normalizedUsername = toLowercase(username);
    switch (usernameToPlayer.get(normalizedUsername)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  /// Get the current player's username (returns null if not registered)
  public shared query ({ caller }) func getUsername() : async ?Text {
    requireAuth(caller);
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile.username };
      case (null) { null };
    };
  };

  /// Get username for any principal (for leaderboard display)
  public shared query func getUsernameByPrincipal(principal : Principal) : async ?Text {
    switch (userProfiles.get(principal)) {
      case (?profile) { ?profile.username };
      case (null) { null };
    };
  };

  /// Register a username for the current player
  public shared ({ caller }) func registerUsername(username : Text) : async Bool {
    requireAuth(caller);

    // Check if player already has a username
    switch (userProfiles.get(caller)) {
      case (?_) {
        Runtime.trap("Username already registered");
      };
      case (null) {};
    };

    // Validate username length
    let usernameLen = username.size();
    if (usernameLen < MIN_USERNAME_LENGTH) {
      Runtime.trap("Username must be at least 3 characters");
    };
    if (usernameLen > MAX_USERNAME_LENGTH) {
      Runtime.trap("Username must be at most 20 characters");
    };

    // Validate username characters (alphanumeric and underscore only)
    for (char in username.chars()) {
      let isValid = (char >= 'a' and char <= 'z') or (char >= 'A' and char <= 'Z') or (char >= '0' and char <= '9') or char == '_';
      if (not isValid) {
        Runtime.trap("Username can only contain letters, numbers, and underscores");
      };
    };

    // Check uniqueness (case-insensitive)
    let normalizedUsername = toLowercase(username);
    switch (usernameToPlayer.get(normalizedUsername)) {
      case (?_) {
        Runtime.trap("Username already taken");
      };
      case (null) {};
    };

    // Create and store the profile
    let profile : UserProfile = {
      username;
      principal = caller;
      registeredAt = Time.now();
    };

    userProfiles.add(caller, profile);
    usernameToPlayer.add(normalizedUsername, caller);

    true;
  };

  // ==================== Player Stats Functions ====================

  /// Get the current player's stats
  public shared query ({ caller }) func getPlayerStats() : async PlayerStats {
    requireAuth(caller);
    switch (playerStats.get(caller)) {
      case (?stats) { stats };
      case (null) { getDefaultStats() };
    };
  };

  /// Get the player's high score
  public shared query ({ caller }) func getHighScore() : async Nat {
    requireAuth(caller);
    switch (playerStats.get(caller)) {
      case (?stats) { stats.highScore };
      case (null) { 0 };
    };
  };

  /// Update player stats after a game
  public shared ({ caller }) func updateStats(
    linesCleared : Nat,
    blocksPlaced : Nat,
    score : Nat,
  ) : async PlayerStats {
    requireAuth(caller);

    let existingStats = switch (playerStats.get(caller)) {
      case (?stats) { stats };
      case (null) { getDefaultStats() };
    };

    let newHighScore = if (score > existingStats.highScore) {
      score;
    } else {
      existingStats.highScore;
    };

    let newStats : PlayerStats = {
      highScore = newHighScore;
      totalGamesPlayed = existingStats.totalGamesPlayed + 1;
      totalLinesCleared = existingStats.totalLinesCleared + linesCleared;
      totalBlocksPlaced = existingStats.totalBlocksPlaced + blocksPlaced;
      lastPlayed = Time.now();
    };

    playerStats.add(caller, newStats);
    newStats;
  };

  // ==================== Leaderboard Functions ====================

  /// Get top scores from the global leaderboard
  public shared query func getTopScores(limit : Nat) : async [GameScore] {
    let actualLimit = if (limit > leaderboardEntries.size()) {
      leaderboardEntries.size();
    } else {
      limit;
    };

    Array.tabulate<GameScore>(
      actualLimit,
      func(i) { leaderboardEntries[i] },
    );
  };

  /// Submit a new score to the leaderboard
  public shared ({ caller }) func submitScore(score : Nat) : async () {
    requireAuth(caller);

    let newScore : GameScore = {
      score;
      timestamp = Time.now();
      principal = caller;
    };

    insertIntoLeaderboard(newScore);
  };

  /// Get player's rank on the leaderboard (1-indexed, 0 if not on board)
  public shared query ({ caller }) func getPlayerRank() : async Nat {
    requireAuth(caller);

    var rank : Nat = 0;
    var idx : Nat = 0;
    for (entry in leaderboardEntries.vals()) {
      if (entry.principal == caller and rank == 0) {
        rank := idx + 1;
      };
      idx += 1;
    };
    rank;
  };

  // ==================== Achievement Functions ====================

  /// Get player's achievements
  public shared query ({ caller }) func getAchievements() : async [Achievement] {
    requireAuth(caller);
    switch (playerAchievements.get(caller)) {
      case (?achievements) { achievements };
      case (null) { [] };
    };
  };

  /// Unlock an achievement for the player
  public shared ({ caller }) func unlockAchievement(achievementId : Text) : async Bool {
    requireAuth(caller);

    let existingAchievements = switch (playerAchievements.get(caller)) {
      case (?achievements) { achievements };
      case (null) { [] };
    };

    // Check if already unlocked
    for (achievement in existingAchievements.vals()) {
      if (achievement.id == achievementId) {
        return false; // Already unlocked
      };
    };

    // Add new achievement
    let newAchievement : Achievement = {
      id = achievementId;
      unlockedAt = Time.now();
    };

    let updated = existingAchievements.concat([newAchievement]);
    playerAchievements.add(caller, updated);
    true;
  };

  // ==================== Daily Challenge Functions ====================

  /// Get today's daily challenge for the player
  public shared query ({ caller }) func getDailyChallenge() : async ?DailyChallenge {
    requireAuth(caller);
    playerChallenges.get(caller);
  };

  /// Set today's daily challenge (called when loading game)
  public shared ({ caller }) func initDailyChallenge(date : Text, targetScore : Nat) : async DailyChallenge {
    requireAuth(caller);

    // Check if player already has a challenge for today
    switch (playerChallenges.get(caller)) {
      case (?existing) {
        if (existing.date == date) {
          return existing; // Return existing challenge for today
        };
      };
      case (null) {};
    };

    // Create new challenge
    let challenge : DailyChallenge = {
      date;
      targetScore;
      completed = false;
      completedAt = null;
    };

    playerChallenges.add(caller, challenge);
    challenge;
  };

  /// Complete today's daily challenge
  public shared ({ caller }) func completeDailyChallenge() : async Bool {
    requireAuth(caller);

    switch (playerChallenges.get(caller)) {
      case (?existing) {
        if (existing.completed) {
          return false; // Already completed
        };

        let completed : DailyChallenge = {
          date = existing.date;
          targetScore = existing.targetScore;
          completed = true;
          completedAt = ?Time.now();
        };

        playerChallenges.add(caller, completed);
        true;
      };
      case (null) {
        Runtime.trap("No active daily challenge");
      };
    };
  };

  // ==================== Original Functions ====================

  /// Returns a greeting message
  public shared query func greet(name : Text) : async Text {
    "Hello, " # name # "!";
  };

  /// Returns the caller's principal
  public shared query ({ caller }) func whoami() : async Principal {
    caller;
  };

  /// Health check function
  public shared query func health() : async Bool {
    true;
  };
};
