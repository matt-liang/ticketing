import { TicketCreatedEvent } from "@mlticketing/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketCreatedListener } from "../ticket-created-listener"

const setup = () => {
  // create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create a fake ticket created event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = setup();

  // call the onMessage function with the data and message object
  await listener.onMessage(data, msg);

  // assert that the ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = setup();

  // call the onMessage function with the data and message object
  await listener.onMessage(data, msg);

  // assert that the ack function is called
  expect(msg.ack).toHaveBeenCalled();
});