import './CartSummary.css'
import { useContext, useState } from 'react'
import { AppContext } from "../../context/AppContext.jsx"
import { toast } from 'react-hot-toast';
import { createOrder, deleteOrder } from "../../services/OrderService.js"
import { createStripePaymentIntent, verifyPayment } from "../../services/PaymentService.js"
import { StripeModal } from "../Payment/StripeModal.jsx"

const CartSummary = ({ customerName, mobileNumber, setCustomerName, setMobileNumber }) => {
  const { cartItems } = useContext(AppContext);
  const [clientSecret, setClientSecret] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState(null)

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = totalAmount * 0.01;
  const grandTotal = totalAmount + tax;


  const deleteOrderOnFailure = async (orderId) => {
    try {
      await deleteOrder(orderId);
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete order");
    }
  }

  const completePayment = async (paymentMode) => {
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
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
      setOrderId(savedData.orderId)
      if (response.status === 201 && paymentMode === 'CASH') {
        toast.success("Cash received")
        setOrderDetails(savedData)
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
          <button className="btn btn-success flex-grow-1" onClick={() => completePayment("CASH")}>
            Cash
          </button>
          <button className="btn btn-primary flex-grow-1" onClick={() => completePayment("BANK")}>
            Bank Transfer
          </button>
        </div>
        <div className="d-flex gap-3 mt-3">
          <button className="btn btn-warning flex-grow-1">
            Place Order
          </button>
        </div>
      </div>
      <StripeModal
        showCheckout={showCheckout}
        clientSecret={clientSecret}
        hideWindow={() => setShowCheckout(false)}
        deleteOrderOnFailure={() => deleteOrderOnFailure(orderId)}
        orderId={orderId}
      />  
    </>
  )
}

export default CartSummary;