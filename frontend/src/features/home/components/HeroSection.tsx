import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Stack,
  Chip,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowForward, Favorite } from "@mui/icons-material";

interface HeroSectionProps {
  isAuthenticated: boolean;
  t: any;
}

export const HeroSection = ({ isAuthenticated, t }: HeroSectionProps) => {
  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #359364 0%, #24754f 50%, #1a5a3d 100%)",
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 12 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Chip
              label={`🌟 ${t("home.hero.badge")}`}
              className="animate-bounce-in"
              sx={{
                mb: 3,
                bgcolor: alpha("#ffffff", 0.2),
                color: "white",
                fontWeight: 600,
                backdropFilter: "blur(10px)",
              }}
            />
            <Typography
              variant="h1"
              component="h1"
              className="animate-fade-in"
              sx={{
                color: "white",
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              {t("home.hero.title")}
            </Typography>
            <Typography
              variant="h5"
              className="animate-fade-in"
              sx={{
                color: alpha("#ffffff", 0.95),
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
              style={{ animationDelay: "0.1s" }}
            >
              {t("home.hero.subtitle")}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              className="animate-fade-in"
              style={{ animationDelay: "0.2s" }}
              sx={{
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              {!isAuthenticated && (
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  aria-label={t("home.hero.cta1")}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": {
                      bgcolor: alpha("#ffffff", 0.9),
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {t("home.hero.cta1")}
                </Button>
              )}
              {isAuthenticated ? (
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  aria-label="Go to Dashboard"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": {
                      bgcolor: alpha("#ffffff", 0.9),
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {t("common.dashboard")}
                </Button>
              ) : null}
              <Button
                component={Link}
                to="/donations"
                variant="outlined"
                size="large"
                aria-label={t("home.hero.cta2")}
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: alpha("#ffffff", 0.1),
                  },
                }}
              >
                {t("home.hero.cta2")}
              </Button>
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Box
              sx={{
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "120%",
                  height: "120%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  animation: "pulse 3s ease-in-out infinite",
                },
                "@keyframes pulse": {
                  "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
                  "50%": { transform: "translate(-50%, -50%) scale(1.1)" },
                },
              }}
            >
              <Favorite
                sx={{ fontSize: 300, color: alpha("#ffffff", 0.2) }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

