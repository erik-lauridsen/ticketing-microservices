import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@elauridsen_tickets/common";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version:0,
    price:44,
    status: OrderStatus.Created,
    userId: "fdsafdsafasd"
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString()
    }
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, order };
}

it('cancels an order on an order created event', async () => {
  const {listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const cancelledOrder = await Order.findById(data.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {
  const {listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
})