import { v4 as uuidv4 } from 'uuid'
import { RelayMessage, RelayMessageType, Transaction } from '.';

const protons = require('protons');

export class MessageUtil {

    private proto = protons(`
    message Transaction {
        string type = 1;
        bytes transaction = 2;
    }
    
    message SimpleMessage {
    uint64 timestamp = 1;
    string type = 2;
    string data = 3;
    optional Transaction transaction = 4;
    }
    `);

    /**
     * Compiles the simple protobuf with the specified paramaters 
     * 
     * @param message message to prepare
     * @param type type of message
     * @param trans optional transaction
     * @returns protobuf message
     */
     public prepareSimpleMessage(message: any, type: RelayMessageType, trans?: Transaction) {
        return this.proto.SimpleMessage.encode(new RelayMessage(
            Date.now(),
            type,
            message,
            trans
          ));
        
    }    

    public decode(payload: any): RelayMessage {
        return this.proto.SimpleMessage.decode(payload)
    }
    
    /**
     * Generate a random topic ID UUID 
     * 
     * @returns random UUID topic ID
     */
    public createRandomTopicId(): string {
        return uuidv4()
    }
}