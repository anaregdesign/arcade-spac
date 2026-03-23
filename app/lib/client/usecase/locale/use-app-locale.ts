import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../../../../root";
import { getLocaleUiCopy } from "./locale-copy";

export function useAppLocale() {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const locale = rootData?.locale ?? "en";
  const localeSelection = rootData?.localeSelection ?? "auto";

  return {
    copy: getLocaleUiCopy(locale),
    locale,
    localeSelection,
  };
}