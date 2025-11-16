"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { InlineNotice } from "@/components/common/InlineNotice";
import { ProductsTab } from "./components/ProductsTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { SalesTab } from "./components/SalesTab";
import { ReportsTab } from "./components/ReportsTab";
import { ReturnsTab } from "./components/ReturnsTab";

export default function TiendaPage() {
  const { colors } = useThemeMode();
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  const showNotification = useCallback((type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  }, []);

  return (
    <DashboardShell title="Tienda / Mecato">
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
              { id: 0, label: "Ventas" },
              { id: 1, label: "Devoluciones" },
              { id: 2, label: "Reportes" },
              { id: 3, label: "Productos" },
              { id: 4, label: "Categorías" },
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
                {tab.label}
              </Button>
            ))}
          </Flex>

          {activeTab === 0 && <SalesTab showNotification={showNotification} />}
          {activeTab === 1 && <ReturnsTab showNotification={showNotification} />}
          {activeTab === 2 && <ReportsTab showNotification={showNotification} />}
          {activeTab === 3 && <ProductsTab showNotification={showNotification} />}
          {activeTab === 4 && <CategoriesTab showNotification={showNotification} />}
        </Box>
      </Box>
    </DashboardShell>
  );
}

