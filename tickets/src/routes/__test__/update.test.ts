import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { cookie } from '../../test/utils/test-cookie';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie())
    .send({
      title: 'title',
      price: 10
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'title',
      price: 10
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie())
    .send({
      title: 'title',
      price: 10
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie())
    .send({
      title: 'newTitle',
      price: 100
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const testCookie = cookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', testCookie)
    .send({
      title: 'title',
      price: 10
    });

  // invalid title
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', testCookie)
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  // invalid price
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', testCookie)
    .send({
      title: 'title',
      price: -5
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const testCookie = cookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', testCookie)
    .send({
      title: 'title',
      price: 10
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', testCookie)
    .send({
      title: 'new title',
      price: 100
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const testCookie = cookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', testCookie)
    .send({
      title: 'title',
      price: 10,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', testCookie)
    .send({
      title: 'new title',
      price: 100
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const testCookie = cookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', testCookie)
    .send({
      title: 'title',
      price: 10,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', testCookie)
    .send({
      title: 'new title',
      price: 100
    })
    .expect(400);
});
