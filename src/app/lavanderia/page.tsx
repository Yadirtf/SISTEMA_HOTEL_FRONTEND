"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { FiDroplet, FiTag, FiPackage, FiShoppingCart, FiGitBranch } from "react-icons/fi";
import { useState, useCallback } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { InlineNotice } from "@/components/common/InlineNotice";
import { CategoriesTab } from "./components/CategoriesTab";
import { GarmentsTab } from "./components/GarmentsTab";
import { ServicesTab } from "./components/ServicesTab";
import { GraphViewTab } from "./components/GraphViewTab";

export default function LavanderiaPage() {
  const { colors } = useThemeMode();
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  const showNotification = useCallback((type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  }, []);

  return (
    <DashboardShell title="Lavandería">
      <Box>
        {notification && (
          <InlineNotice
            type={notification.type}
            title={notification.title}
            description={notification.description}
            onClose={() => setNotification(null)}
            colors={colors}
          />
        )}

        <Box>
          <Flex
            gap={0}
            borderBottom="2px solid"
            borderColor={colors.border}
            mb={6}
            flexWrap="wrap"
          >
            {[
              { id: 0, label: "Servicios", icon: FiShoppingCart },
              { id: 1, label: "Prendas", icon: FiPackage },
              { id: 2, label: "Categorías", icon: FiTag },
              { id: 3, label: "Vista Relacional", icon: FiGitBranch },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                borderRadius={0}
                borderBottom={activeTab === tab.id ? "3px solid" : "none"}
                borderBottomColor={activeTab === tab.id ? colors.gold : "transparent"}
                color={activeTab === tab.id ? colors.gold : colors.subtext}
                fontWeight={activeTab === tab.id ? "bold" : "normal"}
                onClick={() => setActiveTab(tab.id)}
                _hover={{
                  bg: colors.surface,
                  color: colors.gold,
                }}
                px={6}
                py={4}
              >
                <Flex align="center" gap={2} justify="center">
                  <Icon as={tab.icon} fontSize="lg" />
                  <Text>{tab.label}</Text>
                </Flex>
              </Button>
            ))}
          </Flex>

          {activeTab === 0 && <ServicesTab showNotification={showNotification} />}
          {activeTab === 1 && <GarmentsTab showNotification={showNotification} />}
          {activeTab === 2 && <CategoriesTab showNotification={showNotification} />}
          {activeTab === 3 && <GraphViewTab showNotification={showNotification} />}
        </Box>
      </Box>
    </DashboardShell>
  );
}

