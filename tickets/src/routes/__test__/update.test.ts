import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

const createTicket = async (cookie?: string[]) => {
  const myCookie = cookie ? cookie : global.getCookie();
  return request(app)
  .post('/api/tickets')
  .set('Cookie', myCookie)
  .send({title: 'fdsafds', price: 20});
}


it('returns a 404 if the ticket does not exist', async () => {
  const randomId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${randomId}`)
    .set('Cookie', global.getCookie())
    .send({price: 20, title: 'fdsafdsa'})
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const randomId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${randomId}`)
    .send({price: 20, title: 'fdsafdsa'})
    .expect(401);
})

it('returns a 401 if the user dos not own the ticket', async () => {

  const cookie = global.getCookie();

  const ticket = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', global.getCookie()) //new, different cookie
    .send({price: 200, title: 'fdsafdsa'})
    .expect(401);
  
})

it('returns a 400 if the user provides an invalid title or price', async () => {

  const cookie = global.getCookie();

  const ticket = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie) //same cookie
    .send({price: -200, title: "fdsafsda" }) //invalid price
    .expect(400);
  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie) //same cookie
    .send({price: 200, title: "" }) //invalid title
    .expect(400);
  
})

it('updates the ticket provided valid inputs', async () => {

  const cookie = global.getCookie();

  const ticket = await createTicket(cookie);

  const newTitle = "hehehe";
  const newPrice = 200;

  const updatedTicket = await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie) //same cookie
    .send({price: newPrice, title: newTitle }) //valid inputs
    .expect(200);

    expect(updatedTicket.body.title).toEqual(newTitle);
    expect(updatedTicket.body.price).toEqual(newPrice);

  
})

