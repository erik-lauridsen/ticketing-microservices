import { Subjects, TicketCreatedEvent } from "@elauridsen_tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {id: new mongoose.Types.ObjectId().toHexString(), title: 'bigshow', price: 400, version: 0, userId: new mongoose.Types.ObjectId().toHexString()};
  ///create a fake message object, we only care about ack
  //@ts-ignore
  const msg: Message = {ack: jest.fn()}

  return {listener, data, msg};
}

it('creates and saves a ticket', async () => {
  const {listener, data, msg} = await setup();
  //call the onmessage function with the data object and message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).not.toEqual(null);
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
});

it('acks the message', async () => {
  const {listener, data, msg} = await setup();
  //call the onmessage function with the data object and message object
    await listener.onMessage(data, msg);
  //write assertions to make sure the ack function is called
  expect(msg.ack).toHaveBeenCalled()
});