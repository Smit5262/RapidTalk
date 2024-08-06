"use client";

import {
  Box,
  VStack,
  Avatar,
  Text,
  Input,
  List,
  ListItem,
  useColorModeValue,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Sidebar({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const userId = Cookies.get("userId");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get(`/api/users`);
        const allUsers = response.data;
        setUsers(allUsers.filter((user) => user._id !== userId));
        setCurrentUser(allUsers.find((user) => user._id === userId));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [userId]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      height="100%"
      bg={bgColor}
      p={4}
      borderRight="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <Flex align="center">
              <Avatar
                size="md"
                src={currentUser?.avatar || "/profilepic1.jpeg"}
                mr={3}
              />
              <Text fontWeight="bold">{currentUser?.username || "User"}</Text>
            </Flex>
            <Box position="relative">
              <Input
                placeholder="Search users..."
                pr="2.5rem"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Box
                position="absolute"
                right="0.5rem"
                top="50%"
                transform="translateY(-50%)"
              >
                <FaSearch />
              </Box>
            </Box>
            <List spacing={3}>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user._id}
                  p={2}
                  _hover={{ bg: "gray.200" }}
                  cursor="pointer"
                  borderRadius="md"
                  onClick={() => onSelectUser(user)}
                >
                  <Flex align="center">
                    <Avatar
                      size="sm"
                      src={user.avatar || "/profilepic1.jpeg"}
                      mr={2}
                    />
                    <Text>{user.username}</Text>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </VStack>
    </Box>
  );
}
