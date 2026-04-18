import { Box, Container, Typography, Paper, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Gavel } from "@mui/icons-material";

const TermsPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using KindLoop's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.

These terms apply to all users, including donors, recipients, drivers, businesses, and visitors.`,
    },
    {
      title: "2. Description of Service",
      content: `KindLoop provides a platform that connects donors with recipients for the purpose of facilitating charitable donations of goods, food, and other items. Our services include:
• Creating and managing donation listings
• Submitting and tracking requests for donations
• Coordinating pickup and delivery of donations
• User verification and trust systems
• Communication tools between users

KindLoop acts solely as an intermediary platform and does not take ownership of donated items.`,
    },
    {
      title: "3. User Accounts",
      content: `To use certain features of our service, you must register for an account. You agree to:
• Provide accurate and complete registration information
• Maintain the security of your password
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
    },
    {
      title: "4. User Conduct",
      content: `When using KindLoop, you agree not to:
• Violate any applicable laws or regulations
• Post false, misleading, or fraudulent content
• Harass, abuse, or harm other users
• Use the platform for commercial purposes without authorization
• Attempt to gain unauthorized access to our systems
• Interfere with the proper functioning of the service
• Collect user information without consent
• Create multiple accounts for deceptive purposes`,
    },
    {
      title: "5. Donations and Requests",
      content: `Donors are responsible for:
• Ensuring donated items are safe, legal, and in acceptable condition
• Providing accurate descriptions of donated items
• Being available for scheduled pickups
• Following food safety guidelines for food donations

Recipients agree to:
• Use donations for their stated purpose
• Pick up or receive donations at agreed times
• Report any issues with donations promptly

All donations are made on an "as-is" basis. KindLoop does not guarantee the quality or condition of donated items.`,
    },
    {
      title: "6. Verification and Trust",
      content: `KindLoop implements verification processes to enhance trust and safety. However:
• We do not guarantee the identity, background, or reliability of any user
• Users should exercise their own judgment when interacting with others
• We recommend meeting in public places for pickups when possible
• Report any suspicious activity to our support team immediately`,
    },
    {
      title: "7. Intellectual Property",
      content: `The KindLoop platform, including its content, features, and functionality, is owned by KindLoop and protected by copyright, trademark, and other intellectual property laws.

Users retain ownership of content they post but grant KindLoop a license to use, display, and distribute such content in connection with our services.`,
    },
    {
      title: "8. Limitation of Liability",
      content: `To the maximum extent permitted by law, KindLoop shall not be liable for:
• Any indirect, incidental, or consequential damages
• Loss or damage arising from use of donated items
• Actions or conduct of other users
• Interruption or unavailability of services
• Data loss or security breaches

Our total liability shall not exceed the amount you paid to KindLoop (if any) in the past 12 months.`,
    },
    {
      title: "9. Indemnification",
      content: `You agree to indemnify and hold harmless KindLoop, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:
• Your use of the service
• Your violation of these terms
• Your violation of any third-party rights
• Any content you post on the platform`,
    },
    {
      title: "10. Modifications to Terms",
      content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the modified terms.`,
    },
    {
      title: "11. Governing Law",
      content: `These terms shall be governed by and construed in accordance with the laws of Israel, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Tel Aviv, Israel.`,
    },
    {
      title: "12. Contact Information",
      content: `For questions about these Terms of Service, please contact us at:

Email: legal@kindloop.com
Address: Tel Aviv, Israel
Phone: +972-3-123-4567`,
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
            <Gavel sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.terms.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("static.terms.lastUpdated")}
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
            Welcome to KindLoop. These Terms of Service ("Terms") govern your access to and use of
            our platform and services. Please read these terms carefully before using our services.
            By using KindLoop, you agree to be bound by these terms.
          </Typography>
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

export default TermsPage;

