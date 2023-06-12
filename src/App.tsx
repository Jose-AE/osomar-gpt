import { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import USERS from "./users";
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
  useToast,
  Select,
} from "@chakra-ui/react";

function MessageBox({
  role,
  content,
  pfp,
}: {
  role: string;
  content: string;
  pfp: string;
}) {
  if (role === "system") {
    return <></>;
  }

  const isUser = role === "user";

  return (
    <>
      {role === "assistant" ? <Avatar ml="10px" size="sm" src={pfp} /> : null}

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
  const toast = useToast();

  const [user, setUser] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatlog, setChatlog] = useState<ChatlogMessageInterface[]>([]);
  const [messageToSend, setMessageToSend] = useState<string>("");

  // load chatlogs
  useEffect(() => {
    for (let user of USERS) {
      if (!localStorage.getItem(`${user.name}_chatlog`)) {
        localStorage.setItem(`${user.name}_chatlog`, JSON.stringify([]));
      }
      setChatlog(
        JSON.parse(localStorage.getItem(`${user.name}_chatlog`) as any)
      );
    }
  }, []);

  async function sendMessage() {
    if (messageToSend == "") {
      return;
    }
    setChatlog((oldChatlog) => {
      localStorage.setItem(
        `${USERS[user].name}_chatlog`,
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
          messages: [
            { role: "system", content: USERS[user].systemPrompt },
            ...chatlog,
            { role: "user", content: messageToSend },
          ],
        },
        {
          headers: { Authorization: "Bearer " + import.meta.env.VITE_API_KEY },
        }
      )
      .then((res) => {
        setChatlog((oldChatlog) => {
          localStorage.setItem(
            `${USERS[user].name}_chatlog`,
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
      .catch((err) => {
        toast({
          title: "Out of tokens",
          description: "API Has ran out of tokens, contact creator to add more",
          status: "error",
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      });
  }

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef?.current) {
      (chatContainerRef.current as HTMLElement).scrollTop = (
        chatContainerRef.current as HTMLElement
      ).scrollHeight;
    }
  }, [chatlog]);

  //update chatlog on user change
  useEffect(() => {
    setChatlog(
      JSON.parse(localStorage.getItem(`${USERS[user].name}_chatlog`) as any)
    );
  }, [user]);

  return (
    <Flex align={"center"} justify={"center"} bg="gray.800">
      <Stack spacing={8} w="100%" mt="20px" px={6}>
        <Stack align={"center"}>
          <Select
            w="auto"
            textAlign="center"
            h="100px"
            fontWeight="bold"
            fontSize={"4xl"}
            value={user}
            onChange={(e) => setUser(Number(e.target.value))}
          >
            {USERS.map((user, i) => (
              <option key={i} value={i}>
                {user.name}
              </option>
            ))}
          </Select>
        </Stack>
        <Box
          h={`calc(100vh - ${160}px)`}
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
                    pfp={USERS[user].pfp}
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
                    `${USERS[user].name}_chatlog`,
                    JSON.stringify([])
                  );
                  setChatlog([]);
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
