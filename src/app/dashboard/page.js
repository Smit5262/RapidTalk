"use client";

import { useState , useEffect } from "react";
import { Box, Flex, IconButton, useDisclosure } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Cookies from "js-cookie";

let socket;

export default function Dashboard() {
  const { isOpen, onToggle } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isOpen) onToggle();
  };
  return (
    <Flex height="100vh">
      <Box
        display={{ base: isOpen ? "block" : "none", md: "block" }}
        width={{ base: "full", md: "300px" }}
        position={{ base: "fixed", md: "static" }}
        left={0}
        top={0}
        height="100%"
        zIndex={20}
        transition="0.3s"
      >
        <Sidebar onSelectUser={handleSelectUser} />
      </Box>
      
      <Box flex={1} position="relative">
        <IconButton
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={onToggle}
          position="absolute"
          top={4}
          left={4}
          zIndex={30}
          display={{ base: "block", md: "none" }}
          aria-label="Toggle Sidebar"
        />
        <ChatWindow selectedUser={selectedUser} socket={socket} />
      </Box>
    </Flex>
  );
}