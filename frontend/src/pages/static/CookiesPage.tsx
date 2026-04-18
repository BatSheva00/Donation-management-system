import { Box, Container, Typography, Paper, alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Cookie } from "@mui/icons-material";

const CookiesPage = () => {
  const { t } = useTranslation();

  const cookieTypes = [
    {
      name: "Essential Cookies",
      description: "Required for the website to function properly",
      examples: "Authentication, security, preferences",
      duration: "Session to 1 year",
      required: true,
    },
    {
      name: "Functional Cookies",
      description: "Enable personalized features and remember your preferences",
      examples: "Language settings, theme preferences",
      duration: "1 year",
      required: false,
    },
    {
      name: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website",
      examples: "Page views, navigation patterns",
      duration: "2 years",
      required: false,
    },
    {
      name: "Performance Cookies",
      description: "Help us improve website performance",
      examples: "Load times, error tracking",
      duration: "1 year",
      required: false,
    },
  ];

  const sections = [
    {
      title: "What Are Cookies?",
      content: `Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

Cookies can be "persistent" (remaining on your device until deleted) or "session" (deleted when you close your browser).`,
    },
    {
      title: "How We Use Cookies",
      content: `KindLoop uses cookies and similar technologies for several purposes:

• Authentication: To keep you logged in and secure your session
• Preferences: To remember your settings and choices
• Security: To protect against fraud and unauthorized access
• Analytics: To understand how our service is used and improve it
• Performance: To ensure our website loads quickly and works properly`,
    },
    {
      title: "Third-Party Cookies",
      content: `Some cookies are placed by third-party services that appear on our pages. We use:

• Google Analytics: For website analytics and usage statistics
• Error tracking services: To identify and fix technical issues

These third parties may use cookies subject to their own privacy policies.`,
    },
    {
      title: "Managing Cookies",
      content: `You can control and manage cookies in several ways:

Browser Settings: Most browsers allow you to view, delete, and block cookies. See your browser's help documentation for instructions.

Our Cookie Settings: You can adjust your cookie preferences in your account settings (coming soon).

Opt-Out Links:
• Google Analytics: https://tools.google.com/dlpage/gaoptout

Note that blocking some cookies may impact your experience on our website.`,
    },
    {
      title: "Do Not Track",
      content: `Some browsers have a "Do Not Track" feature that signals to websites that you don't want your online activities tracked. Our website currently does not respond to Do Not Track signals, but we limit tracking to the purposes described in this policy.`,
    },
    {
      title: "Updates to This Policy",
      content: `We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. Any changes will be posted on this page with an updated revision date.`,
    },
    {
      title: "Contact Us",
      content: `If you have questions about our use of cookies, please contact us at:

Email: privacy@kindloop.com
Address: Tel Aviv, Israel`,
    },
  ];

  return (
    <Box sx={{ py: 8, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: alpha("#359364", 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <Cookie sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.cookies.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("static.cookies.lastUpdated")}
          </Typography>
        </Box>

        {/* Introduction */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography sx={{ lineHeight: 1.8 }}>
            This Cookie Policy explains how KindLoop uses cookies and similar tracking technologies
            when you visit our website. This policy should be read alongside our Privacy Policy,
            which explains how we collect and use your personal information.
          </Typography>
        </Paper>

        {/* Cookie Types Table */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            {t("static.cookies.cookieTypes")}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Cookie Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("static.cookies.duration")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("static.cookies.required")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cookieTypes.map((cookie, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {cookie.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cookie.examples}
                      </Typography>
                    </TableCell>
                    <TableCell>{cookie.description}</TableCell>
                    <TableCell>{cookie.duration}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: cookie.required ? "primary.main" : "text.secondary",
                          fontWeight: cookie.required ? 600 : 400,
                        }}
                      >
                        {cookie.required ? t("static.cookies.required") : t("static.cookies.optional")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Sections */}
        {sections.map((section, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              {section.title}
            </Typography>
            <Typography
              sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
              color="text.secondary"
            >
              {section.content}
            </Typography>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default CookiesPage;

