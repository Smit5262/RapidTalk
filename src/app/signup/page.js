"use client";
import { useState } from "react";
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
  InputGroup,
  InputRightElement,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import styles from "../auth.module.css";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [info, setInfo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username, info, phoneNumber }),
      });
      const data = await response.json();
      if (data.ok) {
        alert("Signup successful");
        router.push("/login");
      } else {
        console.error("Signup failed:", data.error);
        alert("Signup failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup. Please try again later.");
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
        <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="xl" width="600px">
          <VStack spacing={6}>
            <Heading>Sign Up</Heading>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>where you know about us </FormLabel>
                    <Input
                      type="text"
                      value={info}
                      onChange={(e) => setInfo(e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem colSpan={2}>
                  <Button type="submit" colorScheme="blue" width="100%">
                    Sign Up
                  </Button>
                </GridItem>
              </Grid>
            </form>
            <Text>
              Already have an account?{" "}
              <Link href="/login" passHref>
                <Button as="a" variant="link" colorScheme="blue">
                  Log In
                </Button>
              </Link>
            </Text>
          </VStack>
        </Box>
      </MotionBox>
    </Box>
  );
}
