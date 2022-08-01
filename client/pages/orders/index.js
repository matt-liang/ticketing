const IndexOrder = ({ orders }) => {
  return (
    <ul>
      {orders.map(order => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        )
      })}
    </ul>
  )
};

IndexOrder.getInitialProps = async (context, client) => {
  const res = await client('/api/orders');
  const data = await res.json();

  return { orders: data };
};

export default IndexOrder;