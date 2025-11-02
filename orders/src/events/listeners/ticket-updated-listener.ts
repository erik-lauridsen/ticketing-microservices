import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent} from '@elauridsen_tickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from "./queue-group-name";
import mongoose from "mongoose";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price} = data;
    const ticket = await Ticket.findByEvent(data)
    if (!ticket) throw new Error("Ticket not found");
    ticket.price = price;
    ticket.title = title;
    await ticket.save();
    //ack
    msg.ack()

  }
}