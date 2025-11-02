import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@elauridsen_tickets/common";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();
  return ticket;
}


it('cancels an order', async () => {
  const ticket = await buildTicket();
  const user = global.getCookie();
  const {body:order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
  const cancelledOrder = await Order.findById(order.id)
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an order cancelled event', async () => {
  const ticket = await buildTicket();
  const user = global.getCookie();
  const {body:order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})