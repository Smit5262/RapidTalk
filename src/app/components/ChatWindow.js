"use client";

import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FaPaperPlane } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../axiosInstace";
import Cookies from "js-cookie";
import { useSocket } from "../../../socketProvider";
import * as jwtDecode from "jwt-decode";

const Message = ({ text, isUser, avatar }) => {
  const bgColor = useColorModeValue(
    isUser ? "blue.100" : "gray.100",
    isUser ? "blue.700" : "gray.700"
  );
  const textColor = useColorModeValue(
    isUser ? "blue.800" : "gray.800",
    isUser ? "blue.100" : "gray.100"
  );

  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"} mb={4}>
      {!isUser && <Avatar size="sm" src={avatar} mr={2} />}
      <Box
        maxWidth="70%"
        bg={bgColor}
        color={textColor}
        p={3}
        borderRadius="lg"
        alignSelf={isUser ? "flex-end" : "flex-start"}
      >
        <Text>{text}</Text>
      </Box>
      {isUser && <Avatar size="sm" src={avatar} ml={2} />}
    </Flex>
  );
};

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bgColor = useColorModeValue("white", "gray.800");
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const [currentUserId, setCurrentUserId] = useState(null);
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedToken = jwtDecode.jwtDecode(token);
        setCurrentUserId(decodedToken.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast({
          title: "Authentication Error",
          description: "Please log in again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (selectedUser && currentUserId) {
      fetchMessages();
    }
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on("receive-message", handleReceiveMessage);

      return () => {
        socket.off("receive-message", handleReceiveMessage);
      };
    }
  }, [socket, selectedUser]);

  const handleReceiveMessage = (msg) => {
    if (
      (msg.senderId === selectedUser?._id &&
        msg.receiverId === currentUserId) ||
      (msg.senderId === currentUserId && msg.receiverId === selectedUser?._id)
    ) {
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (message) => message._id === msg._id
        );
        if (!isDuplicate) {
          return [...prevMessages, msg];
        }
        return prevMessages;
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(
        `/messages?receiverId=${selectedUser._id}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch messages. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" || isSending) return;

    setIsSending(true);

    const messageData = {
      receiverId: selectedUser._id,
      content: newMessage,
    };

    try {
      const response = await axiosInstance.post(`/messages`, messageData);
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage("");
      if (socket) {
        socket.emit("send-message", response.data);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!selectedUser) {
    return (
      <Box
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="xl">Select a user to start chatting</Text>
      </Box>
    );
  }

  return (
    <Box height="100%" display="flex" flexDirection="column" bg={bgColor}>
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <Flex align="center">
          <Avatar
            size="sm"
            src={selectedUser.avatar || "/profilepic1.jpeg"}
            mr={2}
          />
          <Text fontWeight="bold" fontSize="xl">
            {selectedUser.username}
          </Text>
        </Flex>
      </Box>
      <VStack flex={1} overflowY="auto" p={4} spacing={4} alignItems="stretch">
        {messages.map((message, index) => (
          <Message
            key={index}
            text={message.content}
            isUser={message.senderId === currentUserId}
            avatar={
              message.senderId === currentUserId
                ? "/profilepic1.jpeg"
                : selectedUser.avatar || "/profilepic1.jpeg"
            }
          />
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <Box p={4} borderTop="1px" borderColor="gray.200">
        <HStack>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <Button
            colorScheme="blue"
            onClick={sendMessage}
            isLoading={isSending}
          >
            <FaPaperPlane />
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
