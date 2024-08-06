"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Checkbox,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "../auth.module.css";

const MotionBox = motion(Box);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `/api/login?email=${email}&password=${password}`
      );
      if (response.data.ok) {
        Cookies.set("userId", response.data.userId, { expires: rememberMe ? 7 : undefined });
        router.push("/dashboard");
      } else {
        setError(response.data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError("Failed to login. Please try again.");
    }
  };

  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box
      className={styles.gradientBg}
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="xl" width="400px">
          <VStack spacing={6}>
            <Heading>Log In</Heading>
            {error && <Text color="red.500">{error}</Text>}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
                <Button type="submit" colorScheme="blue" width="100%">
                  Log In
                </Button>
              </VStack>
            </form>
            <Text>
              Do not have an account?{" "}
              <Link href="/signup" passHref>
                <Button as="a" variant="link" colorScheme="blue">
                  Sign Up
                </Button>
              </Link>
            </Text>
            <Link href="/auth/forgot-password" passHref>
              <Button as="a" variant="link" colorScheme="blue">
                Forgot Password?
              </Button>
            </Link>
          </VStack>
        </Box>
      </MotionBox>
    </Box>
  );
}
