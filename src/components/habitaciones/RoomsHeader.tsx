import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { RoomFilters } from "@/components/habitaciones/RoomFilters";
import { RoomType, Floor } from "../../app/habitaciones/types";

type RoomsHeaderProps = {
  floorFilter: string;
  typeFilter: string;
  statusFilter: string;
  onFloorChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  roomTypes: RoomType[];
  floors: Floor[];
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
};

export function RoomsHeader({
  floorFilter,
  typeFilter,
  statusFilter,
  onFloorChange,
  onTypeChange,
  onStatusChange,
  roomTypes,
  floors,
  onRefresh,
  onCreate,
  loading,
}: RoomsHeaderProps) {
  const { colors } = useThemeMode();

  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "end" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      p={{ base: 3, md: 5 }}
      bg={colors.surface}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={colors.border}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      <RoomFilters
        floorFilter={floorFilter}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onFloorChange={onFloorChange}
        onTypeChange={onTypeChange}
        onStatusChange={onStatusChange}
        roomTypes={roomTypes}
        floors={floors}
      />

      <Flex 
        gap={3} 
        align="end" 
        direction={{ base: "column", md: "row" }}
        w={{ base: "100%", md: "auto" }}
      >
        <Button
          size={{ base: "md", md: "sm" }}
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          borderColor={colors.border}
          color={colors.subtext}
          bg="transparent"
          _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
          transition="all 0.2s"
          w={{ base: "100%", md: "auto" }}
        >
          <Flex align="center" gap={2}>
            <Icon as={FiRefreshCw} />
            <Text>{loading ? "Cargando..." : "Refrescar"}</Text>
          </Flex>
        </Button>
        <Button
          onClick={onCreate}
          bg={colors.gold}
          color={colors.bg}
          fontWeight="bold"
          size={{ base: "md", md: "md" }}
          _hover={{ 
            bg: "#b8941f",
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px ${colors.gold}40`
          }}
          transition="all 0.2s"
          boxShadow={`0 2px 8px ${colors.gold}50`}
          w={{ base: "100%", md: "auto" }}
        >
          <Flex align="center" gap={2}>
            <Icon as={FiPlus} />
            <Text>Registrar Habitación</Text>
          </Flex>
        </Button>
      </Flex>
    </Flex>
  );
}

