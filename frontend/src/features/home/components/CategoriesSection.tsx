import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  alpha,
} from "@mui/material";

interface Category {
  icon: React.ReactNode;
  name: string;
  color: string;
}

interface CategoriesSectionProps {
  categories: Category[];
  t: any;
}

export const CategoriesSection = ({
  categories,
  t,
}: CategoriesSectionProps) => {
  return (
    <Box sx={{ bgcolor: alpha("#359364", 0.03), py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight={700}
          >
            {t("home.categories.title")}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t("home.categories.subtitle")}
          </Typography>
        </Box>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category, index) => (
            <Grid item xs={6} md={2} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  p: 3,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(category.color, 0.1),
                    color: category.color,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {category.icon}
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {category.name}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

