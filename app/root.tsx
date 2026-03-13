import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { getCurrentUserId } from "./lib/server/infrastructure/auth/session.server";
import { getThemePreferenceByUserId } from "./lib/server/infrastructure/repositories/rankings-profile.repository.server";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getCurrentUserId(request);
  const themePreference = userId ? await getThemePreferenceByUserId(userId) : "LIGHT";

  return {
    themePreference: themePreference === "DARK" ? "dark" : "light",
  } as const;
}

function AppDocument({ children, themePreference }: { children: React.ReactNode; themePreference: "dark" | "light" }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body data-theme={themePreference}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  return <AppDocument themePreference={data?.themePreference ?? "light"}>{children}</AppDocument>;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="error-boundary">
      <div className="error-card">
        <p className="eyebrow">Arcade</p>
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="error-stack">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
