import { ReactNode, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import { useTranslation } from "react-i18next";
import { createAppTheme } from "../../../theme";
import { safeRtlPlugin } from "../../utils/safeRtlPlugin";

const cacheLtr = createCache({ key: "muiltr", prepend: true });
const cacheRtl = createCache({
  key: "muirtl",
  prepend: true,
  stylisPlugins: [prefixer, safeRtlPlugin],
});

interface ThemeWrapperProps {
  children: ReactNode;
}

const isHebrew = (language?: string) =>
  Boolean(language && language.toLowerCase().startsWith("he"));

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
