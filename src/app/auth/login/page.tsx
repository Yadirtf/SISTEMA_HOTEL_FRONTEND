"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, JwtResponseDto } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { Box, Button, Container, Field, Heading, Input, Link, Stack, Text, Flex } from "@chakra-ui/react";
import NextLink from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      if (!resp || resp.ok === false || !resp.data) {
        setErrorMsg(resp?.mensaje || "Credenciales inválidas");
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
                <Input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="********"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Button type="submit" colorScheme="blue" loading={isSubmitting} w="full">Entrar</Button>
              <Text fontSize="sm" textAlign="center">
                ¿No tienes cuenta? {" "}
                <Link as={NextLink} href="/auth/register" color="blue.600">Regístrate</Link>
              </Text>
            </Stack>
          </Box>
        </Container>
      </Flex>
    </Box>
  );
}


