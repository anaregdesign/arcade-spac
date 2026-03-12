import type { Route } from "./+types/home";
import { Button } from "@fluentui/react-components";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Arcade" },
    { name: "description", content: "Arcade application bootstrap." },
  ];
}

export default function Home() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <p className="eyebrow">Arcade</p>
        <h1>Azure deployment-ready arcade app bootstrap</h1>
        <p className="hero-copy">
          The app runtime is in place. The next slices add persistence, gameplay,
          rankings, profile views, and Azure-backed identity plus deployment.
        </p>
        <div className="hero-actions">
          <Button appearance="primary">Continue implementation</Button>
          <Button appearance="secondary">Review plan</Button>
        </div>
      </section>
    </main>
  );
}
