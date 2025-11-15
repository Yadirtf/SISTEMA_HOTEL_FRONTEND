"use client";

import { Box, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type StatusSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
};

export function StatusSelect({
  value,
  onChange,
  options,
  label,
  disabled = false,
}: StatusSelectProps) {
  const { colors } = useThemeMode();

  return (
    <Box>
      {label && (
        <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
          {label}
        </Text>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          backgroundColor: colors.bg,
          color: colors.text,
          borderRadius: "6px",
          padding: "8px 12px",
          border: `1px solid ${colors.border}`,
          fontSize: "14px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.gold;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border;
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.gold;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {option.label}
          </option>
        ))}
      </select>
    </Box>
  );
}

