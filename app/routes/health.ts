import { data } from "react-router";

export async function loader() {
  return data({ ok: true, service: "arcade", timestamp: new Date().toISOString() });
}