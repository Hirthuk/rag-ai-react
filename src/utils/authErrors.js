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

// Spring Boot 3.x omits the exception reason by default — these placeholders
// are not useful to show to the user.
const GENERIC_PLACEHOLDERS = new Set(["No message available", "No message", ""]);

// Friendly fallbacks keyed by HTTP status — used when the backend doesn't echo
// the exception reason in the response body (Spring Boot default behaviour).
const STATUS_FALLBACKS = {
  400: "Invalid request. Please check your input.",
  401: "Incorrect email or password.",
  403: "Your account is not confirmed yet. Please check your email.",
  404: "No account found with this email address.",
  409: "An account with this email already exists. Try signing in instead.",
  429: "Too many attempts. Please wait a few minutes and try again.",
  500: "Server error. Please try again later.",
};

/**
 * Extract a friendly message from an axios error coming from the backend.
 * Falls back to `fallback` when nothing useful can be derived.
 */
export const getAuthErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  // 1. Backend echoes Cognito's exception name in a known field
  const exceptionName =
    data?.error ||        // e.g. {"error": "UsernameExistsException"}
    data?.errorCode ||
    data?.code;
  if (exceptionName && COGNITO_MESSAGES[exceptionName]) {
    return COGNITO_MESSAGES[exceptionName];
  }

  // 2. Backend forwards Cognito's message string that contains the class name
  const backendMsg = data?.message ?? "";
  for (const [key, friendly] of Object.entries(COGNITO_MESSAGES)) {
    if (backendMsg.includes(key)) return friendly;
  }

  // 3. Backend sent a real, specific message (not Spring Boot's generic placeholder).
  //    Never read error?.message here — that's axios's internal string like
  //    "Request failed with status code 401", which is not user-facing.
  if (backendMsg && !GENERIC_PLACEHOLDERS.has(backendMsg.trim()) && backendMsg.length < 200) {
    return backendMsg;
  }

  // 4. No useful message in the body — map the HTTP status to a friendly string.
  //    This covers Spring Boot's default where the exception reason is not
  //    included in the response (requires server.error.include-message=always).
  if (status && STATUS_FALLBACKS[status]) {
    return STATUS_FALLBACKS[status];
  }

  return fallback;
};
