import { Modal, Button } from "react-bootstrap";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "./CheckoutForm.jsx";
import { AppContants } from "../../util/constants.js"


const stripePromise = loadStripe(AppContants.STRIPE_PUB_KEY);

export const StripeModal = ({ showCheckout, hideWindow, clientSecret, setIsProcessing, setClientSecret, deleteOrderOnFailure, currentOrder, setOrderDetails}) => {

  if (!clientSecret) return null;
  return (
    <Modal 
      show={showCheckout} 
      onHide={async () => {
        await deleteOrderOnFailure();
        hideWindow();
        setIsProcessing(false)
      }}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Complete Payment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            hideWindow={hideWindow}
            currentOrder={currentOrder}
            setOrderDetails={setOrderDetails}
            setClientSecret={setClientSecret}
            setIsProcessing={setIsProcessing}
          />
        </Elements>
      </Modal.Body>
    </Modal>
  );
}
