import './CartSummary.css'
import { useContext, useState } from 'react'
import { AppContext } from "../../context/AppContext.jsx"
import { toast } from 'react-hot-toast';
import { createOrder, deleteOrder } from "../../services/OrderService.js"
import { createStripePaymentIntent, verifyPayment } from "../../services/PaymentService.js"
import { StripeModal } from "../Payment/StripeModal.jsx"
import { ReceiptPopup } from "../ReceiptPopup/ReceiptPopup.jsx"

const CartSummary = ({ customerName, mobileNumber, setCustomerName, setMobileNumber }) => {
  const { clearCart, cartItems } = useContext(AppContext);
  const [clientSecret, setClientSecret] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false)

  const total = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalAmount = Number(total.toFixed(2))
  const tax = Number((totalAmount * 0.01).toFixed(2));
  const grandTotal = totalAmount + tax;

  const clearAll = () => {
    setCustomerName("");
    setMobileNumber("");
    clearCart();
    setCurrentOrder(null);

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
        setOrderDetails(savedData)
        setIsProcessing(false)
      } else if (response.status === 201 && paymentMode === 'BANK') {
        const stripeResponse = await createStripePaymentIntent({ amount: grandTotal, currency: 'EUR'})
        console.log(stripeResponse)
        if (!stripeResponse.data.client_secret) {
          deleteOrderOnFailure(orderId)
          return
        }
        setClientSecret(stripeResponse.data.client_secret)
        setShowCheckout(true)
      } else {
        toast.error("Create order failed")
      }
    } catch(error) {
      console.log(error)
      toast.error("Server falied")
    }
  }

  return (
    <>
      <div className="mt-2 j-100 overflow-y-auto">
        <div className="cart-summary-details">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-light">Item: </span>
            <span className="text-light">&#8364;{ totalAmount.toFixed(2) }</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-light">Tax(1%): </span>
            <span className="text-light">&#8364;{tax.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-4">
            <span className="text-light">Total: </span>
            <span className="text-light">&#8364;{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="d-flex gap-3">
          <button className="btn btn-success flex-grow-1" onClick={() => completePayment("CASH")} disabled={isProcessing}>
            {isProcessing ? "Processing" : "Cash"}
          </button>
          <button className="btn btn-primary flex-grow-1" onClick={() => completePayment("BANK")} disabled={isProcessing}>
            {isProcessing ? "Processing" : "Bank Transfer"}
          </button>
        </div>
        <div className="d-flex gap-3 mt-3">
          <button className="btn btn-warning flex-grow-1" onClick={placeOrder} disabled={isProcessing || !orderDetails}>
            Place Order
          </button>
        </div>
      </div>
      <StripeModal
        showCheckout={showCheckout}
        clientSecret={clientSecret}
        hideWindow={() => setShowCheckout(false)}
        deleteOrderOnFailure={() => deleteOrderOnFailure(currentOrder.orderId)}
        currentOrder={currentOrder}
        setOrderDetails={setOrderDetails}
        setClientSecret={setClientSecret}
        setIsProcessing={setIsProcessing}
      />  
      {
        showPopup && (
        <ReceiptPopup 
          orderDetails={{...orderDetails, stripePaymentId: orderDetails.paymentDetails?.stripePaymentIntentId}} 
          onClose={() => setShowPopup(false)}
          onPrint={handlePrintReceipt}
        />)
      }
    </>
  )
}

export default CartSummary;