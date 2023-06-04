import { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import PROMPT from "./prompt";
import { IoSend } from "react-icons/io5";
import { TbTrash } from "react-icons/tb";

import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Input,
  InputGroup,
  IconButton,
  Avatar,
} from "@chakra-ui/react";

function MessageBox({ role, content }: { role: string; content: string }) {
  if (role === "system") {
    return <></>;
  }

  const isUser = role === "user";

  return (
    <>
      {role === "assistant" ? (
        <Avatar
          ml="10px"
          size="sm"
          src="https://pps.whatsapp.net/v/t61.24694-24/328642750_1177380842956575_1180015993516765660_n.jpg?ccb=11-4&oh=01_AdTZUQbhoPgatQzIeHGJTAUxlheWtMI4s3ZVWd5lP5yDDg&oe=648695F9"
        />
      ) : null}

      <Flex
        h="auto"
        m={2}
        direction="column"
        align={isUser ? "flex-end" : "flex-start"}
      >
        <Box
          height="auto"
          maxW={`${Math.min(300, content.length * 20)}px`}
          bg="gray.600"
          borderRadius={isUser ? "10px 0px 10px 10px" : "0 10px 10px 10px"}
        >
          <Text p={2}>{content}</Text>
        </Box>
      </Flex>
    </>
  );
}

interface ChatlogMessageInterface {
  role: string;
  content: string;
}

function App() {
  const [loading, setLoading] = useState(false);

  const [chatlog, setChatlog] = useState<ChatlogMessageInterface[]>([
    { role: "system", content: PROMPT },
  ]);

  const [messageToSend, setMessageToSend] = useState<string>("");

  // load chatlog
  useEffect(() => {
    if (!localStorage.getItem("chatlog")) {
      localStorage.setItem(
        "chatlog",
        JSON.stringify([{ role: "system", content: PROMPT }])
      );
    }
    setChatlog(JSON.parse(localStorage.getItem("chatlog") as any));
  }, []);

  async function sendMessage() {
    if (messageToSend == "") {
      return;
    }
    setChatlog((oldChatlog) => {
      localStorage.setItem(
        "chatlog",
        JSON.stringify([
          ...oldChatlog,
          { role: "user", content: messageToSend },
        ])
      );
      return [...oldChatlog, { role: "user", content: messageToSend }];
    });

    setMessageToSend("");
    setLoading(true);

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
        setChatlog((oldChatlog) => {
          localStorage.setItem(
            "chatlog",
            JSON.stringify([
              ...oldChatlog,
              {
                role: "assistant",
                content: res.data.choices[0].message.content,
              },
            ])
          );

          return [
            ...oldChatlog,
            { role: "assistant", content: res.data.choices[0].message.content },
          ];
        });

        //console.log(chatlog);
        //console.log(res.data.choices[0].message.content);
        setLoading(false);
      })
      .catch((err) => {});
  }

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef?.current) {
      (chatContainerRef.current as HTMLElement).scrollTop = (
        chatContainerRef.current as HTMLElement
      ).scrollHeight;
    }
  }, [chatlog]);

  return (
    <Flex align={"center"} justify={"center"} bg="gray.800">
      <Stack spacing={8} w="100%" mt="20px" px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>OsomarGPT</Heading>
        </Stack>
        <Box
          h={`calc(100vh - ${120}px)`}
          rounded={"lg"}
          bg="gray.700"
          boxShadow={"lg"}
          w="100%"
          p={4}
        >
          <Flex h="100%" direction="column">
            <Flex
              ref={chatContainerRef}
              sx={{
                "::-webkit-scrollbar": {
                  display: "none",
                },
              }}
              minH={`calc(100% - ${60}px)`}
              overflowY="auto"
              flexDirection="column"
              mb="20px"
              borderRadius="10px"
              bg="whiteAlpha.100"
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
                isDisabled={loading}
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
                isDisabled={loading}
                onClick={() => {
                  sendMessage();
                }}
                aria-label="Send"
                icon={<IoSend />}
              />
              <IconButton
                ml="10px"
                isDisabled={loading}
                onClick={() => {
                  localStorage.setItem(
                    "chatlog",
                    JSON.stringify([{ role: "system", content: PROMPT }])
                  );
                  setChatlog([{ role: "system", content: PROMPT }]);
                }}
                aria-label="Send"
                icon={<TbTrash />}
              />
            </InputGroup>
          </Flex>
        </Box>
      </Stack>
    </Flex>
  );
}

export default App;
