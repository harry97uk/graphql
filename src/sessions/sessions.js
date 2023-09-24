const sessionTokens = {}; // Object to store session tokens

// Function to generate a new session token
export function generateSessionToken(userId) {
  const token = generateUniqueToken();
  sessionTokens[token] = userId; // Store the session token with the associated user ID
  return token;
}

// Function to validate a session token
export function isValidSessionToken(token) {
  return token in sessionTokens;
}

// Function to retrieve the associated user ID for a session token
export function getUserIdFromSessionToken(token) {
  return sessionTokens[token];
}

// Function to remove a session token
export function removeSessionToken(token) {
  delete sessionTokens[token];
}

export function generateUniqueToken() {
    return Math.floor(Math.random() * Date.now())
}