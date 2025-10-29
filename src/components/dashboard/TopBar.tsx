"use client";

import { ReactNode } from "react";
import { Box, Button, Flex, Heading, IconButton } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { clearSession } from "@/lib/session";
import { useRouter } from "next/navigation";

const GOLD = "#d4af37";
const BLACK = "#0b0b0b";

export function TopBar({ title, extra, onOpenMenu }: { title: string; extra?: ReactNode; onOpenMenu?: () => void }) {
  const router = useRouter();
  const { mode, toggle, colors } = useThemeMode();

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  return (
    <Box bg={colors.surface} color={colors.text} borderBottomWidth="1px" borderColor={colors.border} px={6} py={4}>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={3}>
          <IconButton aria-label="Abrir menú" onClick={onOpenMenu} display={{ base: "inline-flex", md: "none" }}>
            ☰
          </IconButton>
          <Heading size="md" color={colors.text}>{title}</Heading>
        </Flex>
        <Flex align="center" gap={3}>
          <Button size="sm" variant="outline" onClick={toggle} borderColor={colors.border} color={colors.text} _hover={{ bg: colors.bg }}>
            {mode === "dark" ? "Modo claro" : "Modo oscuro"}
          </Button>
          {extra}
          <Button size="sm" variant="outline" color={colors.text} borderColor={colors.border} _hover={{ bg: colors.bg }} onClick={logout}>
            Cerrar sesión
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}


