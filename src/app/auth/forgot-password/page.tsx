"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Box, Button, Container, Field, Heading, Input, Link, Stack, Text, Flex } from "@chakra-ui/react";
import NextLink from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErrorMsg(null);
    if (!correo) {
      setErrorMsg("Ingrese su correo");
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await apiPost<string, { correo: string }>("/auth/forgot-password", { correo });
      if (!resp || resp.success === false) {
        setErrorMsg(resp?.message || "No se pudo enviar el correo de recuperación");
        return;
      }
      setMsg(resp.message || "Si el correo existe, se envió un enlace de recuperación.");
    } catch (err) {
      setErrorMsg("No se pudo enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50)" py={{ base: 10, md: 16 }}>
      <Flex direction="column" align="center" justify="center">
        <Box textAlign="center" mb={8} px={4}>
          <Heading size="lg">Recuperar contraseña</Heading>
          <Text color="gray.600">Ingresa tu correo para recibir un enlace</Text>
        </Box>
        <Container maxW="md">
          <Box as="form" onSubmit={onSubmit} borderWidth="1px" borderRadius="lg" p={{ base: 6, md: 8 }} boxShadow="lg" bg="white">
            <Stack gap={5}>
              {errorMsg && (
                <Box bg="red.50" color="red.700" borderWidth="1px" borderColor="red.200" borderRadius="md" p={3}>
                  {errorMsg}
                </Box>
              )}
              {msg && (
                <Box bg="green.50" color="green.700" borderWidth="1px" borderColor="green.200" borderRadius="md" p={3}>
                  {msg}
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
              <Button type="submit" colorScheme="blue" loading={isSubmitting} w="full">Enviar enlace</Button>
              <Text fontSize="sm" textAlign="center" color="black">
                ¿Recordaste tu contraseña? {" "}
                <Link as={NextLink} href="/auth/login" color="black">Inicia sesión</Link>
              </Text>
            </Stack>
          </Box>
        </Container>
      </Flex>
    </Box>
  );
}


