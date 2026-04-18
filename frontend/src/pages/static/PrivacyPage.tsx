import { Box, Container, Typography, Paper, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Security } from "@mui/icons-material";

const PrivacyPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, make a donation, submit a request, or contact us for support.

This includes:
• Personal information (name, email address, phone number)
• Profile information (profile photo, address)
• Business information (for business accounts)
• Driver information (license details, vehicle information)
• Transaction data (donation and request history)
• Communications with us`,
    },
    {
      title: "2. How We Use Your Information",
      content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Connect donors with recipients and drivers
• Send you technical notices and support messages
• Respond to your comments and questions
• Monitor and analyze trends and usage
• Detect, investigate, and prevent fraudulent transactions
• Personalize and improve your experience`,
    },
    {
      title: "3. Information Sharing",
      content: `We share your information only in the following circumstances:
• With other users as necessary to facilitate donations (e.g., sharing pickup location with drivers)
• With service providers who assist in our operations
• In response to legal requests or to protect our rights
• With your consent or at your direction

We never sell your personal information to third parties.`,
    },
    {
      title: "4. Data Security",
      content: `We take reasonable measures to protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. This includes:
• Encryption of data in transit and at rest
• Regular security assessments
• Access controls and authentication
• Employee training on data protection

However, no method of transmission over the Internet is 100% secure.`,
    },
    {
      title: "5. Your Rights",
      content: `You have the right to:
• Access your personal information
• Correct inaccurate data
• Delete your account and associated data
• Export your data
• Opt-out of marketing communications
• Withdraw consent where applicable

To exercise these rights, please contact us at privacy@kindloop.com.`,
    },
    {
      title: "6. Data Retention",
      content: `We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain information as required by law or for legitimate business purposes.

When you delete your account, we will delete or anonymize your information within 30 days, unless we are required to retain it for legal reasons.`,
    },
    {
      title: "7. Children's Privacy",
      content: `Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.`,
    },
    {
      title: "8. Changes to This Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.

Your continued use of our services after any changes indicates your acceptance of the updated policy.`,
    },
    {
      title: "9. Contact Us",
      content: `If you have any questions about this Privacy Policy, please contact us at:

Email: privacy@kindloop.com
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
            <Security sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.privacy.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("static.privacy.lastUpdated")}
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
            At KindLoop, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our platform. Please read this
            policy carefully. By using KindLoop, you consent to the practices described in this policy.
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

export default PrivacyPage;

