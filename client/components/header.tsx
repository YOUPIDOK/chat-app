import React from "react";
import {useMessagesContext} from "@/context/MessagesContext";

const Messages = () => {
    const {username, connected} = useMessagesContext();

    return (
        <div className="d-flex justify-content-between mb-3 align-items-center bg-white rounded-2 my-3 p-2">
            <h1 className="text-center fw-bold">Chat App</h1>
            { connected &&
              <div className="border-primary bg-white px-2 py-1 rounded-3 border fw-bold">{ username }<i className="bi bi-person-circle ms-1 text-primary"></i></div>
            }
        </div>
    );
};

export default Messages;
