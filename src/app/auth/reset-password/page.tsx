"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Box, Button, Container, Field, Heading, Input, Link, Stack, Text, Flex } from "@chakra-ui/react";
import NextLink from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmContrasena, setConfirmContrasena] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    setToken(t);
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErrorMsg(null);
    if (!token) {
      setErrorMsg("Token inválido o ausente en la URL");
      return;
    }
    if (!nuevaContrasena || !confirmContrasena) {
      setErrorMsg("Ingresa y confirma tu nueva contraseña");
      return;
    }
    if (nuevaContrasena !== confirmContrasena) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await apiPost<string, { token: string; nuevaContrasena: string }>(
        "/auth/reset-password",
        { token, nuevaContrasena }
      );
      if (!resp || resp.success === false) {
        setErrorMsg(resp?.message || "No se pudo restablecer la contraseña");
        return;
      }
      setMsg(resp.message || "Contraseña restablecida correctamente. Ahora puedes iniciar sesión.");
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
          <Heading size="lg">Restablecer contraseña</Heading>
          <Text color="gray.600">Ingresa el token y tu nueva contraseña</Text>
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
                <Field.Label color="black">Nueva contraseña</Field.Label>
                <Input
                  type="password"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  placeholder="********"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label color="black">Confirmar nueva contraseña</Field.Label>
                <Input
                  type="password"
                  value={confirmContrasena}
                  onChange={(e) => setConfirmContrasena(e.target.value)}
                  placeholder="********"
                  bg="gray.50"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field.Root>
              <Button type="submit" colorScheme="blue" loading={isSubmitting} w="full">Restablecer</Button>
              <Text fontSize="sm" textAlign="center" color="black">
                ¿Volver al inicio de sesión? {" "}
                <Link as={NextLink} href="/auth/login" color="black">Inicia sesión</Link>
              </Text>
            </Stack>
          </Box>
        </Container>
      </Flex>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box p={6}>Cargando…</Box>}>
      <ResetPasswordForm />
    </Suspense>
  );
}


