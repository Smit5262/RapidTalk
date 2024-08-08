"use client";

import { ChakraProvider, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import "./globals.css";
import { SocketProvider } from '../../socketProvider';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <SocketProvider>
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Box minHeight="100vh" bg="gray.50">
                {children}
              </Box>
            </motion.div>
          </SocketProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}