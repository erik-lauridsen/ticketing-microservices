import express, { Router, Request, Response } from "express";
import { requireAuth } from "@elauridsen_tickets/common";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.get('/api/orders', 
  requireAuth,
  async (req:Request, res:Response) => {
    const orders = await Order.find( {
      userId: req.currentUser!.id
    }).populate('ticket');``
    res.send(orders);
  }
);

export {router as indexOrderRouter}