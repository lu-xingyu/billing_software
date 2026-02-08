import { Modal, Button } from "react-bootstrap";
import {  useEffect, useState } from 'react'
import { getOrder } from '../../services/OrderService'
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { toast } from 'react-hot-toast';



const WaitPayment = ({ orderId, setCurrentOrder, showCheckout, setShowCheckout, deleteOrderOnFailure, paymentStatus, setPaymentStatus, clientSecret}) => {
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
      setLoading(false)
    }
  }


  useEffect(() => {
    console.log("useEffect triggered", orderId);

    if (!orderId || !showCheckout) {
      return
    }

    const interval = setInterval(async () => {
      const response = await getOrder(orderId)

      const actualStatus = response.data.paymentDetails.status
      if (actualStatus === "COMPLETED") {
        setCurrentOrder(response.data)
        setPaymentStatus("succeeded")
        clearInterval(interval)
        setLoading(false)
        setShowCheckout(false)
        toast.success("Payment successful")
      } 
    }, 2000)

    return () => clearInterval(interval)
  }, [orderId, showCheckout])

  return (
    <Modal 
      show={showCheckout} 
      onHide={async () => {
        await deleteOrderOnFailure();
        setShowCheckout(false);
      }}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>Wait Payment</Modal.Header>
      <Modal.Body>
        <div>
          {paymentStatus === "pending" && (
            <div className="d-flex align-items-center">
              <div className="spinner-border text-primary me-2" role="status"></div>
              <span>Waiting for payment...</span>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div>
              <p>Payment failed</p>
            </div>
          )}
        </div>
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
              postalCode: true
            }}
          />

          {error && <div className="text-danger mt-2">{error}</div>}

          <button className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default WaitPayment;