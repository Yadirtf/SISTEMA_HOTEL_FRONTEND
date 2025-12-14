"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, JwtResponseDto } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { Box, Button, Container, Field, Heading, Input, Link, Stack, Text, Flex, Icon } from "@chakra-ui/react";
import NextLink from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { FiMail } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!correo || !contrasena) {
      setErrorMsg("Ingrese correo y contraseña");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await apiPost<JwtResponseDto, { correo: string; contrasena: string }>(
        "/auth/login",
        { correo, contrasena }
      );

      if (!resp || resp.success === false || !resp.data) {
        setErrorMsg(resp?.message || "Credenciales inválidas");
        return;
      }

      saveSession(resp.data);
      router.push("/panel");
    } catch (err) {
      setErrorMsg("No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
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

      // Enviar token al backend
      const resp = await apiPost<JwtResponseDto, { idToken: string }>(
        "/auth/login/google",
        { idToken }
      );

      if (!resp || resp.success === false || !resp.data) {
        setErrorMsg(resp?.message || "Error al iniciar sesión con Google");
        return;
      }

      saveSession(resp.data);
      router.push("/panel");
    } catch (err: any) {
      console.error("Error en login con Google:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg("Se cerró la ventana de autenticación");
      } else {
        setErrorMsg(err?.message || "No se pudo iniciar sesión con Google");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" py={{ base: 10, md: 16 }}>
      <Flex direction="column" align="center" justify="center">
        <Box textAlign="center" mb={8} px={4}>
          <Heading size="lg">Sistema Hotel</Heading>
          <Text color="gray.600">Accede para gestionar recepción</Text>
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
              <Button type="submit" colorScheme="blue" loading={isSubmitting} w="full">Entrar</Button>
              
              <Flex align="center" gap={2} my={2}>
                <Box flex="1" h="1px" bg="gray.300" />
                <Text fontSize="sm" color="gray.500">o</Text>
                <Box flex="1" h="1px" bg="gray.300" />
              </Flex>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                loading={isGoogleLoading}
                w="full"
                variant="outline"
                colorScheme="red"
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiMail} />
                  <Text>Continuar con Google</Text>
                </Flex>
              </Button>
              <Text fontSize="xs" textAlign="center" color="gray.600" fontStyle="italic">
                Solo disponible para administradores
              </Text>

              <Text fontSize="sm" textAlign="center" color="black">
                ¿No tienes cuenta? {" "}
                <Link as={NextLink} href="/auth/register" color="black">Regístrate</Link>
              </Text>
              <Text fontSize="sm" textAlign="center" color="black">
                ¿Olvidaste tu contraseña? {" "}
                <Link as={NextLink} href="/auth/forgot-password" color="black">Recupérala aquí</Link>
              </Text>
            </Stack>
          </Box>
        </Container>
      </Flex>
    </Box>
  );
}


