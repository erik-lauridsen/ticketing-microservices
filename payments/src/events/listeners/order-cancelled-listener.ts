import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@elauridsen_tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data);
    if (!order) throw new Error('Order does not exist or event is out of order');
    order.status = OrderStatus.Cancelled;
    await order.save();
    msg.ack();
  }
}