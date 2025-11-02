import mongoose from "mongoose";
import { TicketUpdatedListener } from "../ticket-updated-listener"; 
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@elauridsen_tickets/common";
import { Ticket } from "../../../models/ticket";


const setup = async () => {
  //create an instance of the listener
  const listener = new  TicketUpdatedListener(natsWrapper.client);
  //create and save a ticket
  const ticketData = {id: new mongoose.Types.ObjectId().toHexString(), title: 'bigshow', price: 400};
  const ticket = Ticket.build(ticketData);
  await ticket.save();
  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "beegshow",
    price: 401,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  ///create a fake message object, we only care about ack
  //@ts-ignore
  const msg: Message = {ack: jest.fn()}
  return {listener, data, ticket, msg};
}

it('finds, updates, and saves a ticket', async () => {
  const {msg, data, ticket, listener} = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
})

it('acks the message', async () => {
  const {msg, data, listener} = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled()
})

it('does not ack an out of order message', async () => {
  const {msg, data, listener} = await setup();
  data.version += 1;
  await expect(listener.onMessage(data, msg)).rejects.toThrow();
})