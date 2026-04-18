import { Box, Container, Typography, Grid, Paper, alpha, TextField, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Send,
} from "@mui/icons-material";
import { useState } from "react";

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 28 }} />,
      title: t("static.contact.info.email"),
      value: t("static.contact.info.emailValue"),
      description: t("static.contact.info.emailDesc"),
    },
    {
      icon: <Phone sx={{ fontSize: 28 }} />,
      title: t("static.contact.info.phone"),
      value: t("static.contact.info.phoneValue"),
      description: t("static.contact.info.phoneDesc"),
    },
    {
      icon: <LocationOn sx={{ fontSize: 28 }} />,
      title: t("static.contact.info.address"),
      value: t("static.contact.info.addressValue"),
      description: t("static.contact.info.addressDesc"),
    },
    {
      icon: <AccessTime sx={{ fontSize: 28 }} />,
      title: t("static.contact.info.hours"),
      value: t("static.contact.info.hoursValue"),
      description: t("static.contact.info.hoursDesc"),
    },
  ];

  return (
    <Box sx={{ py: 8, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.contact.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            {t("static.contact.subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                {t("static.contact.sendMessage")}
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("static.contact.form.name")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("static.contact.form.email")}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("static.contact.form.subject")}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("static.contact.form.message")}
                      multiline
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<Send />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                      }}
                    >
                      {t("static.contact.form.send")}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {contactInfo.map((info, index) => (
                <Grid item xs={12} sm={6} md={12} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha("#359364", 0.1),
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {info.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {info.title}
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {info.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {info.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactPage;

