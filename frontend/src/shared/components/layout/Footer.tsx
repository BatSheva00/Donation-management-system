import { Box, Container, Typography, Link, Grid, IconButton, Divider, alpha } from '@mui/material';
import { Favorite, Twitter, Facebook, Instagram, LinkedIn, GitHub } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  const footerLinks = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('footer.howItWorks'), href: '/how-it-works' },
        { label: t('nav.donations'), href: '/donations' },
        { label: t('nav.requests'), href: '/requests' },
        { label: t('footer.aboutUs'), href: '/about' },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.contactUs'), href: '/contact' },
        { label: t('footer.faq'), href: '/faq' },
        { label: t('footer.community'), href: '/community' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Twitter />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Facebook />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Instagram />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedIn />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <GitHub />, href: 'https://github.com', label: 'GitHub' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: alpha('#1e293b', 0.98),
        color: 'white',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #359364 0%, #24754f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Favorite sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" fontWeight={800}>
                KindLoop
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.7 }}>
              {t('footer.tagline')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    bgcolor: alpha('#ffffff', 0.1),
                    '&:hover': {
                      bgcolor: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <Grid item xs={12} sm={6} md={2.66} key={index}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    component={RouterLink}
                    to={link.href}
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: alpha('#ffffff', 0.1) }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} KindLoop. {t('footer.copyright')}.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('footer.madeWith')}{' '}
            <Favorite
              sx={{ fontSize: 14, verticalAlign: 'middle', color: '#f87171', mx: 0.5 }}
            />{' '}
            {t('footer.by')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;


