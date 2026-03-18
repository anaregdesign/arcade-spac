import { describe, expect, it } from "vitest";

import { buildEntraOpenIdConfiguration } from "./entra-openid";

describe("buildEntraOpenIdConfiguration", () => {
  it("builds the canonical tenant-scoped Entra endpoints", () => {
    expect(buildEntraOpenIdConfiguration("72f988bf-86f1-41af-91ab-2d7cd011db47")).toEqual({
      authorization_endpoint: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/v2.0/authorize",
      issuer: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0",
      jwks_uri: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/discovery/v2.0/keys",
      token_endpoint: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/v2.0/token",
    });
  });

  it("supports shared tenants such as organizations", () => {
    expect(buildEntraOpenIdConfiguration("organizations")).toEqual({
      authorization_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize",
      issuer: "https://login.microsoftonline.com/organizations/v2.0",
      jwks_uri: "https://login.microsoftonline.com/organizations/discovery/v2.0/keys",
      token_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token",
    });
  });
});
