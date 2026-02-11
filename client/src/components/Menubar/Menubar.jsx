import './Menubar.css'
import { assets } from '../../assets/assets.js'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from 'react';
import { AppContext } from "../../context/AppContext.jsx"
import { LuCoffee } from "react-icons/lu";

const Menubar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuthData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthData(null, null);
    navigate("/login")
  }

  const isAdmin = auth.role === "ROLE_ADMIN"

  const isActive = (path) => {
    return location.pathname === path;
  }
 
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-2">
      <a className="navbar-brand ms-4" href="#">
        <LuCoffee size={40} color="#00704A" className="me-2" />
      </a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse p-1" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className={`nav-link ${isActive('/dashboard') ?  'fw-bold active' : 'fw-bold'}`} to="/dashboard">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive('/explore') ?  'fw-bold active' : 'fw-bold'}`} to="/explore">Explore</Link>
          </li>
          {
            isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/items') ?  'fw-bold active' : 'fw-bold'}`} to="/items">Manage Items</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/category') ?  'fw-bold active' : 'fw-bold'}`} to="/category">Manage Category</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/users') ?  'fw-bold active' : 'fw-bold'}`} to="/users">Manage Users</Link>
                </li>
              </>
            )
          }
          <li className="nav-item">
            <Link className={`nav-link ${isActive('/orders') ?  'fw-bold active' : 'fw-bold'}`} to="/orders">Order History</Link>
          </li>
        </ul>
        {/*Add the dropdown for userprofile*/}
        <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
          <li className="nav-item dropdown">
            <a href="#" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src={assets.profile} alt=""  height={35} width={35} />
            </a>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li>
                <a href="#!" className="dropdown-item" onClick={logout}>
                  Logout
                </a> 
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Menubar;