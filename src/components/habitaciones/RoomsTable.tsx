import { Box, Heading, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { Room } from "../../app/habitaciones/types";
import { RoomTableRow } from "./RoomTableRow";

type RoomsTableProps = {
  rooms: Room[];
  loading: boolean;
  hasFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onEdit: (room: Room) => void;
  onToggleActive: (room: Room) => void;
  onDelete: (room: Room) => void;
  getRoomTypeName: (room: Room) => string;
  getFloorNumber: (room: Room) => number;
};

export function RoomsTable({
  rooms,
  loading,
  hasFilters,
  filteredCount,
  totalCount,
  onEdit,
  onToggleActive,
  onDelete,
  getRoomTypeName,
  getFloorNumber,
}: RoomsTableProps) {
  const { colors } = useThemeMode();

  return (
    <Box
      bg={colors.surface}
      borderColor={colors.border}
      borderWidth="2px"
      borderRadius="lg"
      p={{ base: 3, md: 5 }}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      <Heading 
        size={{ base: "sm", md: "md" }}
        color={colors.gold} 
        mb={4}
        borderBottom="2px solid"
        borderBottomColor={colors.border}
        pb={3}
        fontSize={{ base: "lg", md: "xl" }}
      >
        Listado de Habitaciones
        {hasFilters && (
          <Text as="span" color={colors.subtext} fontSize={{ base: "xs", md: "sm" }} fontWeight="normal" ml={2}>
            ({filteredCount} de {totalCount})
          </Text>
        )}
      </Heading>

      <Box overflowX="auto" display={{ base: "none", lg: "block" }}>
        <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
          <Box as="thead">
            <Box as="tr" borderBottom="2px" borderColor={colors.border}>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Número
              </Box>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Tipo
              </Box>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Precio/Noche
              </Box>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Estado
              </Box>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Piso
              </Box>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Capacidad
              </Box>
              <Box
                as="th"
                textAlign="left"
                p={3}
                color={colors.gold}
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Acciones
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {rooms.length === 0 && !loading ? (
              <Box as="tr">
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#A0AEC0",
                  }}
                >
                  {totalCount === 0
                    ? "No hay habitaciones registradas"
                    : "No hay habitaciones que coincidan con los filtros"}
                </td>
              </Box>
            ) : (
              rooms.map((room) => (
                <RoomTableRow
                  key={room._id}
                  room={room}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                  getRoomTypeName={getRoomTypeName}
                  getFloorNumber={getFloorNumber}
                />
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

