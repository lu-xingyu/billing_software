import './CartSummary.css'
import { useContext, useState } from 'react'
import { AppContext } from "../../context/AppContext.jsx"
import { toast } from 'react-hot-toast';
import { createOrder, deleteOrder } from "../../services/OrderService.js"
import { createStripePaymentIntent, verifyPayment } from "../../services/PaymentService.js"
import { AppContants } from "../../util/constants.js"

const CartSummary = ({ customerName, mobileNumber, setCustomerName, setMobileNumber }) => {
  const { cartItems } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null);

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = totalAmount * 0.01;
  const grandTotal = totalAmount + tax;

  const loadStripeScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/"
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    })
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
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    const orderData = {
      customerName,
      phoneNumber: mobileNumber,
      cartItems,
      tax,
      subTotal: totalAmount,
      grandTotal,
      paymentMethod: paymentMode.toUpperCase()
    }

    try {
      const response = await createOrder(orderData);
      const savedData = response.data
      if (response.status === 201 && paymentMode === 'cash') {
        toast.success("Cash received")
        setOrderDetails(savedData)
      } else if (response.status === 201 && paymentMode === 'bank transfer') {
        const stripeLoaded = await loadStripeScript();
        if (!stripeLoaded) {
          toast.error("Unable to load Stripe");
          await deleteOrderOnFailure(savedData.orderId);
          return;
        } 

        const stripe = window.Stripe(AppContants.STRIPE_PUB_KEY);
        const elements = stripe.elements();

        const cardElement = elements.create("card", {
          style: {
            base: {
              fontSize: "16px",
              color: "#3399cc",
              "::placeholder": { color: "#aab7c4" }
            }
          }
        });

        cardElement.mount("#card-element");

        //create stripe payment intent
        const stripeResponse = await createStripePaymentIntent({ amount: grandTotal, currency: 'EUR'})
        await confirmStripePayment(stripeResponse.client_secret, savedData.orderId)
      }


    }catch(error) {

    }
  }

  return (
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
        <button className="btn btn-success flex-grow-1">
          Cash
        </button>
        <button className="btn btn-primary flex-grow-1">
          Bank Transfer
        </button>
      </div>
      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-warning flex-grow-1">
          Place Order
        </button>
      </div>
    </div>
  )
}

export default CartSummary;