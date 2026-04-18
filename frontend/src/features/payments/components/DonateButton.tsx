import { useState } from "react";
import { Button, ButtonProps } from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DonationDialog } from "./DonationDialog";

interface DonateButtonProps extends Omit<ButtonProps, "onClick"> {
  label?: string;
}

export const DonateButton = ({
  label,
  ...buttonProps
}: DonateButtonProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        color="error"
        startIcon={<Favorite />}
        onClick={() => setOpen(true)}
        {...buttonProps}
      >
        {label || t("nav.donate")}
      </Button>

      <DonationDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};




