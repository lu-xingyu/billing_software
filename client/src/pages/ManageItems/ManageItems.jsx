import ItemList from '../../components/ItemList/ItemList';
import ItemForm from '../../components/ItermForm/ItemForm';
import './ManageItems.css';

const ManageItems = () => {
  return (
    <div className="items-container text-light">
      <div className="left-column">
        <ItemForm />
      </div>
      <div className="right-column">
        <ItemList />
      </div>
    </div>
  )
}

export default ManageItems;