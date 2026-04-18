import {
  Container,
  Grid,
  Box,
  Typography,
  Stack,
  Button,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";

interface WhyItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface WhyChooseUsSectionProps {
  items: WhyItem[];
  t: any;
}

export const WhyChooseUsSection = ({
  items,
  t,
}: WhyChooseUsSectionProps) => {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("home.why.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            {t("home.why.subtitle")}
          </Typography>
          <Stack gap={3}>
            {items.map((item, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#359364", 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
              p: 6,
              position: "relative",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              color="white"
              fontWeight={700}
              gutterBottom
            >
              {t("home.joinCommunity.title")}
            </Typography>
            <Typography
              variant="body1"
              color={alpha("#ffffff", 0.9)}
              paragraph
            >
              {t("home.joinCommunity.subtitle")}
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                mt: 2,
                "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
              }}
            >
              {t("home.joinCommunity.button")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

