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
} from "@chakra-ui/react";
import { FaPaperPlane } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSocket } from "../socketProvider";

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
      >
        <Text>{text}</Text>
      </Box>
    </Flex>
  );
};

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bgColor = useColorModeValue("white", "gray.800");
  const userId = Cookies.get("userId");
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    if (selectedUser && userId) {
      fetchMessages();
    }
  }, [selectedUser, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (msg) => {
        if (
          msg.senderId === selectedUser?._id ||
          msg.receiverId === selectedUser?._id
        ) {
          setMessages((prevMessages) => {
            // Check if the message already exists
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

      socket.on("receive-message", handleReceiveMessage);

      return () => {
        socket.off("receive-message", handleReceiveMessage);
      };
    }
  }, [socket, selectedUser]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `/api/messages?senderId=${userId}&receiverId=${selectedUser._id}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: userId,
      receiverId: selectedUser._id,
      content: newMessage,
      timestamp: new Date(),
    };

    try {
      const response = await axios.post(`/api/messages`, messageData);
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage("");
      if (socket) {
        socket.emit("send-message", response.data);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
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
      <VStack flex={1} overflowY="auto" p={4} spacing={4}>
        {messages.map((message, index) => (
          <Message
            key={index}
            text={message.content}
            isUser={message.senderId === userId}
            avatar={selectedUser.avatar || "/profilepic1.jpeg"}
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
          <Button colorScheme="blue" onClick={sendMessage}>
            <FaPaperPlane />
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
