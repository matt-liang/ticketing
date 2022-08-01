import { OrderCreatedEvent, OrderStatus } from "@mlticketing/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // create a fake order created event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'expires',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  // pass the data and msg object to listener's onMessage func
  await listener.onMessage(data, msg);

  // fetch the ticket
  const updatedTicket = await Ticket.findById(ticket.id);

  // assert the updated ticket has the correct orderId set
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // pass the data and msg object to listener's onMessage func
  await listener.onMessage(data, msg);

  // assert the ack function was called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedJSON = (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]

  // assert that the published event orderId is equal to the received
  // data id 
  expect(JSON.parse(ticketUpdatedJSON).orderId).toEqual(data.id);
});