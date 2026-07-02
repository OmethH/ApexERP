'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { formatDate, getInitials, formatRelativeDate } from '@/utils/formatters';
import {
  Send,
  MessageSquare,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  HelpCircle,
  ArrowLeft,
  X
} from 'lucide-react';

export default function InquiriesPage() {
  const { user } = useAuth();
  const {
    inquiries = [],
    addInquiry,
    addInquiryMessage,
    updateInquiryStatus,
    members = [],
    branches = []
  } = useData();

  // Common UI State
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Admin View State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, pending, replied, closed

  // Customer View State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newFirstMessage, setNewFirstMessage] = useState('');

  // Mobile navigation helper
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Identify member if Customer
  const currentCustomer = useMemo(() => {
    if (user?.role !== 'Customer') return null;
    return members.find(m => m.id === user.memberId || m.email === user.email) || null;
  }, [members, user]);

  // Filter inquiries based on user role
  const displayInquiries = useMemo(() => {
    if (user?.role === 'Customer') {
      return inquiries.filter(inq => inq.memberId === currentCustomer?.id);
    } else {
      // Admin/Staff: Apply search and tabs
      return inquiries.filter(inq => {
        const matchesSearch =
          inq.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inq.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          filterTab === 'all' ||
          (filterTab === 'pending' && (inq.status === 'open' || inq.status === 'sent')) ||
          (filterTab === 'replied' && inq.status === 'replied') ||
          (filterTab === 'closed' && inq.status === 'closed');
        return matchesSearch && matchesStatus;
      });
    }
  }, [inquiries, user, currentCustomer, searchQuery, filterTab]);

  // Set default selected inquiry
  useEffect(() => {
    if (displayInquiries.length > 0 && !selectedInquiryId) {
      setSelectedInquiryId(displayInquiries[0].id);
    }
  }, [displayInquiries, selectedInquiryId]);

  // Get active inquiry
  const selectedInquiry = useMemo(() => {
    return inquiries.find(inq => inq.id === selectedInquiryId) || null;
  }, [inquiries, selectedInquiryId]);

  // Get active inquiry customer profile (for Admin view right panel)
  const activeInquiryMember = useMemo(() => {
    if (!selectedInquiry) return null;
    return members.find(m => m.id === selectedInquiry.memberId) || null;
  }, [selectedInquiry, members]);

  // Look up branch name for details panel
  const activeInquiryBranch = useMemo(() => {
    if (!activeInquiryMember) return null;
    return branches.find(b => b.id === activeInquiryMember.branchId) || null;
  }, [activeInquiryMember, branches]);

  // Scroll chat messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedInquiry?.messages?.length, mobileShowChat]);

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedInquiry) return;

    addInquiryMessage(
      selectedInquiry.id,
      user.id,
      user.name,
      user.role,
      messageText.trim()
    );
    setMessageText('');
  };

  // Create new inquiry handler (Customer)
  const handleCreateInquiry = (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newFirstMessage.trim() || !currentCustomer) return;

    const newInq = addInquiry(
      currentCustomer.id,
      currentCustomer.fullName,
      newSubject.trim(),
      newFirstMessage.trim(),
      user.id,
      user.role
    );

    setNewSubject('');
    setNewFirstMessage('');
    setIsModalOpen(false);
    setSelectedInquiryId(newInq.id);
    setMobileShowChat(true);
  };

  // Toggle status handler (Admin/Customer)
  const handleToggleStatus = (newStatus) => {
    if (!selectedInquiry) return;
    updateInquiryStatus(selectedInquiry.id, newStatus);
  };

  // Quick reply templates
  const templates = [
    { label: 'Freeze Membership', text: 'Hello! I have verified your request. We have temporarily frozen your membership for 2 weeks starting from next Monday. Let us know if you need any adjustments.' },
    { label: 'Trainer Assigned', text: 'Hi! I have successfully reassigned your trainer profile. You are now working with Coach Chamara. Feel free to connect during your next session.' },
    { label: 'Billing Canceled', text: 'Hello! We apologize for the billing error. We have reviewed your ledger, voided the incorrect invoice, and updated your status. No further action is required.' },
    { label: 'Awaiting Action', text: 'Hi! Thanks for contacting us. We have received your inquiry and are checking with the branch manager. We will update you here shortly.' }
  ];

  // Render Status Badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'open':
      case 'sent':
        return <Badge status="info">Sent</Badge>;
      case 'replied':
        return <Badge status="active">Replied</Badge>;
      case 'closed':
        return <Badge status="expired">Closed</Badge>;
      default:
        return <Badge status="default">{status}</Badge>;
    }
  };

  // Render sidebar items
  const renderSidebarInquiries = () => {
    if (displayInquiries.length === 0) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <HelpCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontSize: '13px' }}>No inquiries found</p>
        </div>
      );
    }

    return displayInquiries.map((inq) => {
      const isActive = inq.id === selectedInquiryId;
      const lastMsg = inq.messages[inq.messages.length - 1];
      const isUnread = (inq.status === 'open' || inq.status === 'sent') && user?.role !== 'Customer';

      return (
        <div
          key={inq.id}
          className={`inquiry-item ${isActive ? 'active' : ''}`}
          style={{
            borderLeft: isUnread ? '3px solid var(--accent-primary)' : isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
            background: isUnread ? 'rgba(216, 0, 0, 0.05)' : undefined
          }}
          onClick={() => {
            setSelectedInquiryId(inq.id);
            setMobileShowChat(true);
          }}
        >
          <div className="inquiry-item-header">
            <span className="inquiry-item-name" style={{ fontWeight: isUnread ? 700 : 600 }}>
              {user?.role === 'Customer' ? inq.subject : inq.memberName}
            </span>
            <span className="inquiry-item-date">
              {formatRelativeDate(inq.updatedAt)}
            </span>
          </div>
          {user?.role !== 'Customer' && (
            <div className="inquiry-item-subject" style={{ fontWeight: isUnread ? 600 : 400 }}>
              {inq.subject}
            </div>
          )}
          <div className="inquiry-item-lastmsg">
            {lastMsg ? `${lastMsg.senderRole === user?.role ? 'You: ' : ''}${lastMsg.content}` : ''}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            {renderStatusBadge(inq.status)}
            {isUnread && (
              <span style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                New Message
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Header
        title="Support Center"
        subtitle={user?.role === 'Customer' ? 'Submit and track queries with gym administration' : 'Manage and reply to customer inquiries'}
      />

      <div className="dashboard-content">
        <div className="inquiries-container animate-fade-in">
          
          {/* LEFT PANEL: INQUIRIES LIST */}
          <div 
            className={`inquiries-sidebar ${mobileShowChat ? 'hidden-mobile' : ''}`}
            style={{ display: mobileShowChat ? 'none' : 'flex', width: '100%', maxWidth: '100%', md: { display: 'flex', width: '340px' } }}
          >
            {/* SEARCH & FILTERS (ADMIN) / NEW BUTTON (CUSTOMER) */}
            <div className="sidebar-search-container">
              {user?.role === 'Customer' ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                >
                  <Plus size={16} /> New Support Inquiry
                </button>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      className="sidebar-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                  <div className="filter-pills">
                    <button className={`filter-pill ${filterTab === 'all' ? 'active' : ''}`} onClick={() => setFilterTab('all')}>All</button>
                    <button className={`filter-pill ${filterTab === 'pending' ? 'active' : ''}`} onClick={() => setFilterTab('pending')}>Sent</button>
                    <button className={`filter-pill ${filterTab === 'replied' ? 'active' : ''}`} onClick={() => setFilterTab('replied')}>Replied</button>
                    <button className={`filter-pill ${filterTab === 'closed' ? 'active' : ''}`} onClick={() => setFilterTab('closed')}>Closed</button>
                  </div>
                </>
              )}
            </div>

            {/* LIST */}
            <div className="inquiries-list">
              {renderSidebarInquiries()}
            </div>
          </div>

          {/* CENTER PANEL: ACTIVE CHAT WINDOW */}
          <div 
            className={`chat-window ${!mobileShowChat ? 'hidden-mobile' : ''}`}
            style={{ display: !mobileShowChat && window?.innerWidth <= 768 ? 'none' : 'flex' }}
          >
            {selectedInquiry ? (
              <>
                {/* CHAT HEADER */}
                <div className="chat-window-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <button 
                      className="btn-icon mobile-only" 
                      onClick={() => setMobileShowChat(false)}
                      style={{ marginRight: '4px', background: 'transparent', border: 'none', color: 'white' }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="chat-header-info">
                      <h4 className="chat-header-title">{selectedInquiry.subject}</h4>
                      <p className="chat-header-subtitle">
                        {user?.role === 'Customer' ? 'Gym Support Agents' : `Inquiry from ${selectedInquiry.memberName}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {renderStatusBadge(selectedInquiry.status)}
                    {user?.role !== 'Customer' && (
                      selectedInquiry.status !== 'closed' ? (
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleToggleStatus('closed')}
                          style={{ fontSize: '11px', padding: '6px 10px' }}
                        >
                          <CheckCircle2 size={13} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Resolve Thread
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => handleToggleStatus('sent')}
                          style={{ fontSize: '11px', padding: '6px 10px' }}
                        >
                          Re-open Thread
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* MESSAGES LIST */}
                <div className="chat-messages-container">
                  {selectedInquiry.messages.map((msg) => {
                    const isCurrentUserSender = msg.senderId === user?.id;
                    const avatarInitials = getInitials(msg.senderName);

                    return (
                      <div 
                        key={msg.id} 
                        className={`chat-message-group ${isCurrentUserSender ? 'sender-user' : 'sender-other'}`}
                      >
                        <div className="chat-message-avatar">
                          {avatarInitials}
                        </div>
                        <div className="chat-message-bubble-wrapper">
                          <div className="chat-message-bubble">
                            {msg.content}
                          </div>
                          <div className="chat-message-meta">
                            <span className="chat-message-sender-name">{msg.senderName}</span>
                            <span>•</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* CHAT INPUT AREA */}
                <div className="chat-input-area">
                  {/* ADMIN QUICK REPLY TEMPLATES */}
                  {user?.role !== 'Customer' && selectedInquiry.status !== 'closed' && (
                    <div className="quick-templates">
                      {templates.map((tpl, idx) => (
                        <button
                          key={idx}
                          className="quick-template-btn"
                          onClick={() => setMessageText(tpl.text)}
                          title={tpl.text}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* INPUT FORM */}
                  <form onSubmit={handleSendMessage} className="chat-input-row">
                    <textarea
                      placeholder={selectedInquiry.status === 'closed' ? 'This thread is closed. Re-open to reply.' : 'Type your message...'}
                      className="chat-input-textarea"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={selectedInquiry.status === 'closed'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!messageText.trim() || selectedInquiry.status === 'closed'}
                      style={{ padding: '12px 16px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="chat-empty-state">
                <MessageSquare size={48} />
                <h3>No Inquiry Selected</h3>
                <p>Select an inquiry from the sidebar list to view the conversation history.</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: CUSTOMER INFO PROFILE (ADMIN/STAFF VIEW ONLY) */}
          {user?.role !== 'Customer' && selectedInquiry && (
            <div className="chat-info-panel">
              {activeInquiryMember ? (
                <>
                  <div className="info-panel-section" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <span className="info-panel-title">Member Profile</span>
                    <div className="info-panel-user">
                      <div className="info-panel-avatar">
                        {getInitials(activeInquiryMember.fullName)}
                      </div>
                      <div>
                        <h4 className="info-panel-user-name">{activeInquiryMember.fullName}</h4>
                        <p className="info-panel-user-id">{activeInquiryMember.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="info-panel-section">
                    <span className="info-panel-title">Membership Status</span>
                    <div className="info-grid">
                      <div className="info-grid-row">
                        <span className="info-grid-label">Status Check</span>
                        <span className={`info-grid-value ${activeInquiryMember.status === 'active' ? 'highlight-success' : 'highlight-error'}`}>
                          {activeInquiryMember.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="info-grid-row">
                        <span className="info-grid-label">Active Package</span>
                        <span className="info-grid-value" style={{ color: 'white', fontWeight: 600 }}>{activeInquiryMember.packageName}</span>
                      </div>
                      <div className="info-grid-row">
                        <span className="info-grid-label">Valid Until</span>
                        <span className="info-grid-value">{formatDate(activeInquiryMember.membershipEnd)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-panel-section">
                    <span className="info-panel-title">Contact & Branch</span>
                    <div className="info-grid">
                      <div className="info-grid-row">
                        <span className="info-grid-label">Branch</span>
                        <span className="info-grid-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={13} style={{ color: 'var(--text-tertiary)' }} />
                          {activeInquiryBranch?.name?.replace('Power World ', '') || 'Colombo'}
                        </span>
                      </div>
                      <div className="info-grid-row">
                        <span className="info-grid-label">Email</span>
                        <span className="info-grid-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                          <Mail size={13} style={{ color: 'var(--text-tertiary)' }} />
                          {activeInquiryMember.email}
                        </span>
                      </div>
                      <div className="info-grid-row">
                        <span className="info-grid-label">Phone</span>
                        <span className="info-grid-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} style={{ color: 'var(--text-tertiary)' }} />
                          {activeInquiryMember.phone}
                        </span>
                      </div>
                      <div className="info-grid-row">
                        <span className="info-grid-label">Joined Date</span>
                        <span className="info-grid-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-tertiary)' }} />
                          {formatDate(activeInquiryMember.joinDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-panel-section">
                    <span className="info-panel-title">Emergency Contact</span>
                    <div className="info-grid">
                      <div className="info-grid-row">
                        <span className="info-grid-label">Contact Number</span>
                        <span className="info-grid-value">{activeInquiryMember.emergencyContact || 'Not Specified'}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px var(--space-5)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <ShieldAlert size={28} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '12px' }}>Member profile details unavailable</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* NEW INQUIRY MODAL (CUSTOMER ONLY) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit New Support Inquiry"
      >
        <form onSubmit={handleCreateInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject / Topic</label>
            <input
              type="text"
              placeholder="e.g. Request to Freeze Membership"
              className="sidebar-search-input"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Message Description</label>
            <textarea
              placeholder="Explain your inquiry in detail. Admin officers will respond to you here."
              className="chat-input-textarea"
              style={{ minHeight: '120px' }}
              value={newFirstMessage}
              onChange={(e) => setNewFirstMessage(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!newSubject.trim() || !newFirstMessage.trim()}
            >
              Submit Inquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Styles for mobile hidden visibility */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
          .chat-window {
            display: flex !important;
          }
          .inquiries-sidebar {
            display: flex !important;
            width: 340px !important;
          }
        }
      `}</style>
    </>
  );
}
