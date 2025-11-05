"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ReservationsBell } from "@/components/notifications/ReservationsBell";
import { getToken } from "@/lib/session";
import { useThemeMode } from "@/components/theme/ThemeProvider";

const BLACK = "#0b0b0b";

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const { colors } = useThemeMode();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <Flex minH="100vh" bg={colors.bg}>
      <Box 
        display={{ base: open ? "block" : "none", md: "block" }} 
        pos="fixed" 
        top={0}
        left={0}
        bottom={0}
        zIndex={20} 
        w={{ base: "75%", md: "256px" }}
        overflowY="auto"
      >
        <Sidebar />
      </Box>
      {open && (
        <Box onClick={() => setOpen(false)} display={{ base: "block", md: "none" }} pos="fixed" inset={0} bg="rgba(0,0,0,0.35)" zIndex={10} />
      )}
      <Box 
        flex="1" 
        color={colors.text}
        ml={{ base: 0, md: "256px" }}
      >
        <TopBar title={title} onOpenMenu={() => setOpen(true)} extra={<ReservationsBell />} />
        <Box p={6}>{children}</Box>
      </Box>
    </Flex>
  );
}


