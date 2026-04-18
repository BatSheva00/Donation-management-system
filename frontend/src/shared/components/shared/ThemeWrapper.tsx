import { ReactNode, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from '../../../theme';

interface ThemeWrapperProps {
  children: ReactNode;
}

const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const { i18n } = useTranslation();

  const theme = useMemo(() => {
    const direction = i18n.language === 'he' ? 'rtl' : 'ltr';
    return createAppTheme(direction);
  }, [i18n.language]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;





