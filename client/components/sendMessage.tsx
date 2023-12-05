'use client';
import React, {useEffect, useState} from "react";
import {Button, Col, InputGroup, Toast} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import {useMessagesContext} from "@/context/MessagesContext";
import {toast} from "react-toastify";

const SendMessage = () => {
    const {socket, connected} = useMessagesContext();

    const [message, setMessage] = useState('');

    // ******************************************************************** SEND *******************************************************************************

    const send = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message != '') {
            socket.emit('event-message', {
                message: message,
            })

            setMessage('');
        }
    }

    // *********************************************************************************************************************************************************

    // ******************************************************************** SUGGEST ****************************************************************************

    const suggest = () => {
        socket.emit('event-suggest');
        toast.warning("Génération de la suggestion en cours");
    }

    useEffect(() => {
        socket.on('event-suggest', (suggestion) => {
            setMessage(suggestion)
            toast.success(`Suggestion : ${suggestion}` );

        })
    }, []);

    // *********************************************************************************************************************************************************

    // ******************************************************************** TRANSCRIPT *************************************************************************

    const openFinder = () => {
        document.querySelector('#hidenInputFile').click();
    };

    const onHidenInputFile = () => {
        const input =  document.querySelector('#hidenInputFile');

        if (input.files.length === 1) {
            const file = input.files[0];

            if (file.type !== 'audio/mpeg') {
                toast.error("Le fichier n'est pas un fichier 'audio/mpeg'")
            } else if(file.size > 524288) {
                toast.error("Le fichier est trop volumnieux. Taille maximale 500 Ko")
            } else {
                const reader = new FileReader();

                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];

                    socket.emit('event-transcript', {
                        data: base64String,
                        name: file.name,
                    });

                    toast.warning("Transcription en cours");
                };

                reader.readAsDataURL(file);
            }
        }

        input.type = 'text';
        input.type = 'file';
    };

    useEffect(() => {
        socket.on('event-transcript', (transcription) => {
            setMessage(transcription)
            toast.success(`Transcription : ${transcription}` );
        })
    }, []);
    // *********************************************************************************************************************************************************

    return (
            connected && (
                <Form onSubmit={send}>
                    <InputGroup className="mb-3">
                        <Button type="button" title="Suggérer" variant="secondary" onClick={() => suggest()}><i className="bi bi-lightbulb-fill text-warning"></i></Button>
                        <Button type="button" title="Utiliser le microphone" onClick={() => openFinder()}><i className="bi bi-mic-fill"></i></Button>
                        <InputGroup.Text>Message</InputGroup.Text>
                        <Form.Control value={message}  onChange={(e) => setMessage(e.target.value)} />
                        <Form.Control type="file" className="d-none" id="hidenInputFile" onChange={() => onHidenInputFile()}/>
                        <Button type="submit">Envoyer<i className="bi bi-send-fill ms-2"></i></Button>
                    </InputGroup>
                </Form>
            )
    )
}

export default SendMessage;