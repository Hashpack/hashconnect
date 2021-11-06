import { WakuMessage, Waku, getBootstrapNodes } from 'js-waku';
import { Event } from "ts-typed-events"

const protons = require('protons');

let ContentTopic = "/waku/2/default-waku/proto"
const proto = protons(`
message SimpleChatMessage {
  uint64 timestamp = 1;
  string text = 2;
}
`);

let waku: Waku;

export const initWaku = async() => {
    waku = await Waku.create({ bootstrap: true });

    const nodes = await getBootstrapNodes();
    await Promise.all(nodes.map((addr) => waku.dial(addr)));

    console.log("Waiting for peer...");
    await waku.waitForConnectedPeer()


    const processIncMsg = async (wakuMessage: { payloadAsUtf8: any; payload: any; }) => { 
      if (!wakuMessage.payload) return;

      const { timestamp, text } = proto.SimpleChatMessage.decode(
        wakuMessage.payload
      );

      console.log(`Message Received: ${text}, sent at ${timestamp.toString()}`);
    }
    waku.relay.addObserver(processIncMsg, [ContentTopic])
    console.log("init done");
}

export const sendMessage = async(message: string) => {
    const payload = proto.SimpleChatMessage.encode({
        timestamp: Date.now(),
        text: message
      });
  
      const wakuMessage = await WakuMessage.fromBytes(payload, ContentTopic);
  
      console.log("Sending payload");
      await waku.relay.send(wakuMessage);
}
