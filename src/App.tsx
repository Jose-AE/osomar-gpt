import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import axios from "axios";
import PROMPT from "./prompt";
import { IoSend } from "react-icons/io5";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Link,
  Text,
  Stack,
  Input,
  InputGroup,
  InputRightAddon,
  IconButton,
} from "@chakra-ui/react";

function MessageBox({ role, content }: { role: string; content: string }) {
  if (role === "system") {
    return <></>;
  }
  return (
    <Text
      m="10px"
      borderRadius="10px"
      bg={"gray.600"}
      p="10px"
      textAlign={role === "user" ? "right" : "left"}
    >
      {content}
    </Text>
  );
}

interface ChatlogMessageInterface {
  role: string;
  content: string;
}

function App() {
  const [chatlog, setChatlog] = useState<ChatlogMessageInterface[]>([
    { role: "system", content: PROMPT },
  ]);

  const [messageToSend, setMessageToSend] = useState<string>("");

  async function sendMessage() {
    console.log(messageToSend);
    if (messageToSend == "") {
      return;
    }
    setChatlog((oldChatlog) => [
      ...oldChatlog,
      { role: "user", content: messageToSend },
    ]);

    setMessageToSend("");

    axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [...chatlog, { role: "user", content: messageToSend }],
        },
        {
          headers: { Authorization: "Bearer " + import.meta.env.VITE_API_KEY },
        }
      )
      .then((res) => {
        setChatlog((oldChatlog) => [
          ...oldChatlog,
          { role: "assistant", content: res.data.choices[0].message.content },
        ]);
        //console.log(chatlog);
        console.log(res.data.choices[0].message.content);
      })
      .catch((err) => {});
  }

  useEffect(() => {
    console.log(chatlog);
  }, [chatlog]);

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg="gray.800">
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>OsomarGPT</Heading>
        </Stack>
        <Box
          h="500px"
          rounded={"lg"}
          bg="gray.700"
          boxShadow={"lg"}
          w="500px"
          p={4}
        >
          <Flex
            flexDirection="column"
            mb="10px"
            borderRadius="10px"
            bg="whiteAlpha.100"
            h="90%"
          >
            {chatlog.map((message, i) => {
              return (
                <MessageBox
                  key={i}
                  content={message.content}
                  role={message.role}
                />
              );
            })}
          </Flex>

          <InputGroup>
            <Input
              value={messageToSend}
              mr="10px"
              autoComplete="off"
              placeholder="Type a message"
              onChange={(e) => {
                setMessageToSend(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <IconButton
              onClick={() => {
                sendMessage();
              }}
              aria-label="Send"
              icon={<IoSend />}
            />
          </InputGroup>
        </Box>
      </Stack>
    </Flex>
  );
}

export default App;
