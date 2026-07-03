'use client';

import { useState, useMemo } from 'react';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, 
  HeartPulse, ShieldCheck, Dumbbell, CalendarRange, Contact 
} from 'lucide-react';

const SECTION_ICONS = {
  'Emergency Contact': Contact,
  'Health & Medical Readiness': HeartPulse,
  'Fitness Experience & Goals': Dumbbell,
  'Preferences & Availability': CalendarRange,
  'Liability Waiver': ShieldCheck
};

export default function QuestionnaireWizard({ user, questions, onSubmit }) {
  // Extract unique sections in the order they appear in questions
  const sections = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.section)));
  }, [questions]);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questions.forEach(q => {
      if (q.type === 'checkboxes') {
        initial[q.id] = [];
      } else {
        initial[q.id] = '';
      }
    });
    return initial;
  });

  const [errorMsg, setErrorMsg] = useState('');

  const currentSection = sections[currentStep];
  const currentQuestions = useMemo(() => {
    return questions.filter(q => q.section === currentSection);
  }, [questions, currentSection]);

  const progressPercentage = useMemo(() => {
    if (sections.length === 0) return 0;
    return Math.round(((currentStep + 1) / sections.length) * 100);
  }, [currentStep, sections]);

  const handleTextChange = (questionId, value) => {
    setErrorMsg('');
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleYesNoSelect = (questionId, value) => {
    setErrorMsg('');
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleChoiceSelect = (questionId, value) => {
    setErrorMsg('');
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxToggle = (questionId, option) => {
    setErrorMsg('');
    setAnswers(prev => {
      const currentVal = prev[questionId] || [];
      const updated = currentVal.includes(option)
        ? currentVal.filter(item => item !== option)
        : [...currentVal, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const validateCurrentStep = () => {
    for (const q of currentQuestions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (q.type === 'checkboxes') {
        if (!Array.isArray(val) || val.length === 0) {
          return `Please select at least one option for: "${q.text}"`;
        }
      } else {
        if (val === undefined || val === null || String(val).trim() === '') {
          return `Please answer the required question: "${q.text}"`;
        }
      }
    }
    return '';
  };

  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    if (currentStep < sections.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateCurrentStep();
    if (err) {
      setErrorMsg(err);
      return;
    }
    
    // Call the parent submit handler
    onSubmit(answers);
  };

  const SectionIcon = SECTION_ICONS[currentSection] || Contact;

  return (
    <div className="quest-wrapper">
      <div className="quest-card">
        {/* Progress header */}
        <div className="quest-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-muted)', borderRadius: 'var(--border-radius-full)', color: 'var(--accent-primary)', marginBottom: '16px' }}>
            <SectionIcon size={32} />
          </div>
          <h2>Welcome, {user?.name}!</h2>
          <p>Please complete this quick questionnaire to help us customize your experience.</p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
          <span>Step {currentStep + 1} of {sections.length}: {currentSection}</span>
          <span>{progressPercentage}% Completed</span>
        </div>
        <div className="quest-progress-container">
          <div className="quest-progress-bar" style={{ width: `${progressPercentage}%` }} />
        </div>

        {/* Form error warning */}
        {errorMsg && (
          <div className="login-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Questions rendering */}
        <form onSubmit={handleSubmit}>
          <div className="quest-section-title">{currentSection}</div>

          {currentQuestions.map((q) => {
            const val = answers[q.id];

            return (
              <div key={q.id} className="quest-field">
                <label className="quest-label">
                  {q.text}
                  {q.required && <span className="required">*</span>}
                </label>

                {/* Text Field */}
                {q.type === 'text' && (
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    required={q.required}
                  />
                )}

                {/* Yes / No Choices */}
                {q.type === 'yes_no' && (
                  <div className="quest-options-grid grid-2">
                    <div
                      className={`quest-option-card ${val === 'Yes' ? 'selected' : ''}`}
                      onClick={() => handleYesNoSelect(q.id, 'Yes')}
                    >
                      <div className="quest-option-dot">
                        <div className="quest-option-dot-inner" />
                      </div>
                      <span className="quest-option-label">Yes</span>
                    </div>
                    <div
                      className={`quest-option-card ${val === 'No' ? 'selected' : ''}`}
                      onClick={() => handleYesNoSelect(q.id, 'No')}
                    >
                      <div className="quest-option-dot">
                        <div className="quest-option-dot-inner" />
                      </div>
                      <span className="quest-option-label">No</span>
                    </div>
                  </div>
                )}

                {/* Single Choice Select */}
                {q.type === 'choice' && (
                  <div className="quest-options-grid">
                    {q.options.map((opt) => (
                      <div
                        key={opt}
                        className={`quest-option-card ${val === opt ? 'selected' : ''}`}
                        onClick={() => handleChoiceSelect(q.id, opt)}
                      >
                        <div className="quest-option-dot">
                          <div className="quest-option-dot-inner" />
                        </div>
                        <span className="quest-option-label">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Checkboxes Select */}
                {q.type === 'checkboxes' && (
                  <div className="quest-options-grid">
                    {q.options.map((opt) => {
                      const isSelected = Array.isArray(val) && val.includes(opt);
                      return (
                        <div
                          key={opt}
                          className={`quest-option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleCheckboxToggle(q.id, opt)}
                        >
                          <div className="quest-option-checkbox">
                            <div className="quest-option-checkbox-inner" />
                          </div>
                          <span className="quest-option-label">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Navigation Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-primary)'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
              style={{ visibility: currentStep === 0 ? 'hidden' : 'visible', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {currentStep < sections.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success)' }}
              >
                Submit & Continue <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
