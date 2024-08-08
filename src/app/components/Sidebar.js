'use client';
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
  Button,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstace"; 
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import * as jwtDecode from 'jwt-decode';

export default function Sidebar({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      const token = Cookies.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axiosInstance.get(`/users`);
        const decodedToken = jwtDecode.jwtDecode(token);
        const currentUserId = decodedToken.id;

        const allUsers = response.data;
        const loggedUser = allUsers.find(user => user._id === currentUserId || user._id.$oid === currentUserId);
        setCurrentUser(loggedUser);

        setUsers(allUsers.filter(user => user._id !== currentUserId && user._id.$oid !== currentUserId));
      } catch (error) {
        console.error("Failed to fetch users:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          Cookies.remove("token");
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

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
            <Flex align="center" justify="space-between">
              <Flex align="center">
                <Avatar
                  size="md"
                  src={currentUser?.avatar || "/profilepic1.jpeg"}
                  mr={3}
                />
                <Text fontWeight="bold">{currentUser?.username || "User"}</Text>
              </Flex>
              <Button onClick={handleLogout}>Logout</Button>
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
                  key={user._id.$oid || user._id}
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
