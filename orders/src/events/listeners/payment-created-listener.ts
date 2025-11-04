import { Message } from "node-nats-streaming";
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus} from '@elauridsen_tickets/common';
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const {  orderId } = data;
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    order.status = OrderStatus.Complete;
    await order.save();
    //no need to publish any kind of event to notify, once the order is complete it will not be further modified by any service
    console.log(order);
    msg.ack()
  }
}