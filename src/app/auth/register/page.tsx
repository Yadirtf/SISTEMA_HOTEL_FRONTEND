"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { Box, Button, Container, Field, Heading, Input, Link, Stack, Text, Flex, Icon } from "@chakra-ui/react";
import NextLink from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { FiMail } from "react-icons/fi";

type UserResponseDto = {
  idUsuario: number;
  correo: string;
  createDate: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [isRegisterAvailable, setIsRegisterAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleFormData, setGoogleFormData] = useState<{ nombre: string; apellido: string; telefono: string } | null>(null);

  // Verificar si el registro está disponible
  useEffect(() => {
    const checkRegisterAvailability = async () => {
      setIsChecking(true);
      try {
        const resp = await apiGet<{ available: boolean }>("/auth/register/available");
        if (resp.success && resp.data) {
          setIsRegisterAvailable(resp.data.available);
        } else {
          setIsRegisterAvailable(false);
        }
      } catch (err) {
        setIsRegisterAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkRegisterAvailability();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!correo || !contrasena || !nombre || !apellido || !telefono) {
      setErrorMsg("Complete todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await apiPost<UserResponseDto, { correo: string; contrasena: string; nombre: string; apellido: string; telefono: string }>(
        "/auth/register",
        { correo, contrasena, nombre, apellido, telefono }
      );

      if (!resp || resp.success === false || !resp.data) {
        setErrorMsg(resp?.message || "No se pudo registrar");
        // Si el error indica que el registro está desactivado, actualizar el estado
        if (resp?.message?.includes("desactivado")) {
          setIsRegisterAvailable(false);
        }
        return;
      }

      // Después de registrar exitosamente, verificar de nuevo la disponibilidad
      setIsRegisterAvailable(false);
      router.push("/auth/login");
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo registrar");
      // Si hay una excepción, asumir que el registro podría estar desactivado
      setIsRegisterAvailable(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMsg(null);
    
    if (!auth || !googleProvider) {
      setErrorMsg("Firebase no está configurado correctamente. Verifica las variables de entorno.");
      return;
    }
    
    setIsGoogleLoading(true);
    try {
      // Autenticar con Google usando Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Extraer nombre y apellido del usuario de Google
      const displayName = result.user.displayName || "";
      const nameParts = displayName.split(" ");
      const nombre = nameParts[0] || "";
      const apellido = nameParts.slice(1).join(" ") || "";

      // Mostrar modal para completar datos (teléfono es requerido)
      setGoogleFormData({ nombre, apellido, telefono: "" });
      
      // Guardar el token temporalmente para usarlo después
      (window as any).__googleIdToken = idToken;
    } catch (err: any) {
      console.error("Error en registro con Google:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg("Se cerró la ventana de autenticación");
      } else {
        setErrorMsg(err?.message || "No se pudo autenticar con Google");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCompleteGoogleRegister = async () => {
    if (!googleFormData || !googleFormData.telefono) {
      setErrorMsg("El teléfono es requerido");
      return;
    }

    const idToken = (window as any).__googleIdToken;
    if (!idToken) {
      setErrorMsg("Error: token de Google no encontrado. Por favor, intenta de nuevo.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const resp = await apiPost<UserResponseDto, { idToken: string; nombre: string; apellido: string; telefono: string }>(
        "/auth/register/google",
        {
          idToken,
          nombre: googleFormData.nombre,
          apellido: googleFormData.apellido,
          telefono: googleFormData.telefono,
        }
      );

      if (!resp || resp.success === false || !resp.data) {
        setErrorMsg(resp?.message || "No se pudo registrar");
        if (resp?.message?.includes("desactivado")) {
          setIsRegisterAvailable(false);
        }
        return;
      }

      // Limpiar token temporal
      delete (window as any).__googleIdToken;
      setGoogleFormData(null);
      setIsRegisterAvailable(false);
      router.push("/auth/login");
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo registrar");
      setIsRegisterAvailable(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar mensaje de carga mientras verifica
  if (isChecking) {
    return (
      <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" py={{ base: 10, md: 16 }}>
        <Flex direction="column" align="center" justify="center">
          <Container maxW="md">
            <Box borderWidth="1px" borderRadius="lg" p={{ base: 6, md: 8 }} boxShadow="lg" bg="white" textAlign="center">
              <Text color="gray.600">Verificando disponibilidad...</Text>
            </Box>
          </Container>
        </Flex>
      </Box>
    );
  }

  // Si el registro no está disponible, mostrar mensaje
  if (isRegisterAvailable === false) {
    return (
      <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" py={{ base: 10, md: 16 }}>
        <Flex direction="column" align="center" justify="center">
          <Box textAlign="center" mb={8} px={4}>
            <Heading size="lg">Registro Desactivado</Heading>
          </Box>
          <Container maxW="md">
            <Box borderWidth="1px" borderRadius="lg" p={{ base: 6, md: 8 }} boxShadow="lg" bg="white">
              <Stack gap={5}>
                <Box bg="yellow.50" color="yellow.800" borderWidth="1px" borderColor="yellow.200" borderRadius="md" p={4}>
                  <Text fontWeight="semibold" mb={2}>
                    El registro público ha sido desactivado
                  </Text>
                  <Text fontSize="sm">
                    El sistema ya ha sido inicializado. Para crear una cuenta, contacte al administrador del sistema.
                  </Text>
                </Box>
                <Link
                  as={NextLink}
                  href="/auth/login"
                  w="full"
                  display="block"
                >
                  <Button
                    colorScheme="blue"
                    w="full"
                  >
                    Volver al Inicio de Sesión
                  </Button>
                </Link>
              </Stack>
            </Box>
          </Container>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" py={{ base: 10, md: 16 }}>
      <Flex direction="column" align="center" justify="center">
        <Box textAlign="center" mb={8} px={4}>
          <Heading size="lg">Crear cuenta de Administrador</Heading>
          <Text color="gray.600">Primer registro del sistema - Se asignará rol de Administrador</Text>
        </Box>
        <Container maxW="md">
          <Box as="form" onSubmit={onSubmit} borderWidth="1px" borderRadius="lg" p={{ base: 6, md: 8 }} boxShadow="lg" bg="white">
            <Stack gap={5}>
              {errorMsg && (
                <Box bg="red.50" color="red.700" borderWidth="1px" borderColor="red.200" borderRadius="md" p={3}>
                  {errorMsg}
                </Box>
              )}
              <Field.Root>
                <Field.Label color="black">Nombre</Field.Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label color="black">Apellido</Field.Label>
                <Input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Pérez"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label color="black">Teléfono</Field.Label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="3001234567"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label color="black">Correo</Field.Label>
                <Input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@hotel.com"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label color="black">Contraseña</Field.Label>
                <Box position="relative" w="100%">
                  <Input
                    w="100%"
                    type={showPass ? "text" : "password"}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="********"
                    bg="gray.50"
                    color="gray.900"
                    _placeholder={{ color: "gray.500" }}
                    pr={20}
                  />
                  <Button size="sm" variant="ghost" onClick={() => setShowPass((v) => !v)} position="absolute" right={2} top={2}>
                    {showPass ? "Ocultar" : "Ver"}
                  </Button>
                </Box>
              </Field.Root>
              <Button type="submit" colorScheme="blue" loading={isSubmitting} w="full">Registrarme</Button>
              
              <Flex align="center" gap={2} my={2}>
                <Box flex="1" h="1px" bg="gray.300" />
                <Text fontSize="sm" color="gray.500">o</Text>
                <Box flex="1" h="1px" bg="gray.300" />
              </Flex>

              <Button
                type="button"
                onClick={handleGoogleRegister}
                loading={isGoogleLoading}
                w="full"
                variant="outline"
                colorScheme="red"
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiMail} />
                  <Text>Registrarse con Google</Text>
                </Flex>
              </Button>
              <Text fontSize="xs" textAlign="center" color="gray.600" fontStyle="italic">
                Solo para el primer administrador
              </Text>

              <Text fontSize="sm" textAlign="center" color="black">
                ¿Ya tienes cuenta? {" "}
                <Link as={NextLink} href="/auth/login" color="black">Inicia sesión</Link>
              </Text>
            </Stack>
          </Box>
        </Container>
      </Flex>

      {/* Modal para completar datos de Google */}
      {googleFormData && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            maxW="md"
            w="90%"
            boxShadow="xl"
          >
            <Stack gap={4}>
              <Heading size="md">Completar Registro</Heading>
              <Text fontSize="sm" color="gray.600">
                Por favor, completa los siguientes datos para finalizar tu registro:
              </Text>
              {errorMsg && (
                <Box bg="red.50" color="red.700" borderWidth="1px" borderColor="red.200" borderRadius="md" p={3}>
                  {errorMsg}
                </Box>
              )}
              <Field.Root>
                <Field.Label>Nombre</Field.Label>
                <Input
                  value={googleFormData.nombre}
                  onChange={(e) => setGoogleFormData({ ...googleFormData, nombre: e.target.value })}
                  placeholder="Juan"
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Apellido</Field.Label>
                <Input
                  value={googleFormData.apellido}
                  onChange={(e) => setGoogleFormData({ ...googleFormData, apellido: e.target.value })}
                  placeholder="Pérez"
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Teléfono <Text as="span" color="red.500">*</Text></Field.Label>
                <Input
                  value={googleFormData.telefono}
                  onChange={(e) => setGoogleFormData({ ...googleFormData, telefono: e.target.value })}
                  placeholder="3001234567"
                  required
                />
              </Field.Root>
              <Flex gap={3}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGoogleFormData(null);
                    delete (window as any).__googleIdToken;
                  }}
                  flex={1}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCompleteGoogleRegister}
                  loading={isSubmitting}
                  colorScheme="blue"
                  flex={1}
                >
                  Completar Registro
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}


