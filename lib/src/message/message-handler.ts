import { IHashConnect } from "../types";
import { MessageTypes, RelayMessage, RelayMessageType } from ".";

export interface IMessageHandler {

    onPayload(message: RelayMessage, hc: IHashConnect): Promise<void>;
}

export class MessageHandler implements IMessageHandler {
    
    async onPayload(message: RelayMessage, hc: IHashConnect): Promise<void> {
        console.log(`Message Received of type ${message.type}, sent at ${message.timestamp.toString()}`, message.data);
            
        // Should always have a topic
        const parsedData = JSON.parse(message.data);
        if(!parsedData.topic) {
            console.error("no topic in message");
        }

        switch (message.type) {
            case RelayMessageType.ApprovePairing:
                console.log("approved", message.data);
                let approval_data: MessageTypes.ApprovePairing = JSON.parse(message.data);
                
                hc.pairingEvent.emit(approval_data);

                await hc.acknowledge(parsedData.topic, approval_data.id!);
            break;
            case RelayMessageType.Acknowledge:
                let ack_data: MessageTypes.Acknowledge = JSON.parse(message.data);
                
                console.log("acknowledged - id: " + ack_data.msg_id);

                hc.acknowledgeMessageEvent.emit(ack_data)
            break;
            case RelayMessageType.Transaction:
                console.log("Got transaction", message)
                
                let transaction_data: MessageTypes.Transaction = JSON.parse(message.data);
                transaction_data.byteArray = new Uint8Array(Buffer.from(transaction_data.byteArray as string,'base64'));
                
                hc.transactionEvent.emit(transaction_data);

                await hc.acknowledge(parsedData.topic, transaction_data.id!);
            break;
            case RelayMessageType.AccountInfoRequest:
                console.log("Got account info request", message);

                let request_data: MessageTypes.AccountInfoRequest = JSON.parse(message.data);

                hc.accountInfoRequestEvent.emit(request_data);

                await hc.acknowledge(parsedData.topic, request_data.id!);
            break;
            case RelayMessageType.AccountInfoResponse:
                console.log("Got account info response", message);

                let response_data: MessageTypes.AccountInfoResponse = JSON.parse(message.data);

                hc.accountInfoResponseEvent.emit(response_data);

                await hc.acknowledge(parsedData.topic, response_data.id!);
            break;
            default:
                break;
        }
    }
}