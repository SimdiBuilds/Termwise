import React, { useState } from 'react';
import {
  Subject,
  Topic,
  Concept,
  ConceptMastery,
  SourceDocument,
} from '../types.ts';
import {
  Upload,
  FileText,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FileUp,
  Clock,
  Layers,
  GraduationCap,
  X,
  Trash2,
  AlertCircle,
  Plus,
  FolderPlus,
  Filter,
  FolderTree,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { MathMarkdown } from './MathMarkdown.tsx';

interface CurriculumViewProps {
  subjects: Subject[];
  topics: Topic[];
  concepts: (Concept & { mastery?: ConceptMastery })[];
  documents: SourceDocument[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onStartLearn: (conceptId: string) => void;
  onImportText: (subjectId: string, subjectName: string, text: string, title: string) => Promise<void>;
  onUploadPdf: (file: File, subjectId: string, subjectName: string) => Promise<void>;
  onResetSeed: () => Promise<void>;
  onDeleteSubject?: (subjectId: string) => Promise<void>;
  onDeleteTopic?: (topicId: string) => Promise<void>;
  onDeleteConcept?: (conceptId: string) => Promise<void>;
  onDeleteDocument?: (documentId: string) => Promise<void>;
  onClearAll?: () => Promise<void>;
  onAddSubject?: (name: string, description?: string) => Promise<void>;
  isLoading: boolean;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  subjects,
  topics,
  concepts,
  documents,
  selectedSubjectId,
  onSelectSubject,
  onStartLearn,
  onImportText,
  onUploadPdf,
  onResetSeed,
  onDeleteSubject,
  onDeleteTopic,
  onDeleteConcept,
  onDeleteDocument,
  onClearAll,
  onAddSubject,
  isLoading,
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [importMode, setImportMode] = useState<'PDF' | 'TEXT'>('PDF');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [targetSubjectName, setTargetSubjectName] = useState('');
  const [newSubNameInput, setNewSubNameInput] = useState('');
  const [newSubDescInput, setNewSubDescInput] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('ALL');

  // Modal confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const triggerConfirm = (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => Promise<void>;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel || 'Delete',
      variant: opts.variant || 'danger',
      onConfirm: opts.onConfirm,
    });
  };

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectTopics = activeSubject ? topics.filter((t) => t.subjectId === activeSubject.id) : [];
  const subjectConcepts = activeSubject ? concepts.filter((c) => c.subjectId === activeSubject.id) : [];
  const subjectDocs = activeSubject ? documents.filter((d) => d.subjectId === activeSubject.id) : [];

  // Filter topics based on topic filter
  const filteredTopics = subjectTopics.filter((topic) => {
    if (selectedTopicFilter !== 'ALL' && topic.id !== selectedTopicFilter) {
      return false;
    }
    return true;
  });

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const chosenSubjectName = targetSubjectName.trim() || activeSubject?.name || '';
      if (importMode === 'PDF') {
        if (!pdfFile) {
          throw new Error('Please select a PDF file first.');
        }
        await onUploadPdf(pdfFile, activeSubject?.id || '', chosenSubjectName);
        setSuccessMessage(`Successfully ingested "${pdfFile.name}"${chosenSubjectName ? ` into ${chosenSubjectName}` : ''}!`);
      } else {
        if (!pastedText.trim()) {
          throw new Error('Please enter or paste your notes text.');
        }
        const effectiveSubject = chosenSubjectName || 'Coursework Notes';
        await onImportText(
          activeSubject?.id || '',
          effectiveSubject,
          pastedText,
          docTitle || `${effectiveSubject} Syllabus Notes`
        );
        setSuccessMessage(`Successfully ingested notes into ${effectiveSubject}!`);
      }
      setShowImportModal(false);
      setPdfFile(null);
      setPastedText('');
      setTargetSubjectName('');
      setDocTitle('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to process document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubNameInput.trim()) return;
    try {
      if (onAddSubject) {
        await onAddSubject(newSubNameInput.trim(), newSubDescInput.trim());
      }
      setShowAddSubjectModal(false);
      setNewSubNameInput('');
      setNewSubDescInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create subject.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setPdfFile(file);
        setImportMode('PDF');
        setShowImportModal(true);
      }
    }
  };

  const getMasteryBadge = (mastery?: ConceptMastery) => {
    const score = mastery?.score || 0;
    const status = mastery?.status || 'UNLEARNED';

    if (status === 'MASTERED') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Mastered ({score}%)
        </span>
      );
    }
    if (status === 'DEVELOPING') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
          Developing ({score}%)
        </span>
      );
    }
    if (status === 'LEARNING') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
          Learning ({score}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        Unlearned
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            School Material Grounding
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Curriculum & Source Notes
          </h1>
          <p className="text-sm text-slate-600">
            Upload your syllabus or lecture notes. Topics, definitions, formulas, and tests will be extracted automatically.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          <button
            onClick={() => {
              setTargetSubjectName(activeSubject?.name || '');
              setShowImportModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Notes / PDF</span>
          </button>

          <button
            onClick={() => setShowAddSubjectModal(true)}
            title="Create a new Subject folder"
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>New Subject</span>
          </button>

          {onClearAll && subjects.length > 0 && (
            <button
              onClick={() => {
                triggerConfirm({
                  title: 'Clear All Curriculum Data?',
                  message: 'This will remove all subjects, topics, concepts, uploaded school notes, and test records. You will have a clean slate.',
                  confirmLabel: 'Clear Everything',
                  variant: 'danger',
                  onConfirm: async () => {
                    await onClearAll();
                  },
                });
              }}
              title="Clear all curriculum data for a clean slate"
              className="p-2 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              triggerConfirm({
                title: 'Restore Default Syllabus?',
                message: 'This will reset the curriculum back to the sample coursework and default notes.',
                confirmLabel: 'Reset Syllabus',
                variant: 'warning',
                onConfirm: async () => {
                  await onResetSeed();
                },
              });
            }}
            title="Restore default sample curriculum"
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State: Clean Slate */}
      {subjects.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleFileDrop}
          className={`bg-white border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center space-y-6 transition-all ${
            dragActive ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]' : 'border-slate-300'
          }`}
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Your Curriculum is Clean & Ready
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload any PDF syllabus, lecture notes, or past questions to automatically generate your personalized curriculum, active recall queue, and practice tests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setTargetSubjectName('');
                setImportMode('PDF');
                setShowImportModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload Syllabus / Notes PDF</span>
            </button>

            <button
              onClick={() => {
                setTargetSubjectName('');
                setImportMode('TEXT');
                setShowImportModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Paste Notes Directly</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Drag and drop any .pdf file here to begin
          </p>
        </div>
      ) : (
        <>
          {/* Subject Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            {subjects.map((sub) => {
              const isSelected = sub.id === activeSubject?.id;
              const count = concepts.filter((c) => c.subjectId === sub.id).length;
              return (
                <div key={sub.id} className="relative group flex items-center shrink-0">
                  <button
                    onClick={() => onSelectSubject(sub.id)}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold shadow-xs'
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.2 rounded-full ${
                        isSelected ? 'bg-indigo-200/70 text-indigo-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                  {onDeleteSubject && subjects.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerConfirm({
                          title: `Delete Subject "${sub.name}"?`,
                          message: `Are you sure you want to delete "${sub.name}"? All topics, concepts, documents, and flashcards in this subject will be permanently removed.`,
                          confirmLabel: 'Delete Subject',
                          onConfirm: async () => {
                            await onDeleteSubject(sub.id);
                          },
                        });
                      }}
                      title={`Delete ${sub.name}`}
                      className="ml-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg flex items-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          {/* Subject Summary & Notes Grounding Card */}
          {activeSubject && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-base">
                      {activeSubject.name} {activeSubject.code ? `(${activeSubject.code})` : ''}
                    </span>
                    {onDeleteSubject && (
                      <button
                        onClick={() => {
                          triggerConfirm({
                            title: `Delete Subject "${activeSubject.name}"?`,
                            message: `Are you sure you want to delete "${activeSubject.name}"? All topics, concepts, uploaded school documents, and study records for this subject will be permanently removed.`,
                            confirmLabel: 'Delete Subject',
                            onConfirm: async () => {
                              await onDeleteSubject(activeSubject.id);
                            },
                          });
                        }}
                        title={`Delete ${activeSubject.name}`}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{activeSubject.description}</p>
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center space-x-3 shrink-0">
                  <span className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{subjectTopics.length} Topics</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{subjectDocs.length} School Documents</span>
                  </span>
                </div>
              </div>

              {/* Uploaded Documents List with Individual Delete Buttons */}
              {subjectDocs.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span>Source Notes & Documents ({subjectDocs.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjectDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-medium truncate max-w-[200px]" title={doc.title}>
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                        {onDeleteDocument && (
                          <button
                            onClick={() => {
                              triggerConfirm({
                                title: `Delete Document "${doc.title}"?`,
                                message: `Are you sure you want to delete "${doc.title}" from this subject?`,
                                confirmLabel: 'Delete Document',
                                onConfirm: async () => {
                                  await onDeleteDocument(doc.id);
                                },
                              });
                            }}
                            title="Delete this document"
                            className="text-slate-400 hover:text-rose-600 p-0.5 hover:bg-rose-50 rounded transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topic Filter & Quick-Jump Toolbar */}
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-slate-200">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              Filter Topics:
            </span>
            <button
              onClick={() => setSelectedTopicFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedTopicFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Topics ({subjectTopics.length})
            </button>
            {subjectTopics.map((top, idx) => (
              <button
                key={top.id}
                onClick={() => setSelectedTopicFilter(top.id)}
                title={top.title}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-colors ${
                  selectedTopicFilter === top.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Topic {idx + 1}
              </button>
            ))}
          </div>

          {/* Topics & Concepts Hierarchy (4-Tier: Subject -> Topic -> Subtopic -> Concept) */}
          {filteredTopics.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
              <p className="text-sm font-medium text-slate-700">
                {selectedTopicFilter !== 'ALL'
                  ? 'No topics found for this filter.'
                  : `No topics extracted for ${activeSubject?.name} yet.`}
              </p>
              {selectedTopicFilter !== 'ALL' ? (
                <button
                  onClick={() => setSelectedTopicFilter('ALL')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Show All Topics
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTargetSubjectName(activeSubject?.name || '');
                    setShowImportModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Upload Notes or PDF for this subject
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTopics.map((topic, topicIdx) => {
                const topicConcepts = subjectConcepts.filter((c) => c.topicId === topic.id);

                // Group concepts by Subtopic (Tier 3)
                const subtopicMap = new Map<string, typeof topicConcepts>();
                for (const concept of topicConcepts) {
                  const subTitle = concept.subtopicTitle?.trim() || 'Core Mathematical Principles';
                  if (!subtopicMap.has(subTitle)) {
                    subtopicMap.set(subTitle, []);
                  }
                  subtopicMap.get(subTitle)!.push(concept);
                }

                const subtopicGroups = Array.from(subtopicMap.entries()).map(([title, groupConcepts]) => ({
                  title,
                  concepts: groupConcepts.sort((a, b) => a.order - b.order),
                }));

                return (
                  <div
                    key={topic.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
                  >
                    {/* Topic Header (Tier 2) */}
                    <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 text-indigo-800">
                              TOPIC {topic.order || topicIdx + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                              <MathMarkdown content={topic.title} inline />
                            </h3>
                          </div>
                          {topic.description && (
                            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              <MathMarkdown content={topic.description} />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 shrink-0">
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md">
                            {subtopicGroups.length} Subtopics
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-semibold text-indigo-700">
                            {topicConcepts.length} Concepts
                          </span>
                          {onDeleteTopic && (
                            <button
                              onClick={() => {
                                triggerConfirm({
                                  title: `Delete Topic "${topic.title}"?`,
                                  message: `Are you sure you want to delete "${topic.title}"? All ${topicConcepts.length} concepts inside it will be permanently removed.`,
                                  confirmLabel: 'Delete Topic',
                                  onConfirm: async () => {
                                    await onDeleteTopic(topic.id);
                                  },
                                });
                              }}
                              title={`Delete Topic ${topic.title}`}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subtopics Hierarchy (Tier 3) */}
                    <div className="p-4 sm:p-5 space-y-5 bg-slate-50/40">
                      {subtopicGroups.map((group, groupIdx) => (
                        <div
                          key={groupIdx}
                          className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs"
                        >
                          {/* Subtopic Header */}
                          <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FolderTree className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Subtopic {groupIdx + 1}:
                              </span>
                              <h4 className="font-semibold text-slate-900 text-sm">
                                <MathMarkdown content={group.title} inline />
                              </h4>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {group.concepts.length} {group.concepts.length === 1 ? 'Concept' : 'Concepts'}
                            </span>
                          </div>

                          {/* Concepts in Subtopic (Tier 4) */}
                          <div className="divide-y divide-slate-100">
                            {group.concepts.map((concept, cIdx) => {
                              const isExpanded = expandedConceptId === concept.id;
                              const displayName = concept.name.startsWith('%PDF')
                                ? `${group.title} Concept ${cIdx + 1}`
                                : concept.name;

                              return (
                                <div
                                  key={concept.id}
                                  className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
                                >
                                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1 min-w-0">
                                      {/* Breadcrumb Path & Badges */}
                                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                        <span className="text-slate-600 font-medium">#{cIdx + 1}</span>
                                        <span>•</span>
                                        <span className="truncate max-w-[140px] text-slate-500">{topic.title}</span>
                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                        <span className="truncate max-w-[180px] text-indigo-600 font-semibold">{group.title}</span>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="font-bold text-slate-900 text-base">
                                          <MathMarkdown content={displayName} inline />
                                        </h5>
                                        {getMasteryBadge(concept.mastery)}

                                        {/* Prerequisites where known */}
                                        {concept.prerequisiteNames && concept.prerequisiteNames.length > 0 && (
                                          <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                            <Bookmark className="w-3 h-3 text-amber-600" />
                                            <span>Prereq: {concept.prerequisiteNames.join(', ')}</span>
                                          </span>
                                        )}
                                      </div>

                                      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {concept.explanation.startsWith('%PDF') ? (
                                          <span>Curriculum concept derived from course notes.</span>
                                        ) : (
                                          <MathMarkdown content={concept.explanation} />
                                        )}
                                      </div>

                                      {/* Key formulas preview chip */}
                                      {concept.formulas && concept.formulas.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                            Formulas:
                                          </span>
                                          {concept.formulas.slice(0, 3).map((f, fIdx) => (
                                            <div
                                              key={fIdx}
                                              className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded text-xs font-mono font-medium"
                                            >
                                              <MathMarkdown content={f} inline />
                                            </div>
                                          ))}
                                          {concept.formulas.length > 3 && (
                                            <span className="text-xs text-slate-400 font-mono">
                                              +{concept.formulas.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 shrink-0 pt-1 lg:pt-0">
                                      <button
                                        onClick={() =>
                                          setExpandedConceptId(isExpanded ? null : concept.id)
                                        }
                                        className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                      >
                                        {isExpanded ? 'Hide Notes' : 'View Notes & Rules'}
                                      </button>

                                      <button
                                        onClick={() => onStartLearn(concept.id)}
                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
                                      >
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        <span>Study Concept</span>
                                      </button>

                                      {onDeleteConcept && (
                                        <button
                                          onClick={() => {
                                            triggerConfirm({
                                              title: `Delete Concept "${concept.name}"?`,
                                              message: `Are you sure you want to delete "${concept.name}"? This concept, its recall questions, and mastery records will be removed.`,
                                              confirmLabel: 'Delete Concept',
                                              onConfirm: async () => {
                                                await onDeleteConcept(concept.id);
                                              },
                                            });
                                          }}
                                          title="Delete concept"
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Detailed Notes Drawer: Definitions, Formulas, Examples, Key Facts */}
                                  {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/90 p-4 sm:p-5 rounded-xl space-y-4 text-xs sm:text-sm">
                                      {concept.definitions && concept.definitions.length > 0 && (
                                        <div>
                                          <div className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1.5 flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Formal Syllabus Definitions:</span>
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                                            {concept.definitions.map((def, idx) => (
                                              <li key={idx} className="leading-relaxed">
                                                <MathMarkdown content={def} inline />
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {concept.formulas && concept.formulas.length > 0 && (
                                        <div>
                                          <div className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1.5">
                                            Mathematical Formulas & Laws:
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {concept.formulas.map((formula, idx) => (
                                              <div
                                                key={idx}
                                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs shadow-2xs overflow-x-auto"
                                              >
                                                <MathMarkdown content={formula} />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {concept.keyFacts && concept.keyFacts.length > 0 && (
                                        <div>
                                          <div className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1.5">
                                            Important Examinable Facts:
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                                            {concept.keyFacts.map((fact, idx) => (
                                              <li key={idx} className="leading-relaxed">
                                                <MathMarkdown content={fact} inline />
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {concept.examples && concept.examples.length > 0 && (
                                        <div>
                                          <div className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1.5">
                                            Worked School Notes Examples:
                                          </div>
                                          <div className="space-y-2">
                                            {concept.examples.map((ex, exIdx) => (
                                              <div
                                                key={exIdx}
                                                className="text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed text-xs shadow-2xs overflow-x-auto"
                                              >
                                                <MathMarkdown content={ex} />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Upload & Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ingest School Notes & Syllabus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI reads formulas, theorems, and definitions directly from your document.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setImportMode('PDF')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    importMode === 'PDF'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload PDF Notes
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('TEXT')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    importMode === 'TEXT'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paste Notes / Syllabus
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject / Course Name <span className="text-slate-400 font-normal">(optional - auto-detected if empty)</span>
                </label>
                <input
                  type="text"
                  value={targetSubjectName}
                  onChange={(e) => setTargetSubjectName(e.target.value)}
                  placeholder="e.g. Biology, Chemistry, Modern History, Pure Mathematics"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-hidden"
                />
              </div>

              {importMode === 'PDF' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select PDF Document
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPdfFile(file);
                      if (file && !targetSubjectName.trim()) {
                        const cleanName = file.name
                          .replace(/\.[a-zA-Z0-9]+$/i, '')
                          .replace(/[-_]/g, ' ')
                          .split(' ')
                          .filter(Boolean)
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                          .join(' ');
                        setTargetSubjectName(cleanName);
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required
                  />
                  {pdfFile && (
                    <p className="text-xs text-indigo-700 mt-1.5 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selected: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Document / Chapter Title
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. First Term Syllabus & Formula Sheet"
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Notes Text
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste syllabus topics, theorems, formulas, or lecture notes..."
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2.5 font-mono focus:border-indigo-600 outline-hidden"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Extracting Syllabus via AI...</span>
                    </>
                  ) : (
                    <span>Ingest & Extract</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Subject</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={newSubNameInput}
                  onChange={(e) => setNewSubNameInput(e.target.value)}
                  placeholder="e.g. Biology, Modern History, Pure Mathematics"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newSubDescInput}
                  onChange={(e) => setNewSubDescInput(e.target.value)}
                  placeholder="e.g. Molecular Genetics & Evolution, or Organic Synthesis"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:border-indigo-600 outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        isLoading={isConfirmLoading}
        onConfirm={async () => {
          setIsConfirmLoading(true);
          try {
            await confirmModal.onConfirm();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          } catch (err: any) {
            console.error(err);
          } finally {
            setIsConfirmLoading(false);
          }
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
