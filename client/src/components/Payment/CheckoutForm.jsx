import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "react-toastify";
import { verifyPayment } from "../../services/PaymentService"

export default function CheckoutForm({ clientSecret, hideWindow, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      setError(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // TODO: change backend webhook and delete this
      try {
        const response = await verifyPayment({
          orderId,
          stripePaymentIntentId: paymentIntent.id
        })
        if (response.status === 200) {
          toast.success("Payment successful!");
          hideWindow();
        } else {
          setError("payment failed")
        }
      } catch (e) {
        setError("Verify payment from sever failed")
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#32325d",
              "::placeholder": { color: "#aab7c4" },
            },
          },
        }}
      />

      {error && <div className="text-danger mt-2">{error}</div>}

      <button className="btn btn-primary w-100 mt-3" disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
