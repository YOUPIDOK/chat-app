'use client';
import React, { useState } from "react";
import {Alert, Button, Col, FloatingLabel, InputGroup, Row} from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import {useMessagesContext} from "@/context/MessagesContext";
import { toast } from 'react-toastify';

const SendMessage = () => {
    const [componentUsername, setComponentUsername ] = useState('');

    const { setUsername, socket, connected, setConnected} = useMessagesContext();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (componentUsername.length >= 3) {
            setUsername(componentUsername);
            setConnected(true);
            socket.emit('event-set-username', componentUsername, '');
            toast.info(`Bienvenu sur Chat App ${componentUsername}`);
        } else {
            toast.error( "Le nom d'utilisateur doit contenir au moins 3 caractères.")
        }
    }

    return (
            !connected && (
                <Form onSubmit={handleSubmit}>
                    <Alert variant="success">
                        <Alert.Heading>Bienvenu sur Chat App</Alert.Heading>
                        <p>
                            Pour commencer veuillez saisir votre nom d'utilisateur et cliquer sur enregistrer
                        </p>
                    </Alert>
                    <Row className="justify-content-center mt-5">
                        <Col lg={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>Nom d'utilisateur</InputGroup.Text>
                                <Form.Control value={componentUsername} onChange={(e) => setComponentUsername(e.target.value)} />
                                <Button type="submit">Enregistrer</Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Form>
            )
    )
}

export default SendMessage;