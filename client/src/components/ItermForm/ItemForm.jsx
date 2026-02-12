import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx"
import { useContext, useState } from 'react';
import { addItem } from "../../services/ItemService.js"
import { toast } from 'react-hot-toast';
import './ItemForm.css'


const ItemForm = () => {
  const { categories , setCategories, itemsData, setItemsData } = useContext(AppContext);
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    categoryId: "",
    price: "",
    description: "",
  });

  const onChangeHandler = async (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setData((prevData) => ({...prevData, [name]: value}))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("item", JSON.stringify(data));
    formData.append("file", image);
    try {
      if (!image) {
        toast.error('Please elect image');
        return;
      }

      const response = await addItem(formData);
      if (response.status === 201) {
        setItemsData(prevItemsData => [...prevItemsData, response.data]);
        setCategories((prevCategories) => 
          prevCategories.map(category => category.categoryId === data.categoryId ? {...category, items: category.items + 1} : category))
        toast.success("Item added");
        setData({
          name: "",
          categoryId: "",
          price: "",
          description: ""
        });
        setImage(false);
      } else {
        toast.error("Unable to add the item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to add item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="item-form-container" style={{height:'100vh', overflowY:'auto', overflowX: 'hidden'}}>
      <div className="py-2 px-4 container">
        <div className="row">
          <div className="card form-container">
            <div className="card-body">
              <form onSubmit={onSubmitHandler}>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                      <img src={image ? URL.createObjectURL(image) : assets.upload} alt="" width={48}/>
                  </label>
                  <input type="file" name="image" id="image" className='form-control' hidden onChange={(e) => setImage(e.target.files[0])}/>
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input type="text" 
                    name="name" 
                    id="name" 
                    className="form-control" 
                    placeholder="Item Name" 
                    onChange={onChangeHandler}
                    value={data.name}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select name="categoryId" id="category" className="form-control" onChange={onChangeHandler} value={data.categoryId} required>
                    <option value="">--SELECT CATEGORY--</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.categoryId}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Price</label>
                  <input type="number" name="price" id="name" className="form-control" placeholder="&#8364;200" onChange={onChangeHandler} value={data.price} required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea 
                    rows="5" 
                    name="description" 
                    id="description" 
                    className="form-control" 
                    placeholder="write content here.."
                    onChange={onChangeHandler}
                    value={data.description}></textarea> 
                </div>
                <button type="submit" className="btn btn-warning w-100" disabled={loading}>{loading ? "Loading..." : "Save"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemForm