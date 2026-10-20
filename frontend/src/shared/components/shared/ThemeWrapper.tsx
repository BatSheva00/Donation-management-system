import { ReactNode, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPluginImport from "stylis-plugin-rtl";
import { useTranslation } from "react-i18next";
import { createAppTheme } from "../../../theme";

const rtlPlugin =
  typeof rtlPluginImport === "function"
    ? rtlPluginImport
    : (rtlPluginImport as { default?: typeof rtlPluginImport }).default;

const cacheLtr = createCache({ key: "muiltr", prepend: true });
const cacheRtl = createCache({
  key: "muirtl",
  prepend: true,
  stylisPlugins: rtlPlugin ? [prefixer, rtlPlugin] : [prefixer],
});

interface ThemeWrapperProps {
  children: ReactNode;
}

const isHebrew = (language: string) => language.toLowerCase().startsWith("he");

const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const { i18n } = useTranslation();
  const rtl = isHebrew(i18n.language);

  const theme = useMemo(
    () => createAppTheme(rtl ? "rtl" : "ltr"),
    [rtl]
  );

  return (
    <CacheProvider value={rtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default ThemeWrapper;
