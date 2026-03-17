export function getLoginErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case "session_expired_result_save":
      return "Your session ended while Arcade was saving a clear. Sign in again to recover the pending result and retry publishing it.";
    case "auth_state_mismatch":
      return "Sign-in state could not be verified. Start the Microsoft Entra sign-in flow again.";
    case "entra_access_denied":
      return "Microsoft Entra sign-in was canceled or denied before Arcade could finish the callback.";
    case "entra_token_exchange_failed":
      return "Arcade could not finish the Microsoft Entra token exchange. Retry sign-in, and if it repeats, check the app registration, callback URL, and confidential client secret.";
    case "auth_user_sync_failed":
      return "Microsoft Entra sign-in completed, but Arcade could not finish the hosted user sync. Retry sign-in, and if it repeats, check the production database schema and release migration status.";
    default:
      return null;
  }
}
