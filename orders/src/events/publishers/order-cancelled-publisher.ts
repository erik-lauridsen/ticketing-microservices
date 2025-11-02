import { Publisher, OrderCancelledEvent, Subjects } from "@elauridsen_tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}