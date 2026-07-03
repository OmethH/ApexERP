'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { 
  Plus, Pencil, Trash2, Eye, ShieldAlert,
  ClipboardList, CheckCircle, FileText, Settings, UserCheck, Search
} from 'lucide-react';

const STANDARD_SECTIONS = [
  'Emergency Contact',
  'Health & Medical Readiness',
  'Fitness Experience & Goals',
  'Preferences & Availability',
  'Liability Waiver'
];

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'choice', label: 'Single Choice (Radio)' },
  { value: 'checkboxes', label: 'Multiple Choice (Checkboxes)' }
];

export default function QuestionnaireAdminPage() {
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      await Promise.all([fetchQuestions(), fetchSubmissions()]);
      setLoading(false);
    }
    loadData();
  }, [fetchQuestions, fetchSubmissions]);

  const addQuestion = async (questionData) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      if (res.ok) {
        await fetchQuestions();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add question');
      }
    } catch (err) {
      console.error('Error adding question:', err);
      alert(err.message);
    }
  };

  const updateQuestion = async (id, questionData) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      if (res.ok) {
        await fetchQuestions();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update question');
      }
    } catch (err) {
      console.error('Error updating question:', err);
      alert(err.message);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchQuestions();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      alert(err.message);
    }
  };

  // Guard: Only allow admins
  const isAdmin = user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'submissions'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter submissions by search query
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter(
      sub => 
        sub.memberName.toLowerCase().includes(query) ||
        sub.email.toLowerCase().includes(query) ||
        sub.memberId.toLowerCase().includes(query)
    );
  }, [submissions, searchQuery]);
  
  // Modals state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null for new, question object for edit
  const [questionForm, setQuestionForm] = useState({
    text: '',
    section: STANDARD_SECTIONS[0],
    type: 'text',
    optionsText: '',
    required: true
  });

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Handlers for Question CRUD Modal
  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      section: STANDARD_SECTIONS[0],
      type: 'text',
      optionsText: '',
      required: true
    });
    setIsQuestionModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      text: q.text,
      section: q.section,
      type: q.type,
      optionsText: q.options ? q.options.join(', ') : '',
      required: q.required
    });
    setIsQuestionModalOpen(true);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    
    // Parse options
    let options = null;
    if (questionForm.type === 'choice' || questionForm.type === 'checkboxes') {
      options = questionForm.optionsText
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      if (options.length === 0) {
        alert('Please provide at least one option for multiple choice questions.');
        return;
      }
    }

    const questionData = {
      text: questionForm.text,
      section: questionForm.section,
      type: questionForm.type,
      options: options,
      required: questionForm.required
    };

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }

    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this question? This will not affect past submissions.')) {
      deleteQuestion(id);
    }
  };

  // Handlers for Submissions Modal
  const openSubModal = (sub) => {
    setSelectedSubmission(sub);
    setIsSubModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Header title="Questionnaire Management" subtitle="Configure initial onboarding forms and analyze customer responses." />
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="spinner" />
            <h3>Loading Questionnaire Builder...</h3>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header title="Access Denied" subtitle="Questionnaire Management" />
        <div className="dashboard-content">
          <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
            <ShieldAlert size={48} color="var(--error)" />
            <h3>Unauthorized Access</h3>
            <p>You do not have permission to view this page. Only system Administrators are authorized.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Questionnaire Management" subtitle="Configure initial onboarding forms and analyze customer responses." />
      
      <div className="dashboard-content">
        {/* Tabs */}
        <div className="quest-tabs">
          <button 
            className={`quest-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <Settings size={16} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
            Questionnaire Builder
          </button>
          <button 
            className={`quest-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <UserCheck size={16} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
            Customer Responses ({submissions.length})
          </button>
        </div>

        {/* Tab 1: Questionnaire Builder */}
        {activeTab === 'questions' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Active Forms ({questions.length} questions)</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>These questions are asked to all new customers before they can access the dashboard.</p>
              </div>
              <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Add Question
              </button>
            </div>

            {questions.length > 0 ? (
              <div>
                {questions.map((q, index) => (
                  <div key={q.id} className="q-admin-card">
                    <div className="q-admin-header">
                      <div>
                        <div className="q-admin-meta" style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>#{index + 1} ({q.id})</span>
                          <span className="q-admin-badge badge-section">{q.section}</span>
                          <span className="q-admin-badge badge-type">
                            {QUESTION_TYPES.find(t => t.value === q.type)?.label || q.type}
                          </span>
                          {q.required ? (
                            <span className="q-admin-badge badge-required">Required</span>
                          ) : (
                            <span className="q-admin-badge badge-optional">Optional</span>
                          )}
                        </div>
                        <h4 className="q-admin-title">{q.text}</h4>
                      </div>
                      
                      <div className="q-admin-actions">
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => openEditModal(q)} 
                          title="Edit question"
                          style={{ padding: '6px' }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost text-error" 
                          onClick={() => handleDeleteQuestion(q.id)} 
                          title="Delete question"
                          style={{ padding: '6px', color: 'var(--error)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Show options if choice/checkboxes */}
                    {(q.type === 'choice' || q.type === 'checkboxes') && q.options && (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Options:</div>
                        <div className="q-options-container">
                          {q.options.map(opt => (
                            <span key={opt} className="q-option-pill">{opt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                <ClipboardList size={40} color="var(--text-tertiary)" />
                <h3>No questions configured</h3>
                <p>Add some onboarding questions to display to new customers.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customer Responses */}
        {activeTab === 'submissions' && (
          <div className="table-container animate-fade-in">
            <div className="table-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div className="table-header-left">
                <h3 className="table-title">Filled Questionnaire Submissions</h3>
                <span className="table-count">
                  {searchQuery.trim() ? `${filteredSubmissions.length} of ` : ''}{submissions.length} submissions
                </span>
              </div>
              {submissions.length > 0 && (
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px', height: '36px', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>
            
            {submissions.length > 0 ? (
              filteredSubmissions.length > 0 ? (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-secondary)', textAlign: 'left' }}>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>Customer</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>Email</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>Member ID</th>
                        <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>Submitted At</th>
                        <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((sub) => (
                        <tr 
                          key={sub.id} 
                          style={{ borderBottom: '1px solid var(--border-primary)', cursor: 'pointer' }}
                          onClick={() => openSubModal(sub)}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '16px', fontWeight: 600, color: 'white' }}>{sub.memberName}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{sub.email}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                            <span className="q-admin-badge badge-type">{sub.memberId}</span>
                          </td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                            {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <button 
                              className="btn btn-sm btn-ghost" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openSubModal(sub);
                              }}
                            >
                              <Eye size={14} /> View Form
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                  <Search size={40} color="var(--text-tertiary)" />
                  <h3>No results match your search</h3>
                  <p>Try searching for a different customer name, email, or member ID.</p>
                </div>
              )
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                <FileText size={40} color="var(--text-tertiary)" />
                <h3>No submissions found</h3>
                <p>New customers who fill out the questionnaire will be listed here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT QUESTION */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsQuestionModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleQuestionSubmit}>
              {editingQuestion ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleQuestionSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="text">Question Text</label>
            <input
              id="text"
              type="text"
              value={questionForm.text}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
              placeholder="e.g. Do you require a personal trainer?"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="section">Section Category</label>
              <select
                id="section"
                value={questionForm.section}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, section: e.target.value }))}
              >
                {STANDARD_SECTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Input Type</label>
              <select
                id="type"
                value={questionForm.type}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value }))}
              >
                {QUESTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Show comma-separated options text if select/checkbox types */}
          {(questionForm.type === 'choice' || questionForm.type === 'checkboxes') && (
            <div className="form-group">
              <label htmlFor="optionsText">Options (Comma separated list)</label>
              <input
                id="optionsText"
                type="text"
                value={questionForm.optionsText}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, optionsText: e.target.value }))}
                placeholder="e.g. Option A, Option B, Option C"
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <input
              id="required"
              type="checkbox"
              checked={questionForm.required}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, required: e.target.checked }))}
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="required" style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              This question is required
            </label>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: VIEW CUSTOMER SUBMISSION */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={`Onboarding Form: ${selectedSubmission?.memberName || ''}`}
        footer={
          <button className="btn btn-secondary" onClick={() => setIsSubModalOpen(false)}>Close View</button>
        }
      >
        {selectedSubmission && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
            {/* Header info */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-primary)', 
              borderRadius: 'var(--border-radius-md)', 
              padding: '16px', 
              marginBottom: '24px', 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Name</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{selectedSubmission.memberName}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{selectedSubmission.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Member ID Reference</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{selectedSubmission.memberId}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Submission Date</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                  {new Date(selectedSubmission.submittedAt).toLocaleDateString()} {new Date(selectedSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Questions & Answers listed by section */}
            {STANDARD_SECTIONS.map((section) => {
              // Get questions in this section
              const sectionQuestions = questions.filter(q => q.section === section);
              if (sectionQuestions.length === 0) return null;

              return (
                <div key={section} style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: 'var(--accent-primary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px', 
                    borderBottom: '1px solid var(--border-primary)', 
                    paddingBottom: '6px', 
                    marginBottom: '12px' 
                  }}>
                    {section}
                  </div>

                  {sectionQuestions.map((q) => {
                    const answer = selectedSubmission.answers[q.id];
                    let displayAnswer = answer;

                    if (q.type === 'checkboxes') {
                      displayAnswer = Array.isArray(answer) && answer.length > 0 
                        ? answer.join(', ') 
                        : '(None Selected)';
                    } else if (!answer || String(answer).trim() === '') {
                      displayAnswer = '(Not Answered)';
                    }

                    return (
                      <div key={q.id} style={{ marginBottom: '14px', paddingLeft: '4px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.4 }}>
                          {q.text}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: (displayAnswer === '(Not Answered)' || displayAnswer === '(None Selected)') 
                            ? 'var(--text-tertiary)' 
                            : 'var(--success)', 
                          fontWeight: 500,
                          paddingLeft: '8px',
                          borderLeft: '2px solid var(--border-secondary)'
                        }}>
                          {displayAnswer}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}
