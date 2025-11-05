import { Box, Stack, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { Room } from "../../app/habitaciones/types";
import { RoomsCard } from "./RoomsCard";

type RoomsCardListProps = {
  rooms: Room[];
  loading: boolean;
  totalCount: number;
  onEdit: (room: Room) => void;
  onToggleActive: (room: Room) => void;
  onDelete: (room: Room) => void;
  getRoomTypeName: (room: Room) => string;
  getFloorNumber: (room: Room) => number;
};

export function RoomsCardList({
  rooms,
  loading,
  totalCount,
  onEdit,
  onToggleActive,
  onDelete,
  getRoomTypeName,
  getFloorNumber,
}: RoomsCardListProps) {
  const { colors } = useThemeMode();

  if (rooms.length === 0 && !loading) {
    return (
      <Box
        textAlign="center"
        p={8}
        color={colors.subtext}
        fontSize="sm"
      >
        {totalCount === 0
          ? "No hay habitaciones registradas"
          : "No hay habitaciones que coincidan con los filtros"}
      </Box>
    );
  }

  return (
    <Box display={{ base: "block", lg: "none" }}>
      <Stack gap={4}>
        {rooms.map((room) => (
          <RoomsCard
            key={room._id}
            room={room}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
            getRoomTypeName={getRoomTypeName}
            getFloorNumber={getFloorNumber}
          />
        ))}
      </Stack>
    </Box>
  );
}

