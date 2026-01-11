import { createContext, useState, useEffect } from "react";
import { fetchCategories } from '../services/CategoryService';
import { fetchItems } from '../services/ItemService';

export const AppContext = createContext(null);

export const AppContextProvider = (props) => {

  const [categories, setCategories] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [auth, setAuth] = useState({ token: null, role: null });
  const [cartItems, setCartItems] = useState([])

  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.itemId === item.itemId)
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => cartItem.itemId === item.itemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.itemId !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems(cartItems.map(item => item.itemId === itemId ? { ...item, quantity: newQuantity } : item))
  }
  
  const loadData = async () => {
    try {
      const response = await fetchCategories();
      const itemResponse = await fetchItems();
      setCategories(response.data);
      setItemsData(itemResponse.data);
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(()=> {
    if(localStorage.getItem("token") && localStorage.getItem("role")) {
      setAuthData(
        localStorage.getItem("token"),
        localStorage.getItem("role")
      );
    }
  }, [])

  const setAuthData = (token, role) => {
    setAuth({ token, role });
    if (token) {
      loadData()
    }
  }

  const contextValue = {
    categories,
    setCategories,
    auth,
    setAuthData,
    itemsData,
    setItemsData,
    addToCart,
    cartItems,
    removeFromCart,
    updateQuantity
  }

  return  (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  )
}