import { JetStreamClient, JsMsg, AckPolicy, DeliverPolicy, Consumer } from "nats";
import type { Subjects } from "./subjects";
import { streamName } from "./stream-name";

interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Listener<T extends Event>{
    abstract subject: T['subject']
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: JsMsg): void;
    protected jsClient: JetStreamClient;
    protected ackWait = 5 * 1000;

    constructor(jsClient: JetStreamClient) {
        this.jsClient = jsClient;
    }


    getConsumerConfig() {
        return {
            durable_name: this.queueGroupName,
            deliver_group: this.queueGroupName,
            deliver_subject: this.queueGroupName,
            queue: this.queueGroupName,
            ack_wait: this.ackWait,
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New,
            filter_subject: `${this.subject}` 
        };
    }

    async listen() {
        try {
            const consumer = await this.jsClient.consumers.get(
                streamName, //could define stream name externally, but whatever, it's fine for now
                this.getConsumerConfig()
            );

            const messageIterator = await consumer.consume();

        for await (const msg of messageIterator) {
            console.log(`Message received: ${this.subject}/${this.queueGroupName}`);
            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        }
     

        } catch (error) {
            console.error('Error while listening:', error);
        }
     }

    parseMessage(msg: JsMsg) {
        const data = msg.data;
        return JSON.parse(data.toString());
    }
}