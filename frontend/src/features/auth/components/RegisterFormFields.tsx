import { Box, Grid, InputAdornment } from "@mui/material";
import { Email, Lock, Person } from "@mui/icons-material";
import { UseFormRegister, FieldErrors, Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input, PhoneInput } from "../../../shared/components/forms";

interface RegisterFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  control: Control<any>;
  selectedRole: string;
}

export const RegisterFormFields = ({
  register,
  errors,
  control,
  selectedRole,
}: RegisterFormFieldsProps) => {
  const { t } = useTranslation();

  const firstNameLabel =
    selectedRole === "business" ? t("auth.contactFirstName") : t("auth.firstName");
  const lastNameLabel =
    selectedRole === "business" ? t("auth.contactLastName") : t("auth.lastName");

  // RTL-aware input styles for icons
  const getInputStyles = (extraStyles?: object) => ({
    "& .MuiInputBase-input": {
      paddingInlineStart: "52px !important",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      insetInlineStart: "16px",
      zIndex: 1,
    },
    ...extraStyles,
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Input
            fullWidth
            label={firstNameLabel}
            {...register("firstName")}
            error={!!errors.firstName}
            helperText={errors.firstName?.message as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={getInputStyles()}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Input
            fullWidth
            label={lastNameLabel}
            {...register("lastName")}
            error={!!errors.lastName}
            helperText={errors.lastName?.message as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={getInputStyles()}
          />
        </Grid>
      </Grid>

      <Input
        fullWidth
        label={t("auth.email")}
        type="email"
        autoComplete="off"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message as string}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
        sx={getInputStyles({ mb: 3, mt: 2 })}
      />

      <Box sx={{ mb: 3 }}>
        <PhoneInput
          control={control}
          name="phoneNumber"
          label={t("auth.phoneNumber")}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message as string}
          placeholder="50-123-4567"
        />
      </Box>

      <Input
        fullWidth
        label={t("auth.password")}
        type="password"
        autoComplete="new-password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message as string}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
        }}
        sx={getInputStyles({ mb: 3 })}
      />
    </>
  );
};
