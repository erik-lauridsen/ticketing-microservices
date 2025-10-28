import { Subjects, Publisher, TicketUpdatedEvent } from "@elauridsen_tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {

    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated

}