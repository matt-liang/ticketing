import { useEffect, useState } from "react";
import useRequest from "../../hooks/use-request";
import StripeCheckout from 'react-stripe-checkout';
import Router from "next/router";

const ShowOrder = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);



  if (timeLeft <= 0) {
    return (
      <div>Order expired</div>
    )
  }

  return (
    <div>Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey='pk_test_51K9DUDBwlLtfzlWru4AnhdPqDND3HwYrXoBXKhurSkqWNZHYh9979wE12PqoiYSIAIH7IHdqWTO9tiXlfPDJxm7m00T77Mi6uq'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  )
};

ShowOrder.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const res = await client(`/api/orders/${orderId}`);
  const data = await res.json();
  return { order: data };
};

export default ShowOrder;