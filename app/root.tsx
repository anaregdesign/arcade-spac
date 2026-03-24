import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { normalizeArcadeLocaleSelection } from "./lib/domain/entities/locale";
import { getCurrentUserId, sanitizeReturnToPath } from "./lib/server/infrastructure/auth/session.server";
import { getLocalePreference, serializeLocalePreference } from "./lib/server/infrastructure/locale/locale-preference.server";
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
  const { localeSelection, resolvedLocale } = await getLocalePreference(request);
  const themePreference = userId ? await getThemePreferenceByUserId(userId) : "LIGHT";

  return {
    locale: resolvedLocale,
    localeSelection,
    themePreference: themePreference === "DARK" ? "dark" : "light",
  } as const;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const localeValue = formData.get("locale");
  const returnToValue = formData.get("returnTo");

  if (formData.get("intent") !== "setLocale") {
    throw new Response("Unsupported action", { status: 400 });
  }

  const localeSelection = normalizeArcadeLocaleSelection(typeof localeValue === "string" ? localeValue : null);

  if (!localeSelection) {
    throw new Response("Locale is invalid", { status: 400 });
  }

  const returnTo = sanitizeReturnToPath(typeof returnToValue === "string" ? returnToValue : null) ?? "/";

  return redirect(returnTo, {
    headers: {
      "Set-Cookie": await serializeLocalePreference(localeSelection),
    },
  });
}

function AppDocument({ children, locale, themePreference }: { children: React.ReactNode; locale: "en" | "ja" | "zh" | "fr"; themePreference: "dark" | "light" }) {
  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body data-theme={themePreference}>
        {children}
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.MathJax = {
  tex: {
    inlineMath: [['\\\\(', '\\\\)']],
    displayMath: [['\\\\[', '\\\\]']]
  },
  svg: {
    fontCache: 'global'
  },
  startup: {
    typeset: false,
    ready() {
      MathJax.startup.defaultReady();
      document.dispatchEvent(new Event('mathjax-ready'));
    }
  }
};`,
          }}
        />
        <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <AppDocument locale={data?.locale ?? "en"} themePreference={data?.themePreference ?? "light"}>
      {children}
    </AppDocument>
  );
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
