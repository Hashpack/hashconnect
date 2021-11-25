import { v4 as uuidv4 } from 'uuid';
import { RelayMessage, RelayMessageType } from './';

const protons = require('protons');

export class MessageUtil {

    private proto = protons(`
    message SimpleMessage {
        string topic = 1;
        uint64 timestamp = 2;
        string type = 3;
        string data = 4;
    }`);

    /**
     * Compiles the simple protobuf with the specified paramaters 
     * 
     * @param message message to prepare
     * @param type type of message
     * @returns protobuf message
     */
     public prepareSimpleMessage(type: RelayMessageType, data: object) {
        return this.proto.SimpleMessage.encode(new RelayMessage(
            Date.now(),
            type,
            JSON.stringify(data),
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