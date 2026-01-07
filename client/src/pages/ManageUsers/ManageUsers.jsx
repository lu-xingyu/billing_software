import UserForm from '../../components/UserForm/UserForm';
import UsersList from '../../components/UsersList/UsersList';
import './ManageUsers.css';
import { useEffect, useState } from "react"
import { fetchUsers } from '../../services/UserService'

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getUsers() {
      try {
        setLoading(true);
        const response = await fetchUsers();
        setUsers(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Unable to fetch users")
      } finally {
        setLoading(false);
      }
    }
    getUsers();
  }, [])
  return (
    <div className="users-container text-light">
      <div className="left-column">
        <UserForm setUsers={setUsers}/>
      </div>
      <div className="right-column">
        <UsersList users={users} setUsers={setUsers}/>
      </div>
    </div>
  )
}

export default ManageUsers;