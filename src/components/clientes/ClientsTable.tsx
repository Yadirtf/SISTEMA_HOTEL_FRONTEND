import { Box, Heading, Text, Badge, Button, Flex, Icon } from "@chakra-ui/react";
import { FiEdit, FiXCircle, FiCheckCircle, FiTrash2, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { Client } from "../../app/huespedes/types";

type ClientsTableProps = {
  clients: Client[];
  loading: boolean;
  hasFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onEdit: (client: Client) => void;
  onDeactivate: (client: Client) => void;
  onActivate: (client: Client) => void;
  onDelete: (client: Client) => void;
};

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: "green.500", color: "white" },
  inactive: { bg: "gray.500", color: "white" },
  blacklisted: { bg: "red.500", color: "white" },
};

export function ClientsTable({
  clients,
  loading,
  hasFilters,
  filteredCount,
  totalCount,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: ClientsTableProps) {
  const { colors } = useThemeMode();

  if (loading) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext}>Cargando huéspedes...</Text>
      </Box>
    );
  }

  if (clients.length === 0) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext}>No se encontraron huéspedes</Text>
      </Box>
    );
  }

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
        Listado de Huéspedes
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
              {["Documento", "Nombre", "Teléfono", "Email", "Tipo", "Estado", "Visitas", "Acciones"].map((header) => (
                <Box
                  key={header}
                  as="th"
                  textAlign="left"
                  p={3}
                  color={colors.gold}
                  fontSize="sm"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {clients.map((client) => (
              <Box
                key={client._id}
                as="tr"
                borderBottom="1px"
                borderColor={colors.border}
                _hover={{ bg: colors.bg }}
                transition="background 0.2s"
              >
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {client.documentNumber}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  <Text fontWeight="semibold">{client.firstName} {client.lastName}</Text>
                  {client.isCompanyClient && client.company && (
                    <Text fontSize="xs" color={colors.subtext} mt={1}>
                      {client.company.name}
                    </Text>
                  )}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {client.phoneNumber}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {client.email || "-"}
                </Box>
                <Box as="td" p={3}>
                  {client.isCompanyClient ? (
                    <Badge colorScheme="purple" bg="purple.500" color="white">
                      Empresa
                    </Badge>
                  ) : (
                    <Badge colorScheme="blue" bg="blue.500" color="white">
                      Regular
                    </Badge>
                  )}
                </Box>
                <Box as="td" p={3}>
                  <Badge
                    bg={statusColors[client.status]?.bg || "gray.500"}
                    color={statusColors[client.status]?.color || "white"}
                  >
                    {client.status === "active" ? "Activo" : 
                     client.status === "inactive" ? "Inactivo" : "Lista Negra"}
                  </Badge>
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {client.totalVisits || 0}
                </Box>
                <Box as="td" p={3}>
                  <Flex gap={2} wrap="wrap">
                    <Button
                      size="xs"
                      bg={colors.gold}
                      color={colors.bg}
                      onClick={() => onEdit(client)}
                      _hover={{ 
                        bg: "#b8941f",
                        transform: "scale(1.05)"
                      }}
                      transition="all 0.2s"
                      fontWeight="semibold"
                    >
                      <Flex align="center" gap={1}>
                        <Icon as={FiEdit} />
                        <Text>Editar</Text>
                      </Flex>
                    </Button>
                    {client.status === "active" ? (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor={colors.border}
                        color={colors.subtext}
                        onClick={() => onDeactivate(client)}
                        _hover={{
                          borderColor: colors.gold,
                          color: colors.gold,
                          bg: "transparent"
                        }}
                        transition="all 0.2s"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiXCircle} />
                          <Text>Desactivar</Text>
                        </Flex>
                      </Button>
                    ) : client.status === "inactive" ? (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="green.500"
                        color="green.400"
                        onClick={() => onActivate(client)}
                        _hover={{
                          borderColor: "green.300",
                          color: "green.300",
                          bg: "transparent"
                        }}
                        transition="all 0.2s"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiCheckCircle} />
                          <Text>Activar</Text>
                        </Flex>
                      </Button>
                    ) : null}
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor="red.500"
                      color="red.400"
                      onClick={() => onDelete(client)}
                      _hover={{
                        borderColor: "red.300",
                        color: "red.300",
                        bg: "transparent"
                      }}
                      transition="all 0.2s"
                    >
                      <Flex align="center" gap={1}>
                        <Icon as={FiTrash2} />
                        <Text>Eliminar</Text>
                      </Flex>
                    </Button>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Vista móvil */}
      <Box display={{ base: "block", lg: "none" }}>
        <Box as="div" display="flex" flexDirection="column" gap={4}>
          {clients.map((client) => (
            <Box
              key={client._id}
              p={4}
              bg={colors.bg}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Flex justify="space-between" align="start" mb={2}>
                <Box>
                  <Text fontWeight="bold" color={colors.text} fontSize="md">
                    {client.firstName} {client.lastName}
                  </Text>
                  <Text color={colors.subtext} fontSize="sm">
                    {client.documentNumber}
                  </Text>
                  {client.isCompanyClient && client.company && (
                    <Text color={colors.gold} fontSize="sm" mt={1}>
                      {client.company.name}
                    </Text>
                  )}
                </Box>
                <Box>
                  {client.isCompanyClient ? (
                    <Badge colorScheme="purple" bg="purple.500" color="white" mb={1}>
                      Empresa
                    </Badge>
                  ) : (
                    <Badge colorScheme="blue" bg="blue.500" color="white" mb={1}>
                      Regular
                    </Badge>
                  )}
                  <Badge
                    bg={statusColors[client.status]?.bg || "gray.500"}
                    color={statusColors[client.status]?.color || "white"}
                    display="block"
                  >
                    {client.status === "active" ? "Activo" : 
                     client.status === "inactive" ? "Inactivo" : "Lista Negra"}
                  </Badge>
                </Box>
              </Flex>
              <Flex align="center" gap={2} color={colors.subtext} fontSize="sm" mb={2}>
                <Icon as={FiPhone} />
                <Text>{client.phoneNumber}</Text>
                {client.email && (
                  <>
                    <Text>•</Text>
                    <Icon as={FiMail} />
                    <Text>{client.email}</Text>
                  </>
                )}
              </Flex>
              <Text color={colors.subtext} fontSize="sm" mb={3}>
                Visitas: {client.totalVisits || 0}
              </Text>
              <Flex gap={2}>
                <Button
                  onClick={() => onEdit(client)}
                  flex="1"
                  size="sm"
                  bg={colors.surface}
                  borderWidth="1px"
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ bg: colors.bg, borderColor: colors.gold }}
                >
                  <Flex align="center" gap={1}>
                    <Icon as={FiEdit} />
                    <Text>Editar</Text>
                  </Flex>
                </Button>
                {client.status === "active" ? (
                  <Button
                    onClick={() => onDeactivate(client)}
                    flex="1"
                    size="sm"
                    variant="outline"
                    borderColor={colors.border}
                    color={colors.subtext}
                    _hover={{ borderColor: colors.gold, color: colors.gold }}
                  >
                    <Flex align="center" gap={1}>
                      <Icon as={FiXCircle} />
                      <Text>Desactivar</Text>
                    </Flex>
                  </Button>
                ) : client.status === "inactive" ? (
                  <Button
                    onClick={() => onActivate(client)}
                    flex="1"
                    size="sm"
                    variant="outline"
                    borderColor="green.500"
                    color="green.400"
                    _hover={{ borderColor: "green.300", color: "green.300" }}
                  >
                    <Flex align="center" gap={1}>
                      <Icon as={FiCheckCircle} />
                      <Text>Activar</Text>
                    </Flex>
                  </Button>
                ) : null}
                <Button
                  onClick={() => onDelete(client)}
                  flex="1"
                  size="sm"
                  variant="outline"
                  borderColor="red.500"
                  color="red.400"
                  _hover={{ borderColor: "red.300", color: "red.300" }}
                >
                  <Flex align="center" gap={1}>
                    <Icon as={FiTrash2} />
                    <Text>Eliminar</Text>
                  </Flex>
                </Button>
              </Flex>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

