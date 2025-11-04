import request from "supertest";
import { app } from "../../app";
import {Order} from '../../models/order';
import mongoose from "mongoose";
import { OrderStatus } from "@elauridsen_tickets/common";
import { stripe } from '../../stripe';
import { Payment } from "../../models/payment";

jest.mock('../../stripe');

it('returns a 404 if the order does not exist', async () => {
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.getCookie())
  .send({
    token: 'fdsafsda',
    orderId: new mongoose.Types.ObjectId().toHexString()
  })
  .expect(404);
});

it('returns a 401 if the order does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 30
  });
  await order.save();
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.getCookie())
  .send({
    token: 'fdsafsda',
    orderId: order.id,
  })
  .expect(401);
});

it('returns a 400 if the order is #cancelled', async () => {
  const user = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: user,
    status: OrderStatus.Cancelled,
    price: 30
  });
  await order.save();
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.getCookie(user))
  .send({
    token: 'fdsafsda',
    orderId: order.id,
  })
  .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const user = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: user,
    status: OrderStatus.Created,
    price: 30
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(user))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(stripe.charges.create).toHaveBeenCalled();
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual('usd');

  const payment = await Payment.findOne({orderId: order.id});
  expect(payment!.orderId).toEqual(order.id);

})