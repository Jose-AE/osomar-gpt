# extract messages from .txt aand convert them to json
json_message_list = []
with open("Python/data.txt", "r", encoding="utf8") as chatlog:
    raw_chatlog = chatlog.read()

    message_list = raw_chatlog.split("\n")

    for i, message in enumerate(message_list):
        if "-" not in message:
            continue
        if i == 0:
            continue
        clean_message = message.split("-", 1)[-1].strip()

        if clean_message.split(":")[-1].strip() != "<Media omitted>":
            json_message_list.append(
                {
                    "sender": clean_message.split(":")[0].strip(),
                    "message": clean_message.split(":")[-1]
                    .strip()
                    .replace('"', "“")
                    .replace("@5215531365662", ""),
                }
            )


def merge_consecutive_messages(messages):
    merged_messages = []
    current_sender = None
    current_message = ""

    for message in messages:
        sender = message["sender"]
        text = message["message"]

        if sender != current_sender:
            if current_sender is not None:
                merged_messages.append(
                    {"sender": current_sender, "message": current_message.strip()}
                )
            current_sender = sender
            current_message = text
        else:
            current_message += " " + text

    if current_sender is not None:
        merged_messages.append(
            {"sender": current_sender, "message": current_message.strip()}
        )

    return merged_messages


# create traning data
with open("Python/train.jsonl", "w", encoding="utf8") as json:
    compacted_messages = merge_consecutive_messages(json_message_list)

    for i, (jose_msg, osmar_msg) in enumerate(
        zip(compacted_messages, compacted_messages[1:]), 1
    ):
        if i % 2 != 0:
            json.write(f'jose:{jose_msg["message"]}\nosmar: {osmar_msg["message"]}\n')
            """
            json.write(
                f'{{"message": "{jose_msg["message"]}", "response": "{osmar_msg["message"]}"}}\n'
            )
            """


# create traning data (test)
with open("Python/test_train.txt", "w", encoding="utf8") as json:
    messages = ""
    for i, message in enumerate(json_message_list):
        if message["sender"] == "Osmar":
            messages += f'[{message["message"]}]'

    json.write(messages)


"""
{"prompt": "<prompt text>", "completion": "<ideal generated text>"}
{"prompt": "<prompt text>", "completion": "<ideal generated text>"}
{"prompt": "<prompt text>", "completion": "<ideal generated text>"}

"""
