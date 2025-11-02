import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
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

it('fetches order for a particular user', async () => {
  // create three tickets

  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  //create one order as user 1
  const userOne = global.getCookie();
  await request(app)
      .post('/api/orders')
      .set('Cookie', userOne)
      .send({ ticketId: ticketOne.id })
      .expect(201);

  //create two order as user 2

  const userTwo = global.getCookie();
  const {body:orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const {body:orderTwo} = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  //make request to get order for user 2
  const {body:orders} = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send({})
    .expect(200);

  //expect to get all/only user 2's orders, sorted by time of creation (newest last)
  expect(orders.length).toEqual(2);
  expect(orders[0].id).toEqual(orderOne.id)
  expect(orders[1].id).toEqual(orderTwo.id)
  expect(orders[0].ticket.id).toEqual(orderOne.ticket.id)
  expect(orders[1].ticket.id).toEqual(orderTwo.ticket.id)
});