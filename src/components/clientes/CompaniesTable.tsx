import { Box, Heading, Text, Badge, Button, Flex, Icon } from "@chakra-ui/react";
import { FiEdit, FiXCircle, FiCheckCircle, FiTrash2, FiPhone, FiMail, FiMapPin, FiUser } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { Company } from "../../app/huespedes/types";

type CompaniesTableProps = {
  companies: Company[];
  loading: boolean;
  hasFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onEdit: (company: Company) => void;
  onDeactivate: (company: Company) => void;
  onActivate: (company: Company) => void;
  onDelete: (company: Company) => void;
};

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: "green.500", color: "white" },
  inactive: { bg: "gray.500", color: "white" },
};

export function CompaniesTable({
  companies,
  loading,
  hasFilters,
  filteredCount,
  totalCount,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: CompaniesTableProps) {
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
        <Text color={colors.subtext}>Cargando empresas...</Text>
      </Box>
    );
  }

  if (companies.length === 0) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext}>No se encontraron empresas</Text>
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
        Listado de Empresas
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
              {["Nombre", "NIT", "Dirección", "Contacto", "Teléfono", "Email", "Estado", "Acciones"].map((header) => (
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
            {companies.map((company) => (
              <Box
                key={company._id}
                as="tr"
                borderBottom="1px"
                borderColor={colors.border}
                _hover={{ bg: colors.bg }}
                transition="background 0.2s"
              >
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  <Text fontWeight="semibold">{company.name}</Text>
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {company.nit}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {company.address || "-"}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {company.contact || "-"}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {company.phone || "-"}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {company.email || "-"}
                </Box>
                <Box as="td" p={3}>
                  <Badge
                    bg={statusColors[company.status]?.bg || "gray.500"}
                    color={statusColors[company.status]?.color || "white"}
                  >
                    {company.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                </Box>
                <Box as="td" p={3}>
                  <Flex gap={2} wrap="wrap">
                    <Button
                      size="xs"
                      bg={colors.gold}
                      color={colors.bg}
                      onClick={() => onEdit(company)}
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
                    {company.status === "active" ? (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor={colors.border}
                        color={colors.subtext}
                        onClick={() => onDeactivate(company)}
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
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="green.500"
                        color="green.400"
                        onClick={() => onActivate(company)}
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
                    )}
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor="red.500"
                      color="red.400"
                      onClick={() => onDelete(company)}
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
          {companies.map((company) => (
            <Box
              key={company._id}
              p={4}
              bg={colors.bg}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Flex justify="space-between" align="start" mb={2}>
                <Box>
                  <Text fontWeight="bold" color={colors.text} fontSize="md">
                    {company.name}
                  </Text>
                  <Text color={colors.subtext} fontSize="sm">
                    NIT: {company.nit}
                  </Text>
                  {company.address && (
                    <Flex align="center" gap={1} color={colors.subtext} fontSize="sm" mt={1}>
                      <Icon as={FiMapPin} />
                      <Text>{company.address}</Text>
                    </Flex>
                  )}
                </Box>
                <Badge
                  bg={statusColors[company.status]?.bg || "gray.500"}
                  color={statusColors[company.status]?.color || "white"}
                >
                  {company.status === "active" ? "Activa" : "Inactiva"}
                </Badge>
              </Flex>
              {(company.contact || company.phone || company.email) && (
                <Flex align="center" gap={2} color={colors.subtext} fontSize="sm" mb={2} flexWrap="wrap">
                  {company.contact && (
                    <>
                      <Icon as={FiUser} />
                      <Text>{company.contact}</Text>
                    </>
                  )}
                  {company.phone && (
                    <>
                      <Text>•</Text>
                      <Icon as={FiPhone} />
                      <Text>{company.phone}</Text>
                    </>
                  )}
                  {company.email && (
                    <>
                      <Text>•</Text>
                      <Icon as={FiMail} />
                      <Text>{company.email}</Text>
                    </>
                  )}
                </Flex>
              )}
              <Flex gap={2}>
                <Button
                  onClick={() => onEdit(company)}
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
                {company.status === "active" ? (
                  <Button
                    onClick={() => onDeactivate(company)}
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
                ) : (
                  <Button
                    onClick={() => onActivate(company)}
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
                )}
                <Button
                  onClick={() => onDelete(company)}
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

