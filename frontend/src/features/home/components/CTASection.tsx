import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";

interface CTASectionProps {
  t: any;
}

export const CTASection = ({ t }: CTASectionProps) => {
  return (
    <Box
      sx={{
        bgcolor: alpha("#359364", 0.05),
        py: 8,
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
          {t("home.cta.title")}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          {t("home.cta.subtitle")}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          justifyContent="center"
        >
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
              px: 4,
              py: 1.5,
            }}
          >
            {t("home.cta.createAccount")}
          </Button>
          <Button
            component={Link}
            to="/donations"
            variant="outlined"
            size="large"
            sx={{ px: 4, py: 1.5 }}
          >
            {t("home.cta.explore")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

