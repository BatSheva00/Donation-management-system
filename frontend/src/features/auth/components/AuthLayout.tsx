import { Box, Container, Grid, Typography, alpha } from "@mui/material";
import { Favorite } from "@mui/icons-material";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  benefits?: string[];
}

export const AuthLayout = ({ children, title, subtitle, benefits }: AuthLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(53, 147, 100, 0.3)",
                  }}
                >
                  <Favorite sx={{ color: "white", fontSize: 32 }} />
                </Box>
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  KindLoop
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {title}
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                {subtitle}
              </Typography>
              {benefits && benefits.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  {benefits.map((text, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: alpha("#359364", 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "primary.main",
                        }}
                      >
                        ✓
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Side - Form Content */}
          <Grid item xs={12} md={6}>
            {children}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

