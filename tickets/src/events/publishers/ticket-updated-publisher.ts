import { Publisher, Subjects, TicketUpdatedEvent } from "@mlticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
}