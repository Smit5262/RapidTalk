"use client";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaRocket, FaComments, FaUserFriends } from "react-icons/fa";
import Link from "next/link";
import styles from "./page.module.css";

const MotionBox = motion(Box);

const Feature = ({ icon, title, text }) => {
  return (
    <VStack>
      <Box fontSize="3xl" color="blue.500">
        {icon}
      </Box>
      <Text fontWeight="bold">{title}</Text>
      <Text textAlign="center">{text}</Text>
    </VStack>
  );
};

export default function Home() {
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box className={styles.gradientBg}>
      <Container maxW="container.xl" pt={20}>
        <VStack spacing={10} align="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading as="h1" size="2xl" textAlign="center" color="white">
              Welcome to RapidTalk
            </Heading>
            <Text fontSize="xl" textAlign="center" mt={4} color="white">
              Real-time chat made simple and efficient.
            </Text>
          </MotionBox>

          <HStack spacing={8} wrap="wrap" justify="center">
            <Button as={Link} href="/signup" size="lg" colorScheme="blue">
              Get Started
            </Button>
            <Button
              as={Link}
              href="/login"
              size="lg"
              variant="outline"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Log In
            </Button>
          </HStack>

          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Box bg={bgColor} p={10} borderRadius="lg" boxShadow="xl">
              <HStack spacing={10} wrap="wrap" justify="center">
                <Feature
                  icon={<FaRocket />}
                  title="Lightning Fast"
                  text="Experience real-time messaging with minimal latency."
                />
                <Feature
                  icon={<FaComments />}
                  title="Rich Conversations"
                  text="Share text, images, and files seamlessly."
                />
                <Feature
                  icon={<FaUserFriends />}
                  title="Team Collaboration"
                  text="Create group chats and collaborate effectively."
                />
              </HStack>
            </Box>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
