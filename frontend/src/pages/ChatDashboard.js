import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, LogOut, FileText, Bot, Send, Trash2, Clock, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import './Dashboard.css';
import './History.css';

function ChatDashboard({ theme, setTheme }) {

  const [showSidebar, setShowSidebar] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [activeFileTitle, setActiveFileTitle] = useState(null);

  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const fetchHistory = async () => {
    try {
      const resp = await axios.get("http://127.0.0.1:8000/api/history/", {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      setHistoryList(resp.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      fetchHistory();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setSummary(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      });
      setSummary(response.data.summary);
      setActiveFileTitle(file.name);
      fetchHistory();
      setFile(null);
    } catch (error) {
      alert("Failed to process document. Wait and try again.");
    } finally {
      setUploading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setSummary(item.summary);
    setActiveFileTitle(item.title);
  };

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this analysis?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/history/${id}/`, {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` }
        });

        const remaining = historyList.filter(h => h.id !== id);
        setHistoryList(remaining);
        setSummary(null);
        setActiveFileTitle(null);
      } catch (err) {
        alert("Failed to delete item.");
      }
    }
  };

  const startNewAnalysis = () => {
    setSummary(null);
    setActiveFileTitle(null);
    setFile(null);
  };

  const exportSummaryAsPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text(`Analysis Report: ${activeFileTitle || 'Document'}`, 10, y);
    y += 10;

    doc.setFontSize(12);
    const splitAbstract = doc.splitTextToSize(summary.Abstract, 190);
    doc.text(splitAbstract, 10, y);
    y += (splitAbstract.length * 6) + 10;

    if (summary.KeyPoints && summary.KeyPoints.length > 0) {
      summary.KeyPoints.forEach(pt => {
        let cleanPt = pt.replace(/###/g, '').replace(/\*\*/g, '').trim();
        const splitText = doc.splitTextToSize(cleanPt, 190);

        if (y + (splitText.length * 6) > 280) {
          doc.addPage();
          y = 15;
        }

        doc.text(splitText, 10, y);
        y += (splitText.length * 6) + 10;
      });
    }

    doc.save(`Analysis_${activeFileTitle ? activeFileTitle.replace(/\s+/g, '_') : 'Document'}.pdf`);
  };

  return (
    <div className="dashboard-container">

      {/* 🌗 THEME + PROFILE (TOP RIGHT) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 1000
      }}>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div style={{ position: 'relative' }}>
          <div
            className="avatar"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfile(!showProfile)}
          >
            {username ? username[0].toUpperCase() : 'U'}
          </div>

          {showProfile && (
            <div style={{
              position: 'absolute',
              top: '45px',
              right: '0',
              background: '#1f1f1f',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              {username}
            </div>
          )}
        </div>
      </div>

      {!showSidebar && (
        <button
          style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}
          onClick={() => setShowSidebar(true)}
        >
          ☰
        </button>
      )}

      {showSidebar && (
        <nav className="sidebar glass-panel">

          <div className="brand" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={32} />
              <h2>AI Analyst</h2>
            </div>

            <button onClick={() => setShowSidebar(false)}>☰</button>
          </div>

          <div className="nav-items">
            <div className={`nav-item ${!summary ? 'active' : ''}`} onClick={startNewAnalysis}>
              <FileText size={20} /> New Analysis
            </div>

            <div className="history-section">
              <h3 className="section-title"><Clock size={16} /> Recent Activity</h3>
              <div className="history-list">
                {historyList.length === 0 ? (
                  <p className="no-history">No past analyses</p>
                ) : (
                  historyList.map(item => (
                    <div key={item.id} className="history-item" onClick={() => loadHistoryItem(item)}>
                      <span className="history-title">{item.title}</span>
                      <button className="delete-hist-btn" onClick={(e) => deleteHistoryItem(e, item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ✅ LOGOUT AT SIDEBAR BOTTOM */}
          <div className="user-section" style={{ marginTop: 'auto', padding: '1rem' }}>
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

        </nav>
      )}

      <main className="main-chat-area">
        {!summary ? (
          <div className="upload-screen">
            <h1 className="hero-text">Research Page-by-Page Summarizer</h1>
            <p className="hero-subtext">Upload a document to extract highly detailed summaries.</p>

            <div className="upload-box glass-panel">
              <Upload size={48} className="upload-icon" />
              <h3>Upload File</h3>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden-input"
                id="file-upload"
              />

              <label htmlFor="file-upload" className="browse-btn">Browse Files</label>

              {file && <div className="selected-file">{file.name}</div>}

              <button onClick={uploadFile} className="analyze-btn" disabled={!file || uploading}>
                {uploading ? 'Processing...' : 'Analyze'}
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-interface">
            <div className="message-list">
              <div className="message system-msg glass-panel">
                <div className="msg-header">
                  <Bot size={20} />
                  <strong>{activeFileTitle}</strong>

                  <button onClick={exportSummaryAsPDF}>
                    <Download size={16} />
                  </button>
                </div>

                <div className="msg-content">
                  <ReactMarkdown>{summary.Abstract}</ReactMarkdown>

                  {summary.KeyPoints.map((point, index) => (
                    <div key={index} className="page-summary">
                      <ReactMarkdown>{point}</ReactMarkdown>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chat-input-area glass-panel">
              <input disabled placeholder="Chat disabled" />
              <button disabled><Send size={20} /></button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default ChatDashboard;