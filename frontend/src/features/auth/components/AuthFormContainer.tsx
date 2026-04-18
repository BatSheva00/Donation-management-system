import { Paper, Box, Typography } from "@mui/material";

interface AuthFormContainerProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthFormContainer = ({
  title,
  subtitle,
  children,
}: AuthFormContainerProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
};

