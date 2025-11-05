import { useEffect, useState } from "react";
import StripeCheckOut from 'react-stripe-checkout';
import { useRequest } from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({order, currentUser}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders')
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    }
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    }
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>
  }

  return (
    <div>
      <div>OrderShow</div>
      <h1>{timeLeft} seconds until order expires.</h1>
      <StripeCheckOut 
        token={({ id }) => doRequest({ token:id })} 
        stripeKey="pk_test_51SPOhpLQC4iDb0YhLUYtCv1deXtsGf61z6hm6745PR0o4uBt4yQyggsjvbWaflMVbh600CozwpUprT8qS6ANb7Vy003D3ZoAg1"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>

  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
}

export default OrderShow;