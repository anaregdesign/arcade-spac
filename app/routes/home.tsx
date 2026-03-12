import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/home";
import { AppShell } from "../components/app-shell";
import { HomeDashboard } from "../components/home-dashboard";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { markOnboardingSeen } from "../lib/server/infrastructure/repositories/arcade-dashboard.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Arcade Home" },
    { name: "description", content: "Arcade dashboard and game selection." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  return getHomeDashboard(userId);
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireCurrentUserId(request);
  const formData = await request.formData();

  if (formData.get("intent") === "dismissOnboarding") {
    await markOnboardingSeen(userId);
    return redirect("/home");
  }

  throw new Response("Unsupported action", { status: 400 });
}

export default function Home() {
  const dashboard = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="home"
      titleEmoji="🎮"
      sectionLabel="Play hub"
      title={`Hi, ${dashboard.user.displayName}`}
      user={dashboard.user}
    >
      <HomeDashboard {...dashboard} />
    </AppShell>
  );
}
