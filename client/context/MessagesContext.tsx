'use client';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {IMessage} from 'interface/message';
import {toast} from "react-toastify";
import {flags} from "../data/flags";

interface IMessagesContext {
    messages: IMessage[];
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    clientId: string;
    setClientId: React.Dispatch<React.SetStateAction<string>>;
    connected: boolean;
    setConnected: React.Dispatch<React.SetStateAction<boolean>>;
    socket: Socket;
}

const MessagesContext = createContext<IMessagesContext | undefined>(undefined);

export const MessagesProvider: React.FC = ({ children }) => {
    const [socket, setSocket] =  useState<Socket>(io('http://localhost:3000')); // Replace with your socket connection details
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [username, setUsername] = useState('');
    const [clientId, setClientId] = useState('');
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('event-connection', (data) => {
            setClientId(data.clientId);
            setMessages(data.oldMessages);
        });
        socket.on('event-translate', (translateMessage) => {
            setMessages(messages => messages.map(oldMessage => oldMessage.id === translateMessage.id ? translateMessage : oldMessage));
            toast.success(`Le message "${translateMessage.message}" a été traduit en ${flags.find(f => f.locale === translateMessage.locale)?.flag} : ${translateMessage.translation}`);
        });
        socket.on('event-verify', (verifyMessage) => {
            setMessages(messages => messages.map(oldMessage => oldMessage.id === verifyMessage.id ? verifyMessage : oldMessage));
            if (verifyMessage.verified) {
                toast.success(`Message "${verifyMessage.message}" vérifié avec succès.`);
            } else {
                toast.error(`Message "${verifyMessage.message}" n'a pas pu être validé.`);
            }
        });
        socket.on('event-message', (message) => {
            setMessages(messages => [...messages, message] as any);
            if (message.clientId !== socket.id && username !== '') {
                toast.info('Nouveau message');
            }
        });
        socket.on('disconnect', () => {
            setConnected(false);
        });

    }, []);

    return (
        <MessagesContext.Provider value={{ messages, setMessages, username, setUsername, clientId, setClientId, connected, setConnected, socket }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessagesContext = () => {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error('useMessagesContext must be used within a MessagesProvider');
    }
    return context;
};
