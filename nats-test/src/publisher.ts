import nats from 'node-nats-streaming';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Publisher connected to NATS');

  const data = JSON.stringify({
    deposit: '40',
    userId: 'CZQ'
  });

  stan.publish('account:deposited', data, () => {
    console.log('Event published');
  });
});