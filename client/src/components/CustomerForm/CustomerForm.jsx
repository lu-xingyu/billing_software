import './CustomerForm.css'

const CustomerForm = ({ customerName, mobileNumber, setCustomerName, setMobileNumber }) => {

  return (
    <div className="p-3 container">
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="customerName" className="col-4">Customer name</label>
          <input type="text" className="form-control form-sontrol-sm" id="customerName" onChange={(e) =>setCustomerName(e.target.value)} value={customerName} />
        </div>
      </div>
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="mobileNumber" className="col-4">Mobile number</label>
          <input type="text" className="form-control form-sontrol-sm" id="mobileNumber" onChange={(e) =>setMobileNumber(e.target.value)} value={mobileNumber} />
        </div>
      </div>
    </div> 
  )
}

export default CustomerForm;