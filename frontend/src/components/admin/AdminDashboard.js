import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalLinks: 0, totalUsers: 0 });
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, linksRes] = await Promise.all([
          axios.get('/api/admin/stats', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          }),
          axios.get('/api/admin/links', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          })
        ]);
        setStats(statsRes.data);
        setLinks(linksRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const deleteLink = async (id) => {
    try {
      await axios.delete(`/api/admin/links/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLinks(links.filter(link => link._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="stats">
        <p>Total Links: {stats.totalLinks}</p>
        <p>Total Users: {stats.totalUsers}</p>
      </div>
      <div className="links-management">
        <h3>All Links</h3>
        <table>
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short Code</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map(link => (
              <tr key={link._id}>
                <td>{link.originalUrl}</td>
                <td>{link.shortCode}</td>
                <td>{new Date(link.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => deleteLink(link._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
