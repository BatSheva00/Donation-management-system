import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import AnimatedSection from "../../../shared/components/shared/AnimatedSection";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  t: any;
}

export const FeaturesSection = ({ features, t }: FeaturesSectionProps) => {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <AnimatedSection>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("home.howItWorks")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            {t("home.steps")}
          </Typography>
        </Box>
      </AnimatedSection>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <AnimatedSection delay={index * 0.1} direction="up">
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  p: 2,
                  position: "relative",
                  border: "2px solid",
                  borderColor: "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: feature.color,
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 24px ${alpha(feature.color, 0.2)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(feature.color, 0.1),
                    color: feature.color,
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </AnimatedSection>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

