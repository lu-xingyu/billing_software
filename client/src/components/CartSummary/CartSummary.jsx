import './CartSummary.css'
import { useContext, useState } from 'react'
import { AppContext } from "../../context/AppContext.jsx"
import { toast } from 'react-hot-toast';
import { createOrder, deleteOrder } from "../../services/OrderService.js"
import { createStripePaymentIntent } from "../../services/PaymentService.js"
import WaitPayment from "../Payment/WaitPayment.jsx"
import { ReceiptPopup } from "../ReceiptPopup/ReceiptPopup.jsx"
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AppContants } from "../../util/constants.js"

const stripePromise = loadStripe(AppContants.STRIPE_PUB_KEY);
const CartSummary = ({ customerName, mobileNumber, setCustomerName, setMobileNumber }) => {


  const { clearCart, cartItems } = useContext(AppContext);
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)

  const total = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalAmount = Number(total.toFixed(2))
  const tax = Number((totalAmount * 0.01).toFixed(2));
  const grandTotal = totalAmount + tax;

  const clearAll = () => {
    setCustomerName("");
    setMobileNumber("");
    setPaymentStatus(null)
    setClientSecret(null)
    clearCart();
  }

  const placeOrder = () => {
    setShowPopup(true);
    clearAll()
  }

  const handlePrintReceipt = () => {
    window.print();
  }

  const deleteOrderOnFailure = async (orderId) => {
    try {
      await deleteOrder(orderId);
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete order");
    }
  }

  const completePayment = async (paymentMode) => {
    setIsProcessing(true);
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
      setIsProcessing(false)
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      customerName,
      phoneNumber: mobileNumber,
      cartItems,
      tax,
      subtotal: totalAmount,
      grandTotal,
      paymentMethod: paymentMode.toUpperCase()
    }

    try {
      const response = await createOrder(orderData);
      const savedData = response.data
      setCurrentOrder(savedData)
      if (response.status === 201 && paymentMode === 'CASH') {
        toast.success("Cash received")
      } else if (response.status === 201 && paymentMode === 'BANK') {
        const stripeResponse = await createStripePaymentIntent({ orderId: savedData.orderId, amount: grandTotal, currency: 'EUR'})
        setShowCheckout(true)
        setClientSecret(stripeResponse.data.client_secret)
        setPaymentStatus("pending")
      } else {
        toast.error("Create order failed")
      }
    } catch(error) {
      console.log(error)
      toast.error("Server falied")
    }
    setIsProcessing(false)
  }

  return (
    <>
      <div className="mt-2 j-100 overflow-y-auto">
        <div className="cart-summary-details">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-dark">Item: </span>
            <span className="text-dark">&#8364;{ totalAmount.toFixed(2) }</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-dark">Tax(1%): </span>
            <span className="text-dark">&#8364;{tax.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-4">
            <span className="text-dark">Total: </span>
            <span className="text-dark">&#8364;{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="d-flex gap-3">
          <button className="btn btn-primary flex-grow-1" onClick={() => completePayment("CASH")} disabled={isProcessing || paymentStatus === "succeeded"}>
            {isProcessing ? "Processing" : "Cash"}
          </button>
          <button className="btn btn-success flex-grow-1" onClick={() => completePayment("BANK")} disabled={isProcessing || paymentStatus === "succeeded"}>
            {isProcessing ? "Processing" : "Bank Transfer"}
          </button>
        </div>
        <div className="d-flex gap-3 mt-3">
          <button className="btn btn-warning flex-grow-1" onClick={placeOrder} disabled={isProcessing || !paymentStatus === "succeeded"}>
            Place Order
          </button>
        </div>
      </div>

      {currentOrder  && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <WaitPayment
            orderId={currentOrder.orderId}
            setCurrentOrder={setCurrentOrder}
            showCheckout={showCheckout}
            setShowCheckout = {setShowCheckout}
            deleteOrderOnFailure={() => deleteOrderOnFailure(currentOrder.orderId)}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            clientSecret={clientSecret}
          /> 
        </Elements>)
      }
      {
        showPopup && currentOrder && (
        <ReceiptPopup 
          orderDetails={{...currentOrder, stripePaymentId: currentOrder.paymentDetails.stripePaymentIntentId}} 
          onClose={() => setShowPopup(false)}
          onPrint={handlePrintReceipt}
        />)
      }
    </>
  )
}

export default CartSummary;