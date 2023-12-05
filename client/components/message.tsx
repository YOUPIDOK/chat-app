import React, {useState} from "react";
import {Button, Dropdown, InputGroup} from "react-bootstrap";
import {IMessage} from "interface/message";
import {useMessagesContext} from "@/context/MessagesContext";
import {toast} from "react-toastify";
import Form from "react-bootstrap/Form";
import { flags } from '../data/flags';
interface Props {
    message: IMessage;
}

const Message = (props: Props) => {
    const {socket, clientId} = useMessagesContext();
    const [locale, setLocale] = useState('en');

    const date = (new Date(props.message.timeSent));

    const translate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        socket.emit('event-translate', {
            messageId: props.message.id,
            locale
        });
        toast.info("Traduction en cours")
    };

    const verify = () => {
        socket.emit('event-verify', {
           messageId: props.message.id
        });
        toast.info("Vérification de l'information en cours");
    };

    return (
        <div className={"d-flex justify-content-" + (props.message.clientId === clientId ? 'end' : 'start')} id={props.message.id}>
            <div className="w-75 border rounded p-1 mb-1 bg-white">
                <div className={"d-flex justify-content-between"}>
                    {/*<div className={"d-flex gap-1 flex-row" + (props.message.clientId === clientId ? '' : '-reverse')}>*/}
                        <div className="d-flex gap-1">
                            <Form onSubmit={translate}>
                                <InputGroup>
                                    <Button type="submit" size="sm">Traduire</Button>
                                    <Form.Select size="sm" onChange={(e) => setLocale(e.target.value)}>
                                        {flags.map((flag) => (
                                            <option key={flag.locale} value={flag.locale}>
                                                {flag.flag}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form>
                            {props.message.verified === null && <Button size={"sm"} onClick={verify}>Vérifier l'information</Button> }
                        </div>
                        <div className={"d-flex gap-1"}>
                            {props.message.verified === true && <i className="bi bi-check2-circle text-success"></i>}
                            {props.message.verified === false && <i className="bi bi-x-circle text-danger"></i>}
                            <span className="small"> {date.getMonth().toString().padStart(2, '0') + '/' + date.getDay().toString().padStart(2, '0') + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')}</span>
                            <b className="small">{props.message.username}</b>
                            <i className="bi bi-person-circle text-primary"></i>
                        </div>
                    {/*</div>*/}
                </div>
                <div className={"d-flex gap-1 my-1 justify-content-" + (props.message.clientId === clientId ? 'end' : 'start')}>
                    {props.message.translation}
                </div>
            </div>
        </div>
    );
};

export default Message;
