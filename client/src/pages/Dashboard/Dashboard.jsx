import './Dashboard.css'
import { useState, useEffect } from "react";
import { fetchDashboardData } from "../../services/DashboardService"

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDashboardData();
        setData(response.data)
      } catch (error) {
        console.error(error);
        toast.error("Unable to view the data");
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="loading">Failed to load the dashboard data...</div>;
  }
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-currency-euro"></i>
            </div>
            <div className="stat-content">
              <h3>Today's Sales</h3>
              <p>&#8364;{data.todaySales.toFixed(2)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="stat-content">
              <h3>Today's Orders</h3>
              <p>{data.todayOrderCount}</p>
            </div>
          </div>
        </div>
        <div className="recent-orders-card">
          <h3 className="recent-orders-title">
            <i className="bi bi-clock-history"></i>
            Recent Orders
          </h3>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>&#8364;{order.grandTotal.toFixed(2)}</td>
                    <td>
                      <span className={`payment-method ${order.paymentMethod.toLowerCase()}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.paymentDetails.status.toLowerCase()}`}>
                        {order.paymentDetails.status}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;