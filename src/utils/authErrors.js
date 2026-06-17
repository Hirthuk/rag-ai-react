// Maps Cognito exception names (forwarded by the Spring Boot backend) to
// human-readable messages. The backend usually echoes the Cognito error code
// in the response body as `message` or `error`.

const COGNITO_MESSAGES = {
  UsernameExistsException:
    "An account with this email already exists. Try signing in instead.",
  UserNotFoundException:
    "No account found with this email address.",
  NotAuthorizedException:
    "Incorrect email or password. Please try again.",
  UserNotConfirmedException:
    "Your email is not verified yet. Please check your inbox for the confirmation code.",
  CodeMismatchException:
    "The code you entered is incorrect. Please double-check and try again.",
  ExpiredCodeException:
    "That code has expired. Please request a new one.",
  InvalidPasswordException:
    "Password does not meet the requirements (min. 8 characters, upper, lower, number, symbol).",
  LimitExceededException:
    "Too many attempts. Please wait a few minutes and try again.",
  TooManyRequestsException:
    "Too many requests. Please slow down and try again shortly.",
  TooManyFailedAttemptsException:
    "Account temporarily locked due to too many failed attempts.",
  InvalidParameterException:
    "One or more fields are invalid. Please check your input.",
  AliasExistsException:
    "This email is already linked to another account.",
};

/**
 * Extract a friendly message from an axios error coming from the backend.
 * Falls back to `fallback` when nothing useful can be derived.
 */
export const getAuthErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data;

  // 1. Backend echoes Cognito's exception name in a known field
  const exceptionName =
    data?.error ||        // e.g. {"error": "UsernameExistsException"}
    data?.errorCode ||
    data?.code;
  if (exceptionName && COGNITO_MESSAGES[exceptionName]) {
    return COGNITO_MESSAGES[exceptionName];
  }

  // 2. Backend forwards Cognito's message string that contains the class name
  const rawMsg = data?.message || error?.message || "";
  for (const [key, friendly] of Object.entries(COGNITO_MESSAGES)) {
    if (rawMsg.includes(key)) return friendly;
  }

  // 3. Backend sent a plain human-readable message — use it directly
  if (rawMsg && rawMsg.length < 200) return rawMsg;

  return fallback;
};
