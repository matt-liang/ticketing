import { OrderCancelledEvent } from "@mlticketing/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 1,
    userId: new mongoose.Types.ObjectId().toHexString()
  });

  // reserve the ticket by setting an orderId property
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  // create a fake order cancelled data object
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('updates the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  // assert the updatedTicket has an undefined orderId
  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // assert the ack function was called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedJSON = (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]

  // assert that the published event orderId is undefined
  expect(JSON.parse(ticketUpdatedJSON).orderId).not.toBeDefined();
});