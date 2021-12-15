import { Event } from "ts-typed-events";
import { IRelay, WakuRelay } from "./types/relay";
import { MessageUtil, MessageHandler, MessageTypes, RelayMessage, RelayMessageType } from "./message"
import { HashConnectTypes, IHashConnect } from "./types/hashconnect";
import { generatePrivateKey, getPublicKey } from 'js-waku';

/**
 * Main interface with hashpack
 */
export class HashConnect implements IHashConnect {

    relay: IRelay;

    // events
    foundExtensionEvent: Event<HashConnectTypes.WalletMetadata>;
    pairingEvent: Event<MessageTypes.ApprovePairing>;
    transactionEvent: Event<MessageTypes.Transaction>;
    transactionResponseEvent: Event<MessageTypes.TransactionResponse>;
    acknowledgeMessageEvent: Event<MessageTypes.Acknowledge>;
    accountInfoRequestEvent: Event<MessageTypes.AccountInfoRequest>;
    accountInfoResponseEvent: Event<MessageTypes.AccountInfoResponse>;

    // messages util
    messageParser: MessageHandler;
    messages: MessageUtil;
    private metadata!:  HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
    
    publicKeys: Record<string, string> = {};
    private privateKey: string;

    constructor() {
        this.relay = new WakuRelay();
        
        this.foundExtensionEvent = new Event<HashConnectTypes.WalletMetadata>();
        this.pairingEvent = new Event<MessageTypes.ApprovePairing>();
        this.transactionEvent = new Event<MessageTypes.Transaction>();
        this.transactionResponseEvent = new Event<MessageTypes.TransactionResponse>();
        this.acknowledgeMessageEvent = new Event<MessageTypes.Acknowledge>();
        this.accountInfoRequestEvent = new Event<MessageTypes.AccountInfoRequest>();
        this.accountInfoResponseEvent = new Event<MessageTypes.AccountInfoResponse>();
        
        this.messages = new MessageUtil();
        this.messageParser = new MessageHandler();

        this.setupEvents();
    }

    async init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata, privKey?: string): Promise<HashConnectTypes.InitilizationData> {
        this.metadata = metadata;

        if(!privKey)
            this.privateKey = this.generateEncryptionKeys();
        else
            this.privateKey = privKey;
        
        metadata.publicKey = Buffer.from(getPublicKey(Buffer.from(this.privateKey, 'base64'))).toString('base64');

        let initData: HashConnectTypes.InitilizationData = {
            privKey: this.privateKey
        }

        if(window)
            this.metadata.url = window.location.origin;

        await this.relay.init();

        this.relay.addDecryptionKey(this.privateKey);

        return initData;
    }


    async connect(topic?: string, metadataToConnect?: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata): Promise<HashConnectTypes.ConnectionState> {
        if(!topic) {
            topic = this.messages.createRandomTopicId();
        }

        if(metadataToConnect)
            this.publicKeys[topic] = metadataToConnect.publicKey as string;

        let state: HashConnectTypes.ConnectionState = {
            topic: topic,
            expires: 0
        }

        await this.relay.subscribe(state.topic);

        return state;
    }

    /**
     * Set up event connections
     */
     private setupEvents() {
        // This will listen for a payload emission from the relay
        this.relay.payload.on(async (payload) => {
            if (!payload) return;

            const message: RelayMessage = this.messages.decode(payload);

            await this.messageParser.onPayload(message, this);
        })
    }


    /**
     * Send functions
     */
    async sendTransaction(topic: string, transaction: MessageTypes.Transaction): Promise<string> {
        transaction.byteArray = Buffer.from(transaction.byteArray).toString("base64");
        
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.Transaction, transaction);
        await this.relay.publish(topic, msg, this.publicKeys[topic]);

        return msg.id;
    }

    async requestAccountInfo(topic: string, message: MessageTypes.AccountInfoRequest): Promise<string> {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.AccountInfoRequest, message);

        await this.relay.publish(topic, msg, this.publicKeys[topic]);

        return msg.id;
    }

    async sendAccountInfo(topic: string, message: MessageTypes.AccountInfoResponse): Promise<string> {
        message.accountIds = message.accountIds.map(id => {return id});
        
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.AccountInfoResponse, message);

        await this.relay.publish(topic, msg, this.publicKeys[topic]);

        return msg.id;
    }

    async sendTransactionResponse(topic: string, message: MessageTypes.TransactionResponse): Promise<string> {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.TransactionResponse, message);

        await this.relay.publish(topic, msg, this.publicKeys[topic]);

        return msg.id;
    }

    async pair(pairingData: HashConnectTypes.PairingData, accounts: string[], network: string): Promise<HashConnectTypes.ConnectionState> {
        let state = await this.connect(pairingData.topic);
        
        let msg: MessageTypes.ApprovePairing = {
            metadata: this.metadata as HashConnectTypes.WalletMetadata,
            topic: pairingData.topic,
            accountIds: accounts,
            network: network
        }

        msg.metadata.description = this.sanitizeString(msg.metadata.description);
        msg.metadata.name = this.sanitizeString(msg.metadata.name);
        msg.network = this.sanitizeString(msg.network);
        msg.metadata.url = this.sanitizeString(msg.metadata.url!);
        msg.accountIds = msg.accountIds.map(id => {return id});

        this.publicKeys[pairingData.topic] = pairingData.metadata.publicKey as string;
        
        const payload = this.messages.prepareSimpleMessage(RelayMessageType.ApprovePairing, msg)

        this.relay.publish(pairingData.topic, payload, this.publicKeys[pairingData.topic])

        return state;
    }

    async reject(topic: string, reason: string, msg_id: string) {
        let reject: MessageTypes.Rejected = {
            reason: reason,
            topic: topic,
            msg_id: msg_id
        }

        reject.reason = this.sanitizeString(reject.reason!);
        
        // create protobuf message
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.RejectPairing, reject)
        
        // Publish the rejection
        await this.relay.publish(topic, msg, this.publicKeys[topic]);
    }

    async acknowledge(topic: string, pubKey: string, msg_id: string) {
        const ack: MessageTypes.Acknowledge = {
            result: true,
            topic: topic,
            msg_id: msg_id
        }
        
        const ackPayload = this.messages.prepareSimpleMessage(RelayMessageType.Acknowledge, ack);
        await this.relay.publish(topic, ackPayload, pubKey)
    }  
    

    /**
     * Helpers
     */

    generatePairingString(state: HashConnectTypes.ConnectionState, network: string): string {
        let data: HashConnectTypes.PairingData = {
            metadata: this.metadata,
            topic: state.topic,
            network: network
        }

        data.metadata.description = this.sanitizeString(data.metadata.description);
        data.metadata.name = this.sanitizeString(data.metadata.name);
        data.network = this.sanitizeString(data.network);
        data.metadata.url = this.sanitizeString(data.metadata.url!);
        
        let pairingString: string = Buffer.from(JSON.stringify(data)).toString("base64")

        return pairingString;
    }

    decodePairingString(pairingString: string) {
        let json_string: string = Buffer.from(pairingString,'base64').toString();
        let data: HashConnectTypes.PairingData = JSON.parse(json_string);
        // data.metadata.publicKey = Buffer.from(data.metadata.publicKey as string, 'base64');

        return data;
    }

    private generateEncryptionKeys(): string {
        let privKey = generatePrivateKey();
        // let pubKey = getPublicKey(privKey)
        let privKeyString = Buffer.from(privKey).toString('base64')
        // console.log(key);
        return privKeyString;
    }

    private sanitizeString(str: string){
        return str.replace(/[^\w. ]/gi, function (c) {
            if(c == ".") return ".";
            return '&#' + c.charCodeAt(0) + ';';
        });
    }

    /**
     * Local wallet stuff
     */

    findLocalWallets() {
        console.log("Finding local wallets");
        window.addEventListener("message", (event) => {
            if (event.data.type && (event.data.type == "hashconnect-query-extension-response")) {
                console.log("Local wallet metadata recieved", event.data);
                if(event.data.metadata)
                    this.foundExtensionEvent.emit(event.data.metadata);
            }
        }, false);

        setTimeout(() => {
            window.postMessage({ type: "hashconnect-query-extension" }, "*");
        }, 50);
    }

    connectToLocalWallet(pairingString: string) {
        console.log("Connecting to local wallet")
        //todo: add extension metadata support
        window.postMessage({ type:"hashconnect-connect-extension", pairingString: pairingString }, "*")
    }

}