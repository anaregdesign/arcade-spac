import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: [],
      include: [
        "app/lib/domain/entities/game-catalog.ts",
        "app/lib/domain/services/game-metrics.ts",
        "app/lib/client/usecase/home-hub/selectors.ts",
        "app/lib/client/usecase/result-screen/use-result-screen.ts",
        "app/lib/client/usecase/rankings-screen/use-rankings-screen.ts",
        "app/lib/client/usecase/login-screen/use-login-screen.ts",
        "app/lib/client/usecase/game-workspace/form-data.ts",
        "app/lib/client/usecase/game-workspace/display.ts",
      ],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: "node",
    include: ["app/lib/**/*.test.ts"],
  },
});
