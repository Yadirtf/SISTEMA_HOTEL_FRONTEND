import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { Room } from "../../app/habitaciones/types";
import { statusToEs } from "../../app/habitaciones/lib/status";

type RoomTableRowProps = {
  room: Room;
  onEdit: (room: Room) => void;
  onToggleActive: (room: Room) => void;
  onDelete: (room: Room) => void;
  getRoomTypeName: (room: Room) => string;
  getFloorNumber: (room: Room) => number;
};

export function RoomTableRow({
  room,
  onEdit,
  onToggleActive,
  onDelete,
  getRoomTypeName,
  getFloorNumber,
}: RoomTableRowProps) {
  const { colors, mode } = useThemeMode();
  const [isHovered, setIsHovered] = useState(false);
  
  const hoverBg = mode === "light" ? colors.gold : "#1a1a1a";
  const textColor = isHovered && mode === "light" ? "white" : colors.text;
  const subtextColor = isHovered && mode === "light" ? "white" : colors.subtext;
  const priceColor = isHovered && mode === "light" ? "white" : colors.gold;

  return (
    <Box
      as="tr"
      borderBottom="1px"
      borderColor={colors.border}
      bg={isHovered ? hoverBg : "transparent"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="all 0.2s"
    >
      <Box as="td" p={3} color={textColor} fontWeight="medium">
        {room.number}
      </Box>
      <Box as="td" p={3} color={subtextColor}>
        {getRoomTypeName(room)}
      </Box>
      <Box as="td" p={3} color={priceColor} fontWeight="semibold">
        ${formatPrice(room.pricePerNight)}
      </Box>
      <Box as="td" p={3} color={subtextColor}>
        {statusToEs[room.status] || room.status}
      </Box>
      <Box as="td" p={3} color={subtextColor}>
        {getFloorNumber(room) > 0 ? getFloorNumber(room) : "-"}
      </Box>
      <Box as="td" p={3} color={subtextColor}>
        {room.maxOccupancy ?? "-"}
      </Box>
      <Box as="td" p={3}>
        <Flex gap={2} wrap="wrap">
          <Button
            size="xs"
            bg={colors.gold}
            color={colors.bg}
            onClick={() => onEdit(room)}
            _hover={{ 
              bg: "#b8941f",
              transform: "scale(1.05)"
            }}
            transition="all 0.2s"
            fontWeight="semibold"
            borderWidth={isHovered && mode === "light" ? "1px" : "0px"}
            borderColor={isHovered && mode === "light" ? "white" : "transparent"}
            borderStyle="solid"
          >
            Editar
          </Button>
          <Button
            size="xs"
            variant="outline"
            borderColor={colors.border}
            color={isHovered && mode === "light" ? "white" : colors.subtext}
            onClick={() => onToggleActive(room)}
            _hover={{
              borderColor: mode === "light" ? "white" : colors.gold,
              color: mode === "light" ? "white" : colors.gold,
              bg: "transparent"
            }}
            transition="all 0.2s"
            style={{
              borderColor: isHovered && mode === "light" ? "white" : colors.border,
              color: isHovered && mode === "light" ? "white" : colors.subtext,
            }}
          >
            {room.isActive === true ? "Desactivar" : "Activar"}
          </Button>
          <Button
            size="xs"
            variant="outline"
            borderColor="#dc2626"
            color="#dc2626"
            onClick={() => onDelete(room)}
            _hover={{ 
              bg: "#dc2626",
              color: "white",
              transform: "scale(1.05)"
            }}
            transition="all 0.2s"
          >
            Eliminar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

