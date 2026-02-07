import { Modal, Button } from "react-bootstrap";
import {  useEffect, useState } from 'react'
import { getOrder } from '../../services/OrderService'

const WaitPayment = ({ orderId, showCheckout, setShowCheckout, deleteOrderOnFailure, setIsProcessing, paymentStatus, setPaymentStatus }) => {
  
  const [retryTime, setRetryTime] = useState(0)

  const retryPayment = (e) => {
    e.preventDefault()
    setPaymentStatus("pending")
    setRetryTime(retryTime => retryTime + 1)
  }

  useEffect(() => {
    if (!orderId) {
      return
    }

    const interval = setInterval(async () => {
      const response = await getOrder(orderId)
      actualStatus = response.data.PaymentDetails.status
      if (actualStatus === "PAID") {
        setPaymentStatus("succeeded")
        clearInterval(interval)
        setIsProcessing(false)
        setShowCheckout(false)
        toast.success("Payment successful")
      } else if (actualStatus === "FAILED") {
        setPaymentStatus("failed");
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [orderId, retryTime])

  return (
    <Modal 
      show={showCheckout} 
      onHide={async () => {
        await deleteOrderOnFailure();
        setShowCheckout(false)
        setIsProcessing(false)
      }}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton></Modal.Header>
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
              <button onClick={retryPayment}>Retry</button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default WaitPayment;