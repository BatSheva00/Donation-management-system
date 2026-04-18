import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { Input, Select, TextArea, Checkbox, Radio, Switch } from "./index";

const demoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Please select a role"),
  country: z.string().min(1, "Please select a country"),
  bio: z.string().optional(),
  gender: z.string().min(1, "Please select gender"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
  notifications: z.boolean(),
});

type DemoFormData = z.infer<typeof demoSchema>;

/**
 * Demo component showcasing all form components
 * This can be used as a reference or testing page
 */
const FormComponentsDemo = () => {
  const [submittedData, setSubmittedData] = useState<DemoFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      notifications: false,
      agreeToTerms: false,
    },
  });

  const onSubmit = (data: DemoFormData) => {
    console.log("Form submitted:", data);
    setSubmittedData(data);
  };

  const countryOptions = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "il", label: "Israel" },
  ];

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "business", label: "Business" },
    { value: "driver", label: "Driver" },
    { value: "admin", label: "Admin" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not", label: "Prefer not to say" },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom align="center">
        Form Components Demo
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        align="center"
        sx={{ mb: 4 }}
      >
        Showcase of all reusable form components with consistent design
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Input Components */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Text Inputs
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Input
                label="First Name"
                placeholder="Enter your first name"
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                error={!!errors.password}
                helperText={
                  errors.password?.message ||
                  "Password visibility toggle is automatic"
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Select Components */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Select Dropdowns
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Select
                label="Role"
                placeholder="Select your role"
                options={roleOptions}
                {...register("role")}
                error={!!errors.role}
                helperText={errors.role?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Select
                label="Country"
                placeholder="Select your country"
                options={countryOptions}
                {...register("country")}
                error={!!errors.country}
                helperText={errors.country?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* TextArea */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Text Area
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextArea
                label="Bio"
                placeholder="Tell us about yourself..."
                minRows={4}
                maxRows={8}
                {...register("bio")}
                helperText="Optional: Share a brief bio"
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Radio Buttons */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Radio Buttons
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Radio
                label="Gender"
                options={genderOptions}
                {...register("gender")}
                error={!!errors.gender}
                helperText={errors.gender?.message}
                row
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Checkbox and Switch */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Checkbox & Switch
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Checkbox
                label="I agree to the terms and conditions"
                {...register("agreeToTerms")}
                error={!!errors.agreeToTerms}
                helperText={errors.agreeToTerms?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <Switch
                label="Enable email notifications"
                {...register("notifications")}
                helperText="Receive updates and notifications via email"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  background:
                    "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Submit Form
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                type="button"
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => {
                  reset();
                  setSubmittedData(null);
                }}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Reset Form
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Submitted Data Display */}
      {submittedData && (
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Alert severity="success" sx={{ mb: 2 }}>
            Form submitted successfully!
          </Alert>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Submitted Data:
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: "grey.50",
              p: 2,
              borderRadius: 2,
              overflow: "auto",
              fontSize: "0.875rem",
            }}
          >
            {JSON.stringify(submittedData, null, 2)}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default FormComponentsDemo;
