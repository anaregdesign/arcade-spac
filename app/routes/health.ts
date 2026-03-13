import { data } from "react-router";
import { getHealthStatus } from "../lib/server/usecase/get-health-status.server";

export async function loader() {
  const { payload, status } = await getHealthStatus();
  return data(payload, { status });
}
