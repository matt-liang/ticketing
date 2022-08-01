import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { cookie } from '../../test/utils/test-cookie';

it('fetches the order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 10
  });
  await ticket.save();

  const testCookie = cookie();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', testCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', testCookie)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
  expect(fetchedOrder.ticket.id).toEqual(ticket.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 10
  });
  await ticket.save();

  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to fetch the order as another user
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie())
    .expect(401);
});