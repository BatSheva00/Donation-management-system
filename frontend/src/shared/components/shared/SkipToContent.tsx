import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SkipToContent = () => {
  const { t } = useTranslation();

  const handleSkip = () => {
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  };

  return (
    <Button
      onClick={handleSkip}
      sx={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '8px 16px',
        bgcolor: 'primary.main',
        color: 'white',
        '&:focus': {
          left: '16px',
          top: '16px',
        },
      }}
    >
      {t('accessibility.skipToContent')}
    </Button>
  );
};

export default SkipToContent;





