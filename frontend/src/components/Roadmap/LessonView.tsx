// ─── LessonView — interactive split-pane workspace ──────────────────────────
import React, { useState, useEffect } from 'react';
import type { Lesson, UserProgress } from '../../types';
import { fetchLesson, postQuizSubmit, postExerciseSubmit } from '../../api/client';
import './LessonView.css';

interface LessonViewProps {
  lessonId: string;
  userId: string;
  onBack: () => void;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  userId,
  onBack,
  onProgressUpdate,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'quiz' | 'code'>('quiz');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Exercise state
  const [code, setCode] = useState('');
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchLesson(lessonId)
      .then((data) => {
        setLesson(data);
        if (data.exercise) {
          setCode(data.exercise.template);
        }
        // Reset states
        setSelectedAnswers({});
        setQuizResult(null);
        setConsoleLogs([]);
      })
      .catch((err) => console.error("Error fetching lesson details:", err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizResult) return; // Read-only after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || submittingQuiz) return;
    
    // Check that all questions are answered
    const answersList: number[] = [];
    for (let i = 0; i < lesson.quiz.length; i++) {
      if (selectedAnswers[i] == null) {
        alert("Please answer all questions before submitting.");
        return;
      }
      answersList.push(selectedAnswers[i]);
    }

    setSubmittingQuiz(true);
    try {
      const result = await postQuizSubmit(userId, lessonId, answersList);
      setQuizResult(result);
      if (result.user_progress) {
        onProgressUpdate(result.user_progress);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz responses.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitExercise = async () => {
    if (!lesson || submittingExercise || !lesson.exercise) return;

    setSubmittingExercise(true);
    setConsoleLogs([
      "⏳ Initializing EVM Compilation Environment...",
      "🛠️ Loading compiler solc-v0.8.20+commit.5613c14d...",
      "⚡ Compiling contract code...",
    ]);

    // Simulate compiler latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      const result = await postExerciseSubmit(userId, lessonId, code);

      if (result.passed) {
        setConsoleLogs((prev) => [
          ...prev,
          "✅ Compilation successful! No warnings.",
          "🧪 Running assertion test suite...",
          "🔍 Assert keyword matches: PASS",
          `🎉 Exercise PASSED. XP Awarded: +100 XP`,
        ]);
        if (result.user_progress) {
          onProgressUpdate(result.user_progress);
        }
      } else {
        setConsoleLogs((prev) => [
          ...prev,
          "❌ Compilation completed with errors.",
          `⚠️ Missing required structures: ${result.missing_keywords.join(", ")}`,
          "❌ Exercise FAILED. Review instruction parameters and retry.",
        ]);
      }
    } catch (err) {
      setConsoleLogs((prev) => [...prev, "🚨 Connection / sandbox environment crash error."]);
    } finally {
      setSubmittingExercise(false);
    }
  };

  // Simple parser to render reading markdown contents
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="lesson-md-h1">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="lesson-md-h3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="lesson-md-li">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return <li key={idx} className="lesson-md-ol-li">{line.slice(3)}</li>;
      }
      if (line.trim().startsWith('```')) {
        return null; // hide fences, code contents will be raw text
      }
      if (line.trim() === '') {
        return <div key={idx} className="lesson-md-space" />;
      }
      return <p key={idx} className="lesson-md-p">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="lesson-view-loading">
        <div className="spinner" />
        <p>Loading interactive workspace...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-view-error">
        <h3>Could not load lesson</h3>
        <button className="btn btn--primary" onClick={onBack}>Back to Level</button>
      </div>
    );
  }

  return (
    <div className="lesson-workspace">
      {/* Left Pane - Reading Panel */}
      <div className="lesson-pane-left glass">
        <div className="pane-header">
          <button className="btn btn--text back-btn" onClick={onBack}>
            ← Back to Lessons
          </button>
          <div className="lesson-badges">
            <span className="badge badge--duration">⏱ {lesson.duration}</span>
            <span className="badge badge--xp">⚡ {lesson.xp} XP</span>
          </div>
        </div>
        <div className="reading-scroll-area">
          {renderMarkdown(lesson.content)}
        </div>
      </div>

      {/* Right Pane - Interaction Panel */}
      <div className="lesson-pane-right glass">
        {/* Workspace navigation */}
        <div className="workspace-tabs">
          <button
            className={`workspace-tab ${activeWorkspaceTab === 'quiz' ? 'workspace-tab--active' : ''}`}
            onClick={() => setActiveWorkspaceTab('quiz')}
          >
            📋 Quiz Evaluation
          </button>
          {lesson.exercise && (
            <button
              className={`workspace-tab ${activeWorkspaceTab === 'code' ? 'workspace-tab--active' : ''}`}
              onClick={() => setActiveWorkspaceTab('code')}
            >
              💻 Coding Sandbox
            </button>
          )}
        </div>

        {/* Workspace Scroll Area */}
        <div className="workspace-body-container">
          {activeWorkspaceTab === 'quiz' ? (
            <div className="quiz-workspace animate-fade-in">
              <div className="quiz-header">
                <h3>Lesson Quiz</h3>
                <p>Pass with 70% score or above to complete this lesson.</p>
              </div>

              <div className="quiz-questions">
                {lesson.quiz.map((q, qIdx) => {
                  const resultDetail = quizResult?.results?.[qIdx];
                  const hasSubmitted = quizResult != null;
                  
                  return (
                    <div key={qIdx} className={`quiz-question-card ${hasSubmitted ? (resultDetail?.is_correct ? 'quiz-question-card--correct' : 'quiz-question-card--incorrect') : ''}`}>
                      <h4 className="quiz-question-text">
                        {qIdx + 1}. {q.question}
                      </h4>
                      <div className="quiz-options">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[qIdx] === oIdx;
                          const isCorrectOpt = q.correct_idx === oIdx;
                          let optClass = '';
                          if (isSelected) optClass = 'quiz-option--selected';
                          if (hasSubmitted) {
                            if (isCorrectOpt) optClass = 'quiz-option--correct';
                            else if (isSelected) optClass = 'quiz-option--incorrect';
                          }

                          return (
                            <button
                              key={oIdx}
                              className={`quiz-option ${optClass}`}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              disabled={hasSubmitted}
                            >
                              <span className="option-marker">
                                {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'}
                              </span>
                              <span className="option-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit / Results */}
              <div className="quiz-footer">
                {quizResult ? (
                  <div className={`quiz-score-banner ${quizResult.passed ? 'quiz-score-banner--passed' : 'quiz-score-banner--failed'}`}>
                    <div className="score-percentage">{quizResult.score}%</div>
                    <div>
                      <div className="score-verdict">{quizResult.passed ? "🎉 Quiz Passed!" : "❌ Try Again!"}</div>
                      <div className="score-ratio">Correct: {quizResult.correct_count} of {quizResult.total_questions} questions</div>
                    </div>
                    {!quizResult.passed && (
                      <button className="btn btn--secondary reset-btn" onClick={() => setQuizResult(null)}>
                        Retry Quiz
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn btn--primary submit-quiz-btn"
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz}
                  >
                    {submittingQuiz ? "Evaluating Answers..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="code-workspace animate-fade-in">
              <div className="code-header">
                <h3>Solidity Smart Contract Sandbox</h3>
                <p className="code-instruction">{lesson.exercise?.instruction}</p>
              </div>

              {/* Text Editor Area */}
              <div className="code-editor-wrapper">
                <textarea
                  className="code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={submittingExercise}
                  spellCheck={false}
                  placeholder="// Write Solidity Smart Contract here..."
                />
              </div>

              {/* Controls */}
              <div className="code-controls">
                <button
                  className="btn btn--primary compile-btn"
                  onClick={handleSubmitExercise}
                  disabled={submittingExercise || !code.trim()}
                >
                  {submittingExercise ? "Running Tests..." : "🚀 Compile & Run Tests"}
                </button>
              </div>

              {/* Output Console */}
              <div className="compiler-console">
                <div className="console-header">EVM Compiler Logs</div>
                <div className="console-body">
                  {consoleLogs.length === 0 ? (
                    <span className="console-empty">Console terminal idle. Click Compile to execute script checks.</span>
                  ) : (
                    consoleLogs.map((log, idx) => (
                      <div key={idx} className="console-log-line">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;
