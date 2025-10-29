"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
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
      <Box display={{ base: open ? "block" : "none", md: "block" }} pos={{ base: "fixed", md: "relative" }} inset={{ base: 0, md: "auto" }} zIndex={20} w={{ base: "75%", md: "auto" }}>
        <Sidebar />
      </Box>
      {open && (
        <Box onClick={() => setOpen(false)} display={{ base: "block", md: "none" }} pos="fixed" inset={0} bg="rgba(0,0,0,0.35)" zIndex={10} />
      )}
      <Box flex="1" color={colors.text}>
        <TopBar title={title} onOpenMenu={() => setOpen(true)} />
        <Box p={6}>{children}</Box>
      </Box>
    </Flex>
  );
}


