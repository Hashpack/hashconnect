import { IHashConnect } from "../types";
import { MessageTypes, RelayMessage, RelayMessageType } from ".";

export interface IMessageHandler {

    onPayload(message: RelayMessage, hc: IHashConnect): Promise<void>;
}

export class MessageHandler implements IMessageHandler {
    
    async onPayload(message: RelayMessage, hc: IHashConnect): Promise<void> {
        const parsedData = message.data;
        if(hc.debug) console.log(`hashconnect - Message Received of type ${message.type}, sent at ${message.timestamp.toString()}`, parsedData);
        
        // Should always have a topic
        if(!parsedData.topic) {
            console.error("hashconnect - no topic in message");
        }

        switch (message.type) {
            case RelayMessageType.ApprovePairing:
                if(hc.debug) console.log("hashconnect - approved", message.data);
                let approval_data: MessageTypes.ApprovePairing = message.data;
                
                hc.pairingEvent.emit(approval_data);
            
                await hc.acknowledge(parsedData.topic, hc.publicKeys[approval_data.topic], approval_data.id!);
            break;
            case RelayMessageType.Acknowledge:
                let ack_data: MessageTypes.Acknowledge = message.data;
                
                if(hc.debug) console.log("hashconnect - acknowledged - id: " + ack_data.msg_id);

                hc.acknowledgeMessageEvent.emit(ack_data)
            break;
            case RelayMessageType.Transaction:
                if(hc.debug) console.log("hashconnect - Got transaction", message)
                
                let transaction_data: MessageTypes.Transaction = message.data;
                transaction_data.byteArray = new Uint8Array(Buffer.from(transaction_data.byteArray as string,'base64'));
                
                hc.transactionEvent.emit(transaction_data);

                await hc.acknowledge(parsedData.topic, hc.publicKeys[transaction_data.topic], transaction_data.id!);
            break;
            case RelayMessageType.TransactionResponse:
                if(hc.debug) console.log("hashconnect - Got transaction response", message)
                
                let transaction_response_data: MessageTypes.TransactionResponse = message.data;
    
                if(transaction_response_data.signedTransaction)
                    transaction_response_data.signedTransaction = new Uint8Array(Buffer.from(transaction_response_data.signedTransaction as string,'base64'));

                if(transaction_response_data.receipt)
                    transaction_response_data.receipt = new Uint8Array(Buffer.from(transaction_response_data.receipt as string,'base64'));
                
                hc.transactionResolver(transaction_response_data);

                await hc.acknowledge(parsedData.topic, hc.publicKeys[transaction_response_data.topic], transaction_response_data.id!);
            break;
            case RelayMessageType.AdditionalAccountRequest:
                if(hc.debug) console.log("hashconnect - Got account info request", message);

                let request_data: MessageTypes.AdditionalAccountRequest = message.data;

                hc.additionalAccountRequestEvent.emit(request_data);

                await hc.acknowledge(parsedData.topic, hc.publicKeys[request_data.topic], request_data.id!);
            break;
            case RelayMessageType.AdditionalAccountResponse:
                if(hc.debug) console.log("hashconnect - Got account info response", message);

                let response_data: MessageTypes.AdditionalAccountResponse = message.data;

                hc.additionalAccountResolver(response_data);

                await hc.acknowledge(parsedData.topic, hc.publicKeys[response_data.topic], response_data.id!);
            break;
            case RelayMessageType.AuthenticationRequest:
                if(hc.debug) console.log("hashconnect - Got auth request", message);

                let auth_request_data: MessageTypes.AuthenticationRequest = message.data;

                hc.authRequestEvent.emit(auth_request_data);

                await hc.acknowledge(parsedData.topic, hc.publicKeys[auth_request_data.topic], auth_request_data.id!);
            break;
            case RelayMessageType.AuthenticationResponse:
                if(hc.debug) console.log("hashconnect - Got auth response", message);

                let auth_response_data: MessageTypes.AuthenticationResponse = message.data;

                hc.authResolver(auth_response_data);

                await hc.acknowledge(parsedData.topic, hc.publicKeys[auth_response_data.topic], auth_response_data.id!);
            break;
            default:
                break;
        }
    }
}