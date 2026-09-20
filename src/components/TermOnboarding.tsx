import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
  Edit2,
  FolderCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ClassifiedSubjectGroup } from '../types.ts';
import { safeParseJson } from '../utils.ts';

interface FileQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'ready' | 'processing' | 'error';
  errorMessage?: string;
}

interface TermOnboardingProps {
  onComplete: () => void;
}

type OnboardingStage = 'input' | 'summary' | 'processing' | 'verification' | 'ready';

export const TermOnboarding: React.FC<TermOnboardingProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<OnboardingStage>('input');
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Term End Date setup (Default to ~90 days in the future)
  const defaultEndDate = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const [termEndDate, setTermEndDate] = useState<string>(defaultEndDate);

  // Daily Study Target
  const [selectedTargetOption, setSelectedTargetOption] = useState<number>(120); // 120 minutes default (2 hrs)
  const [customTargetMinutes, setCustomTargetMinutes] = useState<number>(90);
  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(false);

  // Processing state & steps
  const [processingStepIndex, setProcessingStepIndex] = useState<number>(0);
  const [processingStatusText, setProcessingStatusText] = useState<string>('Uploading school notes...');
  const [classifiedGroups, setClassifiedGroups] = useState<ClassifiedSubjectGroup[]>([]);
  const [summaryCounts, setSummaryCounts] = useState<{
    subjectsCount: number;
    topicsCount: number;
    conceptsCount: number;
    documentsCount: number;
  } | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const effectiveTargetMinutes = isCustomTarget ? customTargetMinutes : selectedTargetOption;

  // File handle helpers
  const handleFileSelection = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: FileQueueItem[] = fileArray.map((f) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      file: f,
      name: f.name,
      size: f.size,
      status: 'ready',
    }));
    setFileQueue((prev) => [...prev, ...newItems]);
    setErrorNotice(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Step 1 -> Summary Stage
  const handleProceedToSummary = () => {
    if (fileQueue.length === 0) {
      setErrorNotice('Please upload at least one school document or notes PDF to build your term.');
      return;
    }
    if (!termEndDate) {
      setErrorNotice('Please select your term end date.');
      return;
    }
    setErrorNotice(null);
    setStage('summary');
  };

  // Step 2 -> Processing (Send files to backend for AI classification)
  const handleConfirmAndProcess = async () => {
    setStage('processing');
    setProcessingStepIndex(0);
    setProcessingStatusText('Uploading school material...');
    setErrorNotice(null);

    const formData = new FormData();
    fileQueue.forEach((item) => {
      formData.append('files', item.file);
    });

    try {
      setProcessingStepIndex(1);
      setProcessingStatusText('Reading notes & extracting document structure...');

      // Call classification batch API
      const res = await fetch('/api/onboarding/classify-batch', {
        method: 'POST',
        body: formData,
      });

      const data = await safeParseJson(res);
      setClassifiedGroups(data.groups || []);

      setProcessingStepIndex(2);
      setProcessingStatusText('Identifying academic subjects & grouping notes...');

      // Short delay for natural transition
      setTimeout(() => {
        setStage('verification');
      }, 800);
    } catch (err: any) {
      console.error('Classification error:', err);
      setErrorNotice(err.message || 'An error occurred while processing your files. Please try again.');
      setStage('input');
    }
  };

  // Step 3 -> Verification -> Build Curriculum
  const handleSubjectNameChange = (groupIndex: number, newName: string) => {
    setClassifiedGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex] = { ...copy[groupIndex], subjectName: newName };
      return copy;
    });
  };

  const handleRemoveFileFromGroup = (groupIndex: number, fileId: string) => {
    setClassifiedGroups((prev) => {
      const copy = [...prev];
      const targetGroup = copy[groupIndex];
      const updatedFiles = targetGroup.files.filter((f) => f.id !== fileId);

      if (updatedFiles.length === 0) {
        // Remove empty group
        return copy.filter((_, idx) => idx !== groupIndex);
      } else {
        copy[groupIndex] = { ...targetGroup, files: updatedFiles };
        return copy;
      }
    });
  };

  const handleFinalizeBuild = async () => {
    setStage('processing');
    setProcessingStepIndex(3);
    setProcessingStatusText('Building Curriculum: Topics → Subtopics → Concepts...');

    try {
      const res = await fetch('/api/onboarding/confirm-and-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: classifiedGroups,
          termEndDate,
          targetStudyMinutesPerDay: effectiveTargetMinutes,
        }),
      });

      const data = await safeParseJson(res);
      setSummaryCounts(data.summary);

      setProcessingStepIndex(4);
      setProcessingStatusText('Generating adaptive study plan & spaced review queue...');

      setTimeout(() => {
        setStage('ready');
      }, 1000);
    } catch (err: any) {
      console.error('Curriculum build error:', err);
      setErrorNotice(err.message || 'Failed to complete term setup.');
      setStage('verification');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hrs = mins / 60;
    return hrs % 1 === 0 ? `${hrs} hour${hrs > 1 ? 's' : ''}` : `${hrs.toFixed(1)} hours`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 border-b border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Academic Term Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Set up your term
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Upload your school notes. We'll organize them into subjects and build your adaptive study plan.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Global Error Banner */}
        {errorNotice && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Notice: </span>
              {errorNotice}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10">
          {/* STAGE 1: INPUT FORM */}
          {stage === 'input' && (
            <div className="space-y-8">
              {/* File Upload Dropzone */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Upload your school material
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
                  />
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-base font-semibold text-slate-800">
                    Drop your files here
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    PDF and text note files supported. Select multiple files at once.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium shadow-xs hover:bg-indigo-700 transition-colors">
                      Choose files
                    </span>
                  </div>
                </div>

                {/* File Queue List */}
                {fileQueue.length > 0 && (
                  <div className="mt-6 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                      <span>Selected Files ({fileQueue.length})</span>
                      <button
                        onClick={() => setFileQueue([])}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {fileQueue.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{item.name}</p>
                              <p className="text-xs text-slate-400">{formatFileSize(item.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Term End Date Picker */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  When does your term end?
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  This date is critical because the planner needs to know how much time remains to cover and master the curriculum.
                </p>
                <div className="relative max-w-xs">
                  <input
                    type="date"
                    value={termEndDate}
                    onChange={(e) => setTermEndDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Flexible Daily Study Target */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-slate-800">
                    How much time do you want to study each day?
                  </label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Daily target — flexible
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                  This is your target, not a strict requirement. The plan will adapt when your available time or progress changes.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: '1 hour', mins: 60 },
                    { label: '1.5 hours', mins: 90 },
                    { label: '2 hours', mins: 120 },
                    { label: '3 hours', mins: 180 },
                  ].map((opt) => (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => {
                        setSelectedTargetOption(opt.mins);
                        setIsCustomTarget(false);
                      }}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        !isCustomTarget && selectedTargetOption === opt.mins
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsCustomTarget(true)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      isCustomTarget
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {isCustomTarget && (
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={15}
                      max={600}
                      value={customTargetMinutes}
                      onChange={(e) => setCustomTargetMinutes(parseInt(e.target.value) || 30)}
                      className="w-28 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800"
                    />
                    <span className="text-xs text-slate-500">minutes per day</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleProceedToSummary}
                  disabled={fileQueue.length === 0}
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Build my term</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: CONFIRMATION SUMMARY CARD */}
          {stage === 'summary' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  YOUR TERM
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500">Files</div>
                    <div className="text-base font-bold text-slate-900">{fileQueue.length} files uploaded</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Term ends</div>
                    <div className="text-base font-bold text-slate-900">{termEndDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Daily study target</div>
                    <div className="text-base font-bold text-indigo-700">{formatMinutes(effectiveTargetMinutes)}</div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">We'll automatically:</div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Organize your files into academic subjects</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Build Topics → Subtopics → Concepts hierarchy</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Connect every concept directly to your source notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Build an initial study schedule toward full term mastery</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Schedule future spaced repetition reviews</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Adapt the plan dynamically as you learn</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStage('input')}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndProcess}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Confirm and build</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: LIVE MULTI-STAGE PROCESSING */}
          {stage === 'processing' && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Organizing your school material...
                </h3>
                <p className="text-sm text-slate-500 font-medium">{processingStatusText}</p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="max-w-md mx-auto text-left space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 text-sm">
                  {processingStepIndex > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={processingStepIndex >= 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    Uploaded {fileQueue.length} files
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {processingStepIndex > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : processingStepIndex === 1 ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={processingStepIndex >= 1 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    Reading notes & extracting document structure
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {processingStepIndex > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : processingStepIndex === 2 ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={processingStepIndex >= 2 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    Identifying subjects & grouping notes
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {processingStepIndex > 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : processingStepIndex === 3 ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={processingStepIndex >= 3 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    Building curriculum hierarchy (Topics → Concepts)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {processingStepIndex > 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : processingStepIndex === 4 ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={processingStepIndex >= 4 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    Preparing adaptive study plan & reviews
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: LIGHTWEIGHT VERIFICATION SCREEN */}
          {stage === 'verification' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Subjects Identified
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  We organized your documents into subjects. You can rename a subject or remove a document if needed before final building.
                </p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {classifiedGroups.map((group, grpIdx) => (
                  <div
                    key={grpIdx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FolderCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                        <input
                          type="text"
                          value={group.subjectName}
                          onChange={(e) => handleSubjectNameChange(grpIdx, e.target.value)}
                          className="font-bold text-slate-900 text-sm sm:text-base bg-white border border-slate-300 rounded px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {group.files.length} document{group.files.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-7">
                      {group.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between text-xs p-2 rounded bg-white border border-slate-200 text-slate-700"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">{file.filename}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFileFromGroup(grpIdx, file.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-2"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleFinalizeBuild}
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Build my curriculum & study plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: READY & COMPLETION TRANSITION */}
          {stage === 'ready' && summaryCounts && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Your curriculum is ready
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Your academic notes have been transformed into a structured mastery system.
                </p>
              </div>

              {/* Real Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto py-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xl font-bold text-slate-900">{summaryCounts.subjectsCount}</div>
                  <div className="text-xs text-slate-500">Subjects</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xl font-bold text-slate-900">{summaryCounts.topicsCount}</div>
                  <div className="text-xs text-slate-500">Topics</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xl font-bold text-slate-900">{summaryCounts.conceptsCount}</div>
                  <div className="text-xs text-slate-500">Concepts</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xl font-bold text-indigo-700">{formatMinutes(effectiveTargetMinutes)}</div>
                  <div className="text-xs text-slate-500">Daily Target</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Today's Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
