"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  Icon,
  SimpleGrid,
  Input,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import {
  FiDollarSign,
  FiCreditCard,
  FiArrowRight,
  FiRepeat,
  FiRefreshCw,
  FiFileText,
  FiFile,
  FiTrendingUp,
  FiShield,
  FiCheckCircle,
  FiLayers,
  FiGrid,
  FiShoppingBag,
  FiShoppingCart,
  FiTag,
  FiPercent,
  FiActivity,
  FiBarChart2,
  FiAward,
  FiStar,
  FiZap,
  FiGift,
  FiCircle,
  FiSquare,
  FiBox,
  FiPackage,
  FiArchive,
  FiFolder,
  FiDatabase,
  FiServer,
  FiLock,
  FiUnlock,
  FiKey,
  FiUser,
  FiUsers,
  FiHome,
  FiMapPin,
  FiSend,
  FiMail,
  FiSettings,
  FiTool,
  FiBook,
  FiEdit,
  FiCheckSquare,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,
  FiX,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiSliders,
} from "react-icons/fi";

// Mapeo de iconos disponibles para medios de pago
export const PAYMENT_ICONS = [
  // Efectivo
  { name: "FiDollarSign", icon: FiDollarSign, label: "Efectivo" },
  { name: "FiCircle", icon: FiCircle, label: "Efectivo" },
  { name: "FiSquare", icon: FiSquare, label: "Dinero" },
  { name: "FiBox", icon: FiBox, label: "Billetera" },
  
  // Tarjetas y Bancos
  { name: "FiCreditCard", icon: FiCreditCard, label: "Tarjeta" },
  { name: "FiDatabase", icon: FiDatabase, label: "Banco" },
  { name: "FiServer", icon: FiServer, label: "Servidor" },
  
  // Transferencias
  { name: "FiArrowRight", icon: FiArrowRight, label: "Transferencia" },
  { name: "FiRepeat", icon: FiRepeat, label: "Circular" },
  { name: "FiRefreshCw", icon: FiRefreshCw, label: "Actualizar" },
  { name: "FiSend", icon: FiSend, label: "Enviar" },
  { name: "FiArrowUp", icon: FiArrowUp, label: "Envío" },
  { name: "FiArrowDown", icon: FiArrowDown, label: "Recepción" },
  
  // Cheques y Documentos
  { name: "FiFileText", icon: FiFileText, label: "Cheque" },
  { name: "FiFile", icon: FiFile, label: "Documento" },
  { name: "FiArchive", icon: FiArchive, label: "Archivo" },
  { name: "FiFolder", icon: FiFolder, label: "Carpeta" },
  { name: "FiBook", icon: FiBook, label: "Libro" },
  
  // Seguridad y Aprobación
  { name: "FiCheckCircle", icon: FiCheckCircle, label: "Aprobado" },
  { name: "FiShield", icon: FiShield, label: "Seguro" },
  { name: "FiLock", icon: FiLock, label: "Bloqueado" },
  { name: "FiUnlock", icon: FiUnlock, label: "Desbloqueado" },
  { name: "FiKey", icon: FiKey, label: "Llave" },
  
  // Estadísticas y Análisis
  { name: "FiTrendingUp", icon: FiTrendingUp, label: "Crecimiento" },
  { name: "FiActivity", icon: FiActivity, label: "Actividad" },
  { name: "FiBarChart2", icon: FiBarChart2, label: "Estadísticas" },
  { name: "FiPercent", icon: FiPercent, label: "Porcentaje" },
  
  // Otros
  { name: "FiAward", icon: FiAward, label: "Premio" },
  { name: "FiStar", icon: FiStar, label: "Estrella" },
  { name: "FiZap", icon: FiZap, label: "Rápido" },
  { name: "FiGift", icon: FiGift, label: "Regalo" },
  { name: "FiTag", icon: FiTag, label: "Etiqueta" },
  { name: "FiShoppingBag", icon: FiShoppingBag, label: "Bolsa" },
  { name: "FiShoppingCart", icon: FiShoppingCart, label: "Carrito" },
  { name: "FiLayers", icon: FiLayers, label: "Capas" },
  { name: "FiGrid", icon: FiGrid, label: "Cuadrícula" },
  { name: "FiPackage", icon: FiPackage, label: "Paquete" },
  { name: "FiTool", icon: FiTool, label: "Herramienta" },
  { name: "FiSettings", icon: FiSettings, label: "Config" },
  { name: "FiUser", icon: FiUser, label: "Usuario" },
  { name: "FiUsers", icon: FiUsers, label: "Usuarios" },
  { name: "FiHome", icon: FiHome, label: "Hogar" },
  { name: "FiMapPin", icon: FiMapPin, label: "Ubicación" },
  { name: "FiMail", icon: FiMail, label: "Correo" },
  { name: "FiCheckSquare", icon: FiCheckSquare, label: "Verificado" },
  { name: "FiXCircle", icon: FiXCircle, label: "Cancelado" },
  { name: "FiAlertCircle", icon: FiAlertCircle, label: "Alerta" },
  { name: "FiInfo", icon: FiInfo, label: "Info" },
  { name: "FiHelpCircle", icon: FiHelpCircle, label: "Ayuda" },
  { name: "FiX", icon: FiX, label: "Cerrar" },
  { name: "FiPlus", icon: FiPlus, label: "Agregar" },
  { name: "FiSearch", icon: FiSearch, label: "Buscar" },
  { name: "FiFilter", icon: FiFilter, label: "Filtro" },
  { name: "FiSliders", icon: FiSliders, label: "Ajustes" },
];

interface IconSelectorProps {
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconSelector({ selectedIcon, onSelectIcon }: IconSelectorProps) {
  const { colors } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = PAYMENT_ICONS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Text color={colors.text} mb={3} fontWeight="semibold">
        Seleccionar Icono
      </Text>
      
      {/* Búsqueda */}
      <Input
        placeholder="Buscar icono..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        bg={colors.bg}
        borderColor={colors.border}
        color={colors.text}
        _hover={{ borderColor: colors.gold }}
        _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
        mb={4}
      />

      {/* Grid de iconos */}
      <Box
        maxH="350px"
        overflowY="auto"
        borderWidth="1px"
        borderColor={colors.border}
        borderRadius="md"
        p={3}
        bg={colors.bg}
      >
        <SimpleGrid columns={{ base: 4, md: 6 }} gap={3}>
          {filteredIcons.map((item) => {
            const isSelected = selectedIcon === item.name;
            return (
              <Button
                key={item.name}
                onClick={() => onSelectIcon(item.name)}
                variant="outline"
                borderWidth="2px"
                borderColor={isSelected ? colors.gold : colors.border}
                bg={isSelected ? `${colors.gold}20` : colors.surface}
                color={isSelected ? colors.gold : colors.text}
                _hover={{
                  borderColor: colors.gold,
                  bg: `${colors.gold}15`,
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
                p={2}
                h="auto"
                minH="80px"
                title={item.label}
                position="relative"
                overflow="hidden"
              >
                <Flex direction="column" align="center" justify="center" gap={1.5} w="100%" h="100%">
                  <Box fontSize="22px" flexShrink={0} mb={0.5}>
                    {item.icon && <item.icon />}
                  </Box>
                  <Text 
                    fontSize="9px" 
                    textAlign="center"
                    lineHeight="1.15"
                    wordBreak="break-word"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    w="100%"
                    px={0.5}
                    minH="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.label}
                  </Text>
                </Flex>
              </Button>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Vista previa del icono seleccionado */}
      {selectedIcon && (
        <Box mt={4} p={3} bg={colors.surface} borderRadius="md" borderWidth="1px" borderColor={colors.border}>
          <Text fontSize="sm" color={colors.subtext} mb={2}>
            Vista previa:
          </Text>
          <Flex align="center" gap={3}>
            {(() => {
              const selectedIconData = PAYMENT_ICONS.find((item) => item.name === selectedIcon);
              if (selectedIconData) {
                const IconComponent = selectedIconData.icon;
                return (
                  <>
                    <Box fontSize="32px" color={colors.gold}>
                      <IconComponent />
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color={colors.text}>
                        {selectedIconData.label}
                      </Text>
                      <Text fontSize="xs" color={colors.subtext}>
                        {selectedIconData.name}
                      </Text>
                    </Box>
                  </>
                );
              }
              return null;
            })()}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

// Función helper para renderizar un icono desde su nombre (string)
export function renderPaymentIcon(iconName?: string, fontSize: string = "20px") {
  if (!iconName) return null;
  
  const iconData = PAYMENT_ICONS.find((item) => item.name === iconName);
  if (iconData) {
    const IconComponent = iconData.icon;
    return (
      <Box fontSize={fontSize} display="inline-flex" alignItems="center">
        <IconComponent />
      </Box>
    );
  }
  
  // Fallback: si no se encuentra, intentar renderizar como emoji (compatibilidad con datos antiguos)
  return <Text fontSize={fontSize}>{iconName}</Text>;
}

