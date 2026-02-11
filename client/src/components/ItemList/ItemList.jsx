import toast from "react-hot-toast";
import { AppContext } from "../../context/AppContext.jsx"
import { useContext, useState } from 'react';
import './ItemList.css'
import { deleteItem } from "../../services/ItemService.js"

const ItemList = () => {

  const { categories , setCategories, itemsData, setItemsData } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = itemsData.filter(
    item => item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const removeItem = async (item) => {
    try {
      const response = await deleteItem(item.itemId);
      if (response.status === 204) {
        const updatedItems = itemsData.filter(oldItem => oldItem.itemId !== item.itemId);
        setItemsData(updatedItems);
        setCategories((prevCategories) => 
          prevCategories.map(category => category.categoryId === item.categoryId ? {...category, items: category.items - 1} : category))
        toast.success("Item deleted")
      } else {
        toast.error("Unable to delete item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete item");
    }
  }

  return (
    <div className="category-list-container" style={{height: '100vh', overflowY: 'auto', overflowX: 'hidden'}}>
      <div className="row pe-2">
        <div className="input-group mb-3">
          <input 
            type="text" 
            name="keyword" 
            id="keyword" 
            placeholder="Search by Keyword" 
            className="form-control" 
            onChange={(event) => setSearchTerm(event.target.value)} 
            value={searchTerm} 
          />
          <span className="input-group-text bg-warning">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>
      <div className="row g-3 pe-2">
        {filteredItems.map((item, index) => (
          <div className="col-12" key={index}>
            <div className="card p-3 bg-light">
              <div className="d-flex align-items-center">
                <div style={{marginRight: '15px'}}>
                  <img className="item-image" src={item.imgUrl} alt={item.name}/>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-dark">{item.name}</h6>
                  <p className="mb-0 text-dark">
                    Category: {item.categoryName}
                  </p>
                  <span className="mb-0 text-block badge rounded-pill text-bg-warning">
                    &#8364;{item.price}
                  </span>
                </div>
                <div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>  
  )
}

export default ItemList