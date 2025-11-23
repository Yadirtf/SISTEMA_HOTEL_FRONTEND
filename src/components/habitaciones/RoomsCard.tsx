import { Box, Button, Flex, Text, Icon } from "@chakra-ui/react";
import { FiEdit, FiCheckCircle, FiXCircle, FiTrash2 } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { Room } from "../../app/habitaciones/types";
import { statusToEs } from "../../app/habitaciones/lib/status";

type RoomsCardProps = {
  room: Room;
  onEdit: (room: Room) => void;
  onToggleActive: (room: Room) => void;
  onDelete: (room: Room) => void;
  getRoomTypeName: (room: Room) => string;
  getFloorNumber: (room: Room) => number;
};

export function RoomsCard({
  room,
  onEdit,
  onToggleActive,
  onDelete,
  getRoomTypeName,
  getFloorNumber,
}: RoomsCardProps) {
  const { colors } = useThemeMode();

  return (
    <Box
      p={4}
      bg={colors.bg}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="md"
      boxShadow="sm"
    >
      <Flex justify="space-between" align="start" mb={3} wrap="wrap" gap={2}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color={colors.gold} mb={1}>
            Habitación {room.number}
          </Text>
          <Text fontSize="sm" color={colors.subtext}>
            {getRoomTypeName(room)}
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
            ${formatPrice(room.pricePerNight)}
          </Text>
          <Text fontSize="xs" color={colors.subtext}>
            por noche
          </Text>
        </Box>
      </Flex>

      <Flex gap={4} mb={4} wrap="wrap">
        <Box>
          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
            Estado
          </Text>
          <Text fontSize="sm" color={colors.text} fontWeight="medium">
            {statusToEs[room.status] || room.status}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
            Piso
          </Text>
          <Text fontSize="sm" color={colors.text} fontWeight="medium">
            {getFloorNumber(room) || "-"}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
            Capacidad
          </Text>
          <Text fontSize="sm" color={colors.text} fontWeight="medium">
            {room.maxOccupancy ?? "-"} personas
          </Text>
        </Box>
      </Flex>

      <Flex gap={2} wrap="wrap">
        <Button
          size="sm"
          bg={colors.gold}
          color={colors.bg}
          onClick={() => onEdit(room)}
          _hover={{ 
            bg: "#b8941f",
            transform: "scale(1.05)"
          }}
          transition="all 0.2s"
          fontWeight="semibold"
          flex="1"
          minW="80px"
        >
          <Flex align="center" gap={1}>
            <Icon as={FiEdit} />
            <Text>Editar</Text>
          </Flex>
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor={colors.border}
          color={colors.subtext}
          onClick={() => onToggleActive(room)}
          _hover={{
            borderColor: colors.gold,
            color: colors.gold,
            bg: "transparent"
          }}
          transition="all 0.2s"
          flex="1"
          minW="80px"
        >
          <Flex align="center" gap={1}>
            <Icon as={room.isActive === true ? FiXCircle : FiCheckCircle} />
            <Text>{room.isActive === true ? "Desactivar" : "Activar"}</Text>
          </Flex>
        </Button>
        <Button
          size="sm"
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
          flex="1"
          minW="80px"
        >
          <Flex align="center" gap={1}>
            <Icon as={FiTrash2} />
            <Text>Eliminar</Text>
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
}

