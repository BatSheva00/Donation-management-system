import { Box, Container, Grid, Typography } from "@mui/material";

interface StatsSectionProps {
  stats: Array<{ value: string; label: string }>;
}

export const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <Box
      sx={{
        py: 6,
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

