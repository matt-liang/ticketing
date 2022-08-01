import { Publisher, Subjects, TicketCreatedEvent } from "@mlticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}