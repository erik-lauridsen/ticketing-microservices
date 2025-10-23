import request from 'supertest';
import { app } from '../../app';

it("responds with details about the current user", async () => {
  const cookie = await global.getCookie();
  if (!cookie) {
    throw new Error("Expected a cookie and didn't get one...");
  }
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual('test@test.com');
  expect(response.body.currentUser.id).toBeDefined();
  expect(response.body.currentUser.iat).toBeDefined();
});

it("responds with null if not authed", async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
  return;
})