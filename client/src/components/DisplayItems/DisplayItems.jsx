import './DisplayItems.css'
import { AppContext } from "../../context/AppContext.jsx"
import { useContext } from 'react'
import Item  from "../Items/Item.jsx"

const DisplayItems = () => {
  const { itemsData } = useContext(AppContext)
  return (
    <div className="p-3">
      <div className="row g-3">
        {itemsData.map((item, index) => (
          <div key={index} className="col-md-4 col-sm-6">
            <Item 
              itemName={item.name}
              itemPrice={item.price}
              itemImage={item.imgUrl}
              itemId={item.itemId}
            />
          </div>
        ))}
      </div>
    </div> 
  )
}

export default DisplayItems;