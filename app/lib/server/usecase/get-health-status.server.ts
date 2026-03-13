import { verifyRuntimeDatabaseCompatibility } from "../infrastructure/repositories/health.repository.server";

export type HealthStatus = {
  ok: boolean;
  service: "arcade";
  timestamp: string;
  checks: {
    database: "ok" | "failed";
  };
};

export async function getHealthStatus(): Promise<{ payload: HealthStatus; status: number }> {
  const timestamp = new Date().toISOString();

  try {
    await verifyRuntimeDatabaseCompatibility();

    return {
      status: 200,
      payload: {
        ok: true,
        service: "arcade",
        timestamp,
        checks: {
          database: "ok",
        },
      },
    };
  } catch (error) {
    console.error("Health check failed while verifying database compatibility.", error);

    return {
      status: 500,
      payload: {
        ok: false,
        service: "arcade",
        timestamp,
        checks: {
          database: "failed",
        },
      },
    };
  }
}
