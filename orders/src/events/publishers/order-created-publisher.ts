import { Publisher, OrderCreatedEvent, Subjects } from "@elauridsen_tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
