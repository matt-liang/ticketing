import { TicketCreatedEvent } from "@mlticketing/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {
  // create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 1
  });
  await ticket.save();

  // create a fake ticket updated event
  const data: TicketCreatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new title',
    price: 2,
    userId: '123',
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('finds, updates, and saves a ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('does not call ack if the event has skipped a version', async () => {
  const { listener, data, msg } = await setup();

  // set data version to be higher than record version + 1
  data.version = 10

  try {
    await listener.onMessage(data, msg);
  } catch (err) { }

  expect(msg.ack).not.toHaveBeenCalled();
});