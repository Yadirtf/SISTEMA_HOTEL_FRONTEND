"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import * as React from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getSessionUser } from "@/lib/session";

const GOLD = "#d4af37";
const BLACK = "#0b0b0b";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Panel", href: "/panel" },
  { label: "Reservas", href: "/reservas" },
  { label: "Huéspedes", href: "/huespedes" },
  { label: "Habitaciones", href: "/habitaciones" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useThemeMode();

  const user = getSessionUser();
  const isAdmin = user?.rol === "Administrador";
  const isAdminSection = pathname.startsWith("/panel/admin");
  const [adminOpen, setAdminOpen] = React.useState(false);
  React.useEffect(() => {
    if (isAdminSection) setAdminOpen(true);
  }, [isAdminSection]);

  return (
    <Box
      as="nav"
      w={{ base: "full", md: 64 }}
      bg={colors.surface}
      color={colors.text}
      borderRightWidth={{ base: 0, md: "1px" }}
      borderColor={colors.border}
      minH={{ base: "auto", md: "100vh" }}
      p={4}
    >
      <Text fontWeight="bold" letterSpacing="wide" mb={6} color={colors.text}>
        Sistema Hotel
      </Text>
      <Stack gap={2}>
        {[...NAV_ITEMS].map((item) => {
          const active = pathname === item.href;
          return (
            <Button
              key={item.href}
              onClick={() => router.push(item.href)}
              justifyContent="flex-start"
              variant="ghost"
              bg={active ? "rgba(212,175,55,0.16)" : "transparent"}
              _hover={{ bg: "rgba(212,175,55,0.22)" }}
              color={colors.text}
            >
              {item.label}
            </Button>
          );
        })}

        {isAdmin && (
          <>
            <Button
              onClick={() => setAdminOpen((v) => !v)}
              justifyContent="flex-start"
              variant="ghost"
              bg={isAdminSection ? "rgba(212,175,55,0.16)" : "transparent"}
              _hover={{ bg: "rgba(212,175,55,0.22)" }}
              color={colors.text}
            >
              Administrar
            </Button>
            {adminOpen && (
              <Stack pl={4} gap={1}>
                <Button
                  onClick={() => router.push("/panel/admin/historial")}
                  justifyContent="flex-start"
                  variant="ghost"
                  bg={pathname === "/panel/admin/historial" ? "rgba(212,175,55,0.16)" : "transparent"}
                  _hover={{ bg: "rgba(212,175,55,0.22)" }}
                  color={colors.text}
                >
                  Historial
                </Button>
                <Button
                  onClick={() => router.push("/panel/admin/usuarios")}
                  justifyContent="flex-start"
                  variant="ghost"
                  bg={pathname === "/panel/admin/usuarios" ? "rgba(212,175,55,0.16)" : "transparent"}
                  _hover={{ bg: "rgba(212,175,55,0.22)" }}
                  color={colors.text}
                >
                  Usuarios
                </Button>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}


