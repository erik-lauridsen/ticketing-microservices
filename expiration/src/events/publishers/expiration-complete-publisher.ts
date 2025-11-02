import {Subjects, Publisher, ExpirationCompleteEvent} from '@elauridsen_tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}