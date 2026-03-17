import { describe, expect, it } from "vitest";

import { getLoginErrorMessage } from "./login-error-message";

describe("getLoginErrorMessage", () => {
  it("maps the refined Entra callback errors to actionable copy", () => {
    expect(getLoginErrorMessage("entra_token_exchange_failed")).toContain("token exchange");
    expect(getLoginErrorMessage("auth_user_sync_failed")).toContain("database schema");
  });

  it("returns null for unknown login error codes", () => {
    expect(getLoginErrorMessage("entra_exchange_failed")).toBeNull();
    expect(getLoginErrorMessage(null)).toBeNull();
  });
});
