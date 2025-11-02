import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent, OrderStatus } from "@elauridsen_tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: 'concert',
    price: 120,
    userId: 'rtdsajldfs'
  });
  ticket.set({orderId: new  mongoose.Types.ObjectId().toHexString()});
  await ticket.save();
  const data: OrderCancelledEvent['data'] = {
    id: new  mongoose.Types.ObjectId().toHexString(),
    version: 1,
    ticket: {
      id: ticket.id,
    }
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }
  return { listener, ticket, data, msg};
}

it('deletes the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
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
  expect(mockEventPublished.id).toEqual(ticket.id);
})