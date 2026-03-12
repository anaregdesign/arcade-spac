import { useLoaderData } from "react-router";

import type { Route } from "./+types/home";
import { AppShell } from "../components/app-shell";
import { HomeDashboard } from "../components/home-dashboard";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
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

export default function Home() {
  const dashboard = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="home"
      titleEmoji="🎮"
      sectionLabel="Play hub"
      title={`Hi, ${dashboard.user.displayName}`}
      subtitle="Pick fast. Play fast."
      user={dashboard.user}
    >
      <HomeDashboard {...dashboard} />
    </AppShell>
  );
}
