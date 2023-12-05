import Message from "@/components/message";
import React from "react";
import {useMessagesContext} from "@/context/MessagesContext";

const Messages = () => {
    const {messages, connected} = useMessagesContext();

    return (
            connected &&
                <div className="d-flex flex-column flex-grow-1 overflow-y-auto mb-3" id="messages">
                    {
                        messages.map((message) => (
                            <Message message={message} key={message.id} />
                        ))
                    }
                </div>
    );
};

export default Messages;
