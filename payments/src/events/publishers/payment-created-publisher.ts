import { Publisher, PaymentCreatedEvent, Subjects } from "@elauridsen_tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}