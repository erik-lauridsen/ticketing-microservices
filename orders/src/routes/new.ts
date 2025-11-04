import { Router, Request, Response } from "express";
import { NotFoundError, BadRequestError, requireAuth, validateRequest, OrderStatus, Subjects, OrderCreatedEvent } from "@elauridsen_tickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();
const ORDER_LIFESPAN_SECONDS = 1 * 60;

router.post('/api/orders',
  requireAuth, 
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input:string) => {
        return mongoose.Types.ObjectId.isValid(input)
      })
      .withMessage('valid TicketId must be provided')
  ], 
  validateRequest, 
  async (req:Request, res:Response) => {
    //Find the ticket
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError();
    //make sure it's not already reserved
    const reserved = await ticket.isReserved();
    if (reserved) throw new BadRequestError('Ticket has already been reserved.');
    //calculate the expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + ORDER_LIFESPAN_SECONDS);
    //build the order and save
    const order = Order.build({
      userId: req.currentUser!.id, //validated with requireAuth
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();
    //publish an event saying that the order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userID: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      }
    })
    res.status(201).send(order);
  }
);

export {router as createOrderRouter}