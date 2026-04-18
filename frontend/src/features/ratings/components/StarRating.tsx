import { Box, Typography, SxProps, Theme } from "@mui/material";
import { Star, StarBorder, StarHalf } from "@mui/icons-material";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  count?: number;
  size?: "small" | "medium" | "large";
  readOnly?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  onChange?: (value: number) => void;
  sx?: SxProps<Theme>;
}

const sizeMap = {
  small: 16,
  medium: 24,
  large: 32,
};

export const StarRating = ({
  value,
  count,
  size = "medium",
  readOnly = true,
  showValue = true,
  showCount = true,
  onChange,
  sx,
}: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const iconSize = sizeMap[size];
  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const filled = displayValue >= starValue;
    const halfFilled = !filled && displayValue >= starValue - 0.5;

    const starProps = {
      sx: {
        fontSize: iconSize,
        color: filled || halfFilled ? "#f59e0b" : "#d1d5db",
        cursor: readOnly ? "default" : "pointer",
        transition: "color 0.15s ease, transform 0.15s ease",
        "&:hover": !readOnly
          ? {
              transform: "scale(1.1)",
            }
          : {},
      },
      onClick: () => handleClick(starValue),
      onMouseEnter: () => handleMouseEnter(starValue),
    };

    if (filled) {
      return <Star key={index} {...starProps} />;
    }
    if (halfFilled) {
      return <StarHalf key={index} {...starProps} />;
    }
    return <StarBorder key={index} {...starProps} />;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        ...sx,
      }}
      onMouseLeave={handleMouseLeave}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </Box>
      {showValue && value > 0 && (
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.primary"
          sx={{ ml: 0.5 }}
        >
          {value.toFixed(1)}
        </Typography>
      )}
      {showCount && count !== undefined && count > 0 && (
        <Typography variant="body2" color="text.secondary">
          ({count})
        </Typography>
      )}
    </Box>
  );
};

export default StarRating;
