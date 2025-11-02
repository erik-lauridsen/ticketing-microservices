import express, { Router, Request, Response } from "express";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@elauridsen_tickets/common";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.delete('/api/orders/:orderId', 
  requireAuth,
  async (req:Request, res:Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) throw new NotFoundError();
    if (order.userId != req.currentUser!.id) throw new NotAuthorizedError();
    order.status = OrderStatus.Cancelled;
    await order.save();
    //publish an event saying the event was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })
    res.sendStatus(204);
});

export {router as deleteOrderRouter}