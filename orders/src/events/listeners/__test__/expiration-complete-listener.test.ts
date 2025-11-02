import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/order";
import { OrderStatus, ExpirationCompleteEvent } from "@elauridsen_tickets/common";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: 'bigShow', 
    price: 1000, 
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();
  const order = Order.build({
    userId: 'fsdafsd', 
    status: OrderStatus.Created, 
    expiresAt: new Date(),
    ticket
  });
  await order.save();
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return {listener, ticket, order, data, msg};
}

it('cancels an uncompleted order when receiving an expiration event', async () => {
  const {listener, ticket, order, data, msg} = await setup();
  await listener.onMessage(data, msg);
  const cancelled = await Order.findById(order.id);
  expect(cancelled!.status).toEqual(OrderStatus.Cancelled);
})

it('does not cancel an order in completed status', async () => {
  const {listener, ticket, order, data, msg} = await setup();
  order.status = OrderStatus.Complete;
  await order.save();
  await listener.onMessage(data, msg);
  const complete = await Order.findById(order.id);
  expect(complete!.status).toEqual(OrderStatus.Complete);
})

it('emits an OrderCancelled event after cancelling an order', async () => {
  const {listener, ticket, order, data, msg} = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).toBeDefined();
  const mockEventPublished =  JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(mockEventPublished.id).toEqual(order.id);
})

it('does not emit an OrderCancelled event for a completed order', async () => {
  const {listener, ticket, order, data, msg} = await setup();
  order.status = OrderStatus.Complete;
  await order.save();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
})

it('acks the message when it receives a expiration event for an uncompleted order,', async () => {
  const {listener, ticket, order, data, msg} = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('acks the message when it receives a expiration event for a completed order,', async () => {
  const {listener, ticket, order, data, msg} = await setup();
  order.status = OrderStatus.Complete;
  await order.save();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});