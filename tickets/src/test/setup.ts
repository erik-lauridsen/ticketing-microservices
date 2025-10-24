import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from 'supertest';
import { app } from "../app";
import jwt from 'jsonwebtoken';

declare global {
  var getCookie: () => string[];
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.getCookie = () => {
  //build a jwt payload {id, email}

  const randomString = new mongoose.Types.ObjectId().toHexString();

  const payload = {id: randomString, email: "test@test.com"};
  // creata a jwt
  const myJWT = jwt.sign(payload, process.env.JWT_KEY!)
  //build a session object {jwt: MY_JWT}
  const sess = {jwt: myJWT};
  //turn into json
  const sessString = JSON.stringify(sess);
  //encode as base64
  const base64 = Buffer.from(sessString).toString('base64');
  //return a string that is the cookie (express:sess=etc)
  return [`session=${base64}`];
}