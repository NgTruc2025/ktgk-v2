/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { StudentEntrance } from './components/StudentEntrance';
import { ExamRoom } from './components/ExamRoom';
import { SubmissionResultView } from './components/SubmissionResultView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { GoogleSheetsGuideModal } from './components/GoogleSheetsGuideModal';
import { ExamLockModal } from './components/ExamLockModal';
import { ExamConfig } from './types/exam';
import { apiClient } from './services/apiClient';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'exam' | 'result' | 'teacher'>('home');
  const [config, setConfig] = useState<ExamConfig>({
    academicYear: '2026-2027',
    schoolName: 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực',
    examTitle: 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027',
    subject: 'Tin học 11',
    durationMinutes: 45,
    isOpen: false,
    allowRetake: false,
    showScoreImmediately: true,
    showCorrectAnswersAfterSubmit: false,
    allowedGrades: [10, 11, 12],
    allowedExamCodes: ['101', '102', '103', '104']
  });

  // Modals state
  const [showStudentEntrance, setShowStudentEntrance] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);
  const [showSheetsGuide, setShowSheetsGuide] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);

  // Active exam session state
  const [activeAttemptId, setActiveAttemptId] = useState<string>('');
  const [activeStudentInfo, setActiveStudentInfo] = useState<{
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  } | null>(null);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [activeStartTime, setActiveStartTime] = useState<string>('');
  const [activeExpiresAt, setActiveExpiresAt] = useState<string>('');
  const [activeResumedState, setActiveResumedState] = useState<{
    mcqAnswers: any;
    tfAnswers: any;
    flaggedQuestionIds: string[];
    leaveTabCount: number;
  } | null>(null);

  // Result state after submission
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Fetch public configuration on load
  const loadPublicConfig = async () => {
    try {
      const data = await apiClient.getConfig();
      if (data) {
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch {
      // Quietly use default config if offline or loading fails
    }
  };

  useEffect(() => {
    loadPublicConfig();
  }, []);

  // Handler: Student starts exam
  const handleConfirmStartExam = async (studentData: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  }) => {
    const data = await apiClient.startExam(studentData);
    if (!data.success) {
      throw new Error(data.error || 'Không thể bắt đầu lượt thi.');
    }

    setActiveAttemptId(data.attemptId);
    setActiveStudentInfo(studentData);
    setActiveExam(data.exam);
    setActiveStartTime(data.startTime);
    setActiveExpiresAt(data.expiresAt);
    
    // Pass along resumed state if available
    setActiveResumedState({
      mcqAnswers: data.mcqAnswers || {},
      tfAnswers: data.tfAnswers || {},
      flaggedQuestionIds: data.flaggedQuestionIds || [],
      leaveTabCount: data.leaveTabCount || 0
    });

    setShowStudentEntrance(false);
    setCurrentView('exam');
  };

  // Handler: Student submits exam
  const handleSubmitExam = async (submissionData: {
    attemptId: string;
    examCode: string;
    mcqAnswers: { [qId: string]: 'A' | 'B' | 'C' | 'D' };
    tfAnswers: { [qId: string]: { [item: string]: boolean } };
    leaveTabCount: number;
  }) => {
    const data = await apiClient.submitExam(submissionData);
    if (!data.success) {
      throw new Error((data as any).error || 'Nộp bài thất bại.');
    }

    setSubmissionResult(data);
    setCurrentView('result');
  };

  // Navigation controller
  const handleNavigate = (view: 'home' | 'teacher') => {
    if (view === 'teacher') {
      if (isTeacherAuthenticated) {
        setCurrentView('teacher');
      } else {
        setShowTeacherLogin(true);
      }
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={config.isOpen}
        academicYear={config.academicYear}
        durationMinutes={config.durationMinutes}
        onOpenLockModal={() => setShowLockModal(true)}
      />

      {/* Main Body */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HomeView
            config={config}
            onStartExamClick={() => setShowStudentEntrance(true)}
            onTeacherLoginClick={() => setShowTeacherLogin(true)}
            onOpenSheetsGuide={() => setShowSheetsGuide(true)}
            onOpenLockModal={() => setShowLockModal(true)}
          />
        )}

        {currentView === 'exam' && activeStudentInfo && activeExam && (
          <ExamRoom
            attemptId={activeAttemptId}
            studentInfo={activeStudentInfo}
            exam={activeExam}
            startTime={activeStartTime}
            expiresAt={activeExpiresAt}
            resumedState={activeResumedState}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {currentView === 'result' && submissionResult && (
          <SubmissionResultView
            resultData={submissionResult}
            onReturnHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboard
            onLogout={() => {
              setIsTeacherAuthenticated(false);
              setCurrentView('home');
            }}
            onOpenSheetsGuide={() => setShowSheetsGuide(true)}
          />
        )}
      </main>

      {/* Modals */}
      <StudentEntrance
        isOpen={showStudentEntrance}
        onClose={() => setShowStudentEntrance(false)}
        onConfirmStart={handleConfirmStartExam}
        allowedExamCodes={config.allowedExamCodes || ['101', '102', '103', '104']}
      />

      <TeacherLoginModal
        isOpen={showTeacherLogin}
        onClose={() => setShowTeacherLogin(false)}
        onLoginSuccess={() => {
          setIsTeacherAuthenticated(true);
          setShowTeacherLogin(false);
          setCurrentView('teacher');
        }}
      />

      <ExamLockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        currentExamStatus={config.isOpen}
        onStatusChanged={(newStatus) => setConfig(prev => ({ ...prev, isOpen: newStatus }))}
      />

      <GoogleSheetsGuideModal
        isOpen={showSheetsGuide}
        onClose={() => setShowSheetsGuide(false)}
      />
    </div>
  );
}
