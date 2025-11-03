"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Stack, Text, Flex } from "@chakra-ui/react";
import * as React from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getSessionUser, clearSession } from "@/lib/session";

const GOLD = "#d4af37";
const BLACK = "#0b0b0b";

type NavItem = { label: string; href: string; subItems?: { label: string; href: string }[] };

const NAV_ITEMS: NavItem[] = [
  { label: "Panel", href: "/panel" },
  { label: "Reservas", href: "/reservas" },
  { label: "Huéspedes", href: "/huespedes" },
  { 
    label: "Gestionar habitaciones", 
    href: "/habitaciones",
    subItems: [
      { label: "Crear habitación", href: "/habitaciones" },
      { label: "Crear tipo", href: "/habitaciones/crear-tipo" }
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { colors, mode, toggle } = useThemeMode();

  const user = getSessionUser();
  const isAdmin = user?.rol === "Administrador";
  const isAdminSection = pathname.startsWith("/panel/admin");
  const isHabitacionesSection = pathname.startsWith("/habitaciones");
  // Evitar mismatch SSR/CSR: hidratar y luego decidir render condicional
  const [hydrated, setHydrated] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState<boolean>(false);
  const [habitacionesOpen, setHabitacionesOpen] = React.useState<boolean>(false);
  React.useEffect(() => {
    setHydrated(true);
    setAdminOpen(isAdminSection);
    setHabitacionesOpen(isHabitacionesSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminSection, isHabitacionesSection]);

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  return (
    <Box
      as="nav"
      w="full"
      h="100vh"
      bg={colors.surface}
      color={colors.text}
      borderRightWidth="1px"
      borderColor={colors.border}
      p={4}
      overflowY="auto"
      display="flex"
      flexDirection="column"
    >
      <Text fontWeight="bold" letterSpacing="wide" mb={6} color={colors.text}>
        Sistema Hotel
      </Text>
      <Stack gap={2} flex="1">
        {[...NAV_ITEMS].map((item) => {
          const active = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          if (hasSubItems) {
            const isOpen = item.label === "Gestionar habitaciones" ? habitacionesOpen : false;
            const isSection = item.label === "Gestionar habitaciones" ? isHabitacionesSection : false;
            
            return (
              <React.Fragment key={item.href}>
                <Button
                  onClick={() => {
                    if (item.label === "Gestionar habitaciones") {
                      setHabitacionesOpen((v) => !v);
                    }
                  }}
                  justifyContent="flex-start"
                  variant="ghost"
                  bg={isSection ? "rgba(212,175,55,0.16)" : "transparent"}
                  _hover={{ bg: "rgba(212,175,55,0.22)" }}
                  color={colors.text}
                >
                  {item.label}
                </Button>
                {item.label === "Gestionar habitaciones" && isOpen && item.subItems && (
                  <Stack pl={4} gap={1}>
                    {item.subItems.map((subItem) => {
                      const subActive = pathname === subItem.href;
                      return (
                        <Button
                          key={subItem.href}
                          onClick={() => router.push(subItem.href)}
                          justifyContent="flex-start"
                          variant="ghost"
                          bg={subActive ? "rgba(212,175,55,0.16)" : "transparent"}
                          _hover={{ bg: "rgba(212,175,55,0.22)" }}
                          color={colors.text}
                        >
                          {subItem.label}
                        </Button>
                      );
                    })}
                  </Stack>
                )}
              </React.Fragment>
            );
          }
          
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

        {hydrated && isAdmin && (
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

      {/* Sección inferior con botones de configuración */}
      <Box mt="auto" pt={4}>
        <Box 
          borderTopWidth="1px" 
          borderColor={colors.border} 
          mb={4}
        />
        <Stack gap={2}>
          <Button
            onClick={toggle}
            justifyContent="flex-start"
            variant="ghost"
            bg="transparent"
            _hover={{ bg: "rgba(212,175,55,0.22)" }}
            color={colors.text}
            size="md"
          >
            <Flex align="center" gap={2}>
              <Text fontSize="lg">
                {mode === "dark" ? "🌞" : "🌙"}
              </Text>
              <Text>{mode === "dark" ? "Modo Claro" : "Modo Oscuro"}</Text>
            </Flex>
          </Button>
          <Button
            onClick={logout}
            justifyContent="flex-start"
            variant="ghost"
            bg="transparent"
            _hover={{ bg: "rgba(212,175,55,0.22)" }}
            color={colors.text}
            size="md"
          >
            <Flex align="center" gap={2}>
              <Text fontSize="lg">🚪</Text>
              <Text>Cerrar Sesión</Text>
            </Flex>
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}


