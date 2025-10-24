import express, {Request, Response} from 'express';
import { NotFoundError, BadRequestError } from '@elauridsen_tickets/common';
import { Ticket } from '../models/ticket';
import {  isValidObjectId } from 'mongoose';



const router = express.Router();


router.get('/api/tickets/:id', 
  async (req: Request, res: Response) => {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError()
    res.send(ticket);
  }
);

export { router as showTicketRouter };
