'use client';
import React from  'react';
import Messages from "@/components/messages";
import SendMessage from "@/components/sendMessage";
import SetUsername from "@/components/setUsername";
import Header from "@/components/header";

const Chat = () => {
    return (
        <div className="vh-100 d-flex flex-column">
            <Header/>
            <SetUsername/>
            <Messages/>
            <SendMessage/>
        </div>
    );
};

export default Chat;