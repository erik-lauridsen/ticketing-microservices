import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@elauridsen_tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: 'concert',
    price: 120,
    userId: 'rtdsajldfs'
  });
  await ticket.save();
  const data: OrderCreatedEvent['data'] = {
    id: new  mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userID: 'fdsafasd',
    expiresAt: new Date().toISOString(),
    version: 1,
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }
  return { listener, ticket, data, msg};
}

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
})

it('acks the message', async () => {
  const {listener, data, msg} = await setup();
  //call the onmessage function with the data object and message object
  await listener.onMessage(data, msg);
  //write assertions to make sure the ack function is called
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes an event', async () => {
  const { listener, ticket, data, msg} = await setup();
  await listener.onMessage(data,  msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).toBeDefined();
  const mockEventPublished =  JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(mockEventPublished.orderId).toEqual(data.id);
})