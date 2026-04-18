# Form Components

A set of reusable form components with consistent design that can be used throughout the application.

## Features

- ✅ Consistent design matching the app's green theme (#359364)
- ✅ Full integration with `react-hook-form`
- ✅ Built-in error handling and validation
- ✅ Accessible (ARIA compliant)
- ✅ TypeScript support
- ✅ All Material-UI props supported

## Components

### 1. Input

Standard text input for text, email, password, number, etc.

**Features:**

- Auto password visibility toggle for password inputs
- Custom styling with green focus state
- Smooth transitions

**Usage:**

```tsx
import { Input } from '@/components/forms';

// Basic usage
<Input
  label="Email"
  type="email"
  fullWidth
/>

// With react-hook-form
<Input
  label="First Name"
  {...register('firstName')}
  error={!!errors.firstName}
  helperText={errors.firstName?.message}
  fullWidth
/>

// Password input (auto adds show/hide toggle)
<Input
  label="Password"
  type="password"
  {...register('password')}
  error={!!errors.password}
  helperText={errors.password?.message}
  fullWidth
/>
```

### 2. Select

Dropdown/select component with styled menu.

**Usage:**

```tsx
import { Select } from '@/components/forms';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

// With options array
<Select
  label="Choose Option"
  options={options}
  {...register('option')}
  error={!!errors.option}
  helperText={errors.option?.message}
  fullWidth
/>

// With children (MenuItem components)
<Select
  label="Role"
  {...register('role')}
  fullWidth
>
  <MenuItem value="user">User</MenuItem>
  <MenuItem value="admin">Admin</MenuItem>
</Select>
```

### 3. TextArea

Multi-line text input.

**Usage:**

```tsx
import { TextArea } from "@/components/forms";

<TextArea
  label="Description"
  minRows={4}
  maxRows={10}
  {...register("description")}
  error={!!errors.description}
  helperText={errors.description?.message}
  fullWidth
/>;
```

### 4. Checkbox

Checkbox with optional label.

**Usage:**

```tsx
import { Checkbox } from '@/components/forms';

// With label
<Checkbox
  label="I agree to the terms and conditions"
  {...register('agreeToTerms')}
  error={!!errors.agreeToTerms}
  helperText={errors.agreeToTerms?.message}
/>

// Without label (use in custom layouts)
<Checkbox {...register('isActive')} />
```

### 5. Radio

Radio button group.

**Usage:**

```tsx
import { Radio } from '@/components/forms';

const options = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Vertical layout (default)
<Radio
  label="Gender"
  options={options}
  {...register('gender')}
  error={!!errors.gender}
  helperText={errors.gender?.message}
/>

// Horizontal layout
<Radio
  label="Notification Preference"
  options={options}
  row
  {...register('notificationPreference')}
/>
```

### 6. Switch

Toggle switch component.

**Usage:**

```tsx
import { Switch } from "@/components/forms";

<Switch
  label="Email Notifications"
  {...register("emailNotifications")}
  helperText="Receive notifications via email"
/>;
```

## Complete Form Example

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Grid } from "@mui/material";
import {
  Input,
  Select,
  TextArea,
  Checkbox,
  Radio,
  Switch,
} from "@/components/forms";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  email: z.string().email("Invalid email"),
  role: z.string().min(1, "Please select a role"),
  bio: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree"),
  gender: z.string().min(1, "Please select gender"),
  notifications: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Input
            label="First Name"
            {...register("firstName")}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Select
            label="Role"
            options={[
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role")}
            error={!!errors.role}
            helperText={errors.role?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <TextArea label="Bio" {...register("bio")} fullWidth />
        </Grid>

        <Grid item xs={12}>
          <Radio
            label="Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            {...register("gender")}
            error={!!errors.gender}
            helperText={errors.gender?.message}
            row
          />
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
          <Switch label="Enable notifications" {...register("notifications")} />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
```

## Customization

All components accept `sx` prop for custom styling:

```tsx
<Input
  label="Custom Styled"
  sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
    },
  }}
/>
```

## Props

All components forward their respective Material-UI component props, so you can use any standard MUI prop along with the custom props documented above.
