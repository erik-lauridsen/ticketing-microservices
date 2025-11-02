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


it('fetches the order', async () => {
  const ticket = await buildTicket();
  const user = global.getCookie();
  const {body:orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  const {body:orderResponse} = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);
  expect(orderResponse.id).toEqual(orderOne.id)
})

it('returns a 401 if the order was made by another user', async ()  => {
  const ticket = await buildTicket();
  const userOne = global.getCookie();
  const userTwo = global.getCookie();
  const {body:orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userTwo)
    .send({})
    .expect(401);

})