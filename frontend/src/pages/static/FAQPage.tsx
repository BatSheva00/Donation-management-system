import { Box, Container, Typography, Paper, alpha, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ExpandMore, QuestionAnswer } from "@mui/icons-material";
import { useState } from "react";

const FAQPage = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | false>("panel1");

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqCategories = [
    {
      title: t("static.faq.categories.general"),
      faqs: [
        {
          question: t("static.faq.questions.whatIs"),
          answer: t("static.faq.questions.whatIsAnswer"),
        },
        {
          question: t("static.faq.questions.isFree"),
          answer: t("static.faq.questions.isFreeAnswer"),
        },
        {
          question: t("static.faq.questions.createAccount"),
          answer: t("static.faq.questions.createAccountAnswer"),
        },
      ],
    },
    {
      title: t("static.faq.categories.donations"),
      faqs: [
        {
          question: t("static.faq.questions.createDonation"),
          answer: t("static.faq.questions.createDonationAnswer"),
        },
        {
          question: t("static.faq.questions.whatCanDonate"),
          answer: t("static.faq.questions.whatCanDonateAnswer"),
        },
        {
          question: t("static.faq.questions.howDelivered"),
          answer: t("static.faq.questions.howDeliveredAnswer"),
        },
      ],
    },
    {
      title: t("static.faq.categories.requests"),
      faqs: [
        {
          question: t("static.faq.questions.howRequest"),
          answer: t("static.faq.questions.howRequestAnswer"),
        },
        {
          question: t("static.faq.questions.howMatched"),
          answer: t("static.faq.questions.howMatchedAnswer"),
        },
        {
          question: t("static.faq.questions.requestPrivate"),
          answer: t("static.faq.questions.requestPrivateAnswer"),
        },
      ],
    },
    {
      title: t("static.faq.categories.verification"),
      faqs: [
        {
          question: t("static.faq.questions.howVerified"),
          answer: t("static.faq.questions.howVerifiedAnswer"),
        },
        {
          question: t("static.faq.questions.isSafe"),
          answer: t("static.faq.questions.isSafeAnswer"),
        },
        {
          question: t("static.faq.questions.problemWithDonation"),
          answer: t("static.faq.questions.problemWithDonationAnswer"),
        },
      ],
    },
  ];

  return (
    <Box sx={{ py: 8, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
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
            <QuestionAnswer sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.faq.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            {t("static.faq.subtitle")}
          </Typography>
        </Box>

        {/* FAQ Categories */}
        {faqCategories.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mb: 2, color: "primary.main" }}
            >
              {category.title}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              {category.faqs.map((faq, faqIndex) => {
                const panelId = `panel${categoryIndex}-${faqIndex}`;
                return (
                  <Accordion
                    key={faqIndex}
                    expanded={expanded === panelId}
                    onChange={handleChange(panelId)}
                    elevation={0}
                    sx={{
                      "&:before": { display: "none" },
                      borderBottom: faqIndex < category.faqs.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        py: 1,
                        "& .MuiAccordionSummary-content": {
                          my: 1.5,
                        },
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Paper>
          </Box>
        ))}

        {/* Contact CTA */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mt: 6,
            borderRadius: 4,
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            {t("static.faq.stillHaveQuestions")}
          </Typography>
          <Typography sx={{ mb: 3, opacity: 0.9 }}>
            {t("static.faq.cantFindAnswer")}
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            support@kindloop.com
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default FAQPage;

