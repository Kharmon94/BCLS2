import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Chart } from 'react-chartjs-2';
import LoadingSpinner from './common/LoadingSpinner';
import LinkAnalytics from './analytics/LinkAnalytics';
import { debounce } from 'lodash';

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const shortenLink = async (e) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post('/api/links/shorten', 
        { originalUrl: url },
        { headers: { 'x-auth-token': localStorage.getItem('token') }}
      );
      setLinks([res.data, ...links]);
      setUrl('');
      toast.success('Link shortened successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error shortening link');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get('/api/links/my-links', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setLinks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLinks();
  }, []);

  useEffect(() => {
    const filtered = links.filter(link => 
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(filtered);
  }, [searchTerm, links]);

  const fetchAnalytics = async (linkId) => {
    try {
      const res = await axios.get(`/api/links/analytics/${linkId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to LinkShortener</h2>
        <p>Create and track your shortened links</p>
      </div>
      
      <div className="shortener-section">
        <form onSubmit={shortenLink} className="shortener-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL here"
              className="url-input"
            />
            <button type="submit" disabled={isLoading} className="shorten-button">
              {isLoading ? <LoadingSpinner /> : 'Shorten URL'}
            </button>
          </div>
        </form>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="links-grid">
        {filteredLinks.map(link => (
          <div key={link._id} className="link-card">
            <div className="link-details">
              <h3>Short Link:</h3>
              <div className="copy-section">
                <input 
                  readOnly 
                  value={`${window.location.origin}/${link.shortCode}`}
                />
                <button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${link.shortCode}`);
                  toast.success('Copied to clipboard!');
                }}>
                  Copy
                </button>
              </div>
              <p className="original-url">Original: {link.originalUrl}</p>
              <p className="created-date">Created: {new Date(link.createdAt).toLocaleDateString()}</p>
            </div>
            <button 
              className="analytics-button"
              onClick={() => {
                setSelectedLink(link);
                fetchAnalytics(link._id);
              }}
            >
              View Analytics
            </button>
          </div>
        ))}
      </div>

      {selectedLink && analytics && (
        <LinkAnalytics analytics={analytics} />
      )}
    </div>
  );
};

export default Dashboard;
