'use client';

import React, { useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/Input';
import { BookOpen, Plus, FileText, CheckCircle2, Layers, AlertCircle, Clock, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  useGetAgoraCurriculumSourcesQuery,
  useGetAgoraCurriculaQuery,
  useGetAgoraNerdcSubjectsQuery,
  useCreateAgoraCurriculumSourceMutation,
  useUploadAgoraCurriculumSourceMutation,
  useConsolidateAgoraCurriculumMutation,
  usePublishAgoraCurriculumMutation,
  AgoraCurriculumSource,
  AgoraCurriculum
} from '@/lib/store/api/agoraCurriculumApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyStateIcon } from '@/components/ui/EmptyStateIcon';

export default function SuperAdminCurriculumPage() {
  const [activeTab, setActiveTab] = useState<'consolidated' | 'sources'>('consolidated');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  // Fetch data
  const { data: sources, isLoading: isSourcesLoading } = useGetAgoraCurriculumSourcesQuery();
  const { data: curricula, isLoading: isCurriculaLoading } = useGetAgoraCurriculaQuery();
  const { data: subjects } = useGetAgoraNerdcSubjectsQuery();

  const [consolidateSources, { isLoading: isConsolidating }] = useConsolidateAgoraCurriculumMutation();
  const [publishCurriculum, { isLoading: isPublishing }] = usePublishAgoraCurriculumMutation();

  // Filters
  const filteredSources = sources?.filter(s =>
    s.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredCurricula = curricula?.filter(c =>
    c.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectSource = (id: string) => {
    setSelectedSourceIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConsolidate = async () => {
    if (selectedSourceIds.length === 0) return;

    // Group selected sources to make sure they are of same subject and grade
    const selected = sources?.filter(s => selectedSourceIds.includes(s.id));
    if (!selected || selected.length === 0) return;

    const firstSubjectId = selected[0].subjectId;
    const firstGradeLevel = selected[0].gradeLevel;

    const isMismatched = selected.some(s => s.subjectId !== firstSubjectId || s.gradeLevel !== firstGradeLevel);
    if (isMismatched) {
      toast.error('You can only consolidate sources for the same subject and grade level.');
      return;
    }

    try {
      await consolidateSources({
        subjectId: firstSubjectId,
        gradeLevel: firstGradeLevel,
        sourceIds: selectedSourceIds
      }).unwrap();
      toast.success('Consolidation started. A new draft curriculum will be created soon.');
      setSelectedSourceIds([]);
      setActiveTab('consolidated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to start consolidation');
    }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    try {
      await publishCurriculum({ id, data: { status: nextStatus } }).unwrap();
      toast.success(`Curriculum marked as ${nextStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update publication status');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PARSED': return <Badge variant="success" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Parsed</Badge>;
      case 'PENDING_PARSE': return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'FAILED': return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'PUBLISHED': return <Badge variant="success" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Published</Badge>;
      case 'DRAFT': return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute roles={['SUPER_ADMIN']}>
      <div className="w-full space-y-6">
        {/* Header */}
        <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2 font-heading" style={{ fontSize: 'var(--text-page-title)' }}>
              Curriculum Management
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-page-subtitle)' }}>
              Upload source materials and manage consolidated master curricula.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Source
            </Button>
          </div>
        </FadeInUp>

        {/* Tabs and Search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('consolidated')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors whitespace-nowrap`}
              style={{ 
                fontSize: 'var(--text-tiny)',
                borderBottom: activeTab === 'consolidated' ? '2px solid' : 'none',
                borderColor: activeTab === 'consolidated' ? 'var(--agora-blue)' : 'transparent',
                color: activeTab === 'consolidated' ? 'var(--agora-blue)' : 'inherit'
              }}
            >
              <Layers className="w-4 h-4" />
              Consolidated
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors whitespace-nowrap`}
              style={{ 
                fontSize: 'var(--text-tiny)',
                borderBottom: activeTab === 'sources' ? '2px solid' : 'none',
                borderColor: activeTab === 'sources' ? 'var(--agora-blue)' : 'transparent',
                color: activeTab === 'sources' ? 'var(--agora-blue)' : 'inherit'
              }}
            >
              <FileText className="w-4 h-4" />
              Sources
            </button>
          </div>
          <div className="w-full md:w-72 pb-2 md:pb-0">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search subject or grade..."
            />
          </div>
        </div>

        {/* Content */}
        <FadeInUp from={{ opacity: 0, y: 10 }} to={{ opacity: 1, y: 0 }} duration={0.2}>
          {activeTab === 'consolidated' && (
            <div className="space-y-4">
              {isCurriculaLoading ? (
                <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
              ) : filteredCurricula.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <EmptyStateIcon type="statistics" />
                    <h3 className="text-lg font-semibold mt-4 text-light-text-primary dark:text-dark-text-primary">No consolidated curricula</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2 max-w-sm">
                      Select parsed sources in the Sources tab and consolidate them to create master curricula.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setActiveTab('sources')}>
                      Go to Sources
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCurricula.map((curr: AgoraCurriculum) => (
                    <Card key={curr.id} className="transition-all border hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="font-heading" style={{ fontSize: 'var(--text-card-title)' }}>
                            {curr.subject?.name || 'Unknown Subject'}
                          </CardTitle>
                          {renderStatusBadge(curr.status)}
                        </div>
                        <p className="font-medium text-light-text-secondary" style={{ fontSize: 'var(--text-small)' }}>Grade: {curr.gradeLevel}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-light-text-muted mt-2 space-y-1" style={{ fontSize: 'var(--text-tiny)' }}>
                          <p>Version: v{curr.version}</p>
                          <p>Topics: {curr.topics?.length || 0}</p>
                          <p>Sources Merged: {curr.sourceIds?.length || 0}</p>
                          <p>Updated: {new Date(curr.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePublish(curr.id, curr.status)}
                            isLoading={isPublishing}
                          >
                            {curr.status === 'DRAFT' ? 'Publish' : 'Unpublish'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              {isSourcesLoading ? (
                <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
              ) : filteredSources.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <EmptyStateIcon type="document" />
                    <h3 className="text-lg font-semibold mt-4 text-light-text-primary dark:text-dark-text-primary">No sources found</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2 max-w-sm">
                      Upload curriculum documents to see them here, or try adjusting your search.
                    </p>
                    <Button variant="primary" className="mt-6" onClick={() => setIsUploadModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Source
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {selectedSourceIds.length > 0 && (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900/50">
                      <span className="font-medium text-blue-800 dark:text-blue-300" style={{ fontSize: 'var(--text-small)' }}>
                        {selectedSourceIds.length} source(s) selected
                      </span>
                      <Button variant="primary" size="sm" onClick={handleConsolidate} isLoading={isConsolidating}>
                        <Layers className="w-4 h-4 mr-2" />
                        Consolidate Selected
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSources.map((source: AgoraCurriculumSource) => (
                      <Card
                        key={source.id}
                        className={cn(
                          "transition-all cursor-pointer border-2",
                          selectedSourceIds.includes(source.id)
                            ? "border-blue-500 shadow-md"
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        )}
                        onClick={() => source.status === 'PARSED' && handleSelectSource(source.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="font-heading" style={{ fontSize: 'var(--text-card-title)' }}>
                              {source.subject?.name || 'Unknown Subject'}
                            </CardTitle>
                            {renderStatusBadge(source.status)}
                          </div>
                          <p className="font-medium text-light-text-secondary" style={{ fontSize: 'var(--text-small)' }}>Grade: {source.gradeLevel}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="text-light-text-muted mt-2 space-y-1" style={{ fontSize: 'var(--text-tiny)' }}>
                            <p>Type: {source.sourceType}</p>
                            {source.fileName && <p className="truncate" title={source.fileName}>File: {source.fileName}</p>}
                            <p>Added: {new Date(source.createdAt).toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </FadeInUp>
        {/* Upload Modal */}
        <UploadSourceModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          subjects={subjects || []}
        />
      </div>
    </ProtectedRoute>
  );
}

// Inline Upload Modal component to keep it grouped for now
function UploadSourceModal({
  isOpen,
  onClose,
  subjects
}: {
  isOpen: boolean;
  onClose: () => void;
  subjects: any[];
}) {
  const [subjectId, setSubjectId] = useState('');
  const [gradeLevel, setGradeLevel] = useState('SS_1');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadSource, { isLoading }] = useUploadAgoraCurriculumSourceMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !selectedFile) {
      toast.error('Subject and File are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('subjectId', subjectId);
      formData.append('gradeLevel', gradeLevel);
      formData.append('sourceType', 'FILE_UPLOAD');

      await uploadSource(formData).unwrap();

      toast.success('Source uploaded successfully and queued for parsing');
      onClose();
      // Reset form
      setSubjectId('');
      setGradeLevel('SS_1');
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload source');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Curriculum Source" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
            Subject *
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-[#1a1f2e] text-light-text-primary dark:text-dark-text-primary"
            required
          >
            <option value="">Select a subject...</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1 text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
            Grade Level *
          </label>
          <Input
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            placeholder="e.g. PRIMARY_1, JSS_1, SS_1"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
            Document (PDF/DOCX) *
          </label>
          <div
            className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FileText className="w-10 h-10 text-blue-500 mb-2" />
                <p className="font-medium break-all text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>{selectedFile.name}</p>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="mt-2 text-red-500">
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-light-text-muted dark:text-dark-text-muted mb-2" />
                <p className="text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>Click to select file</p>
                <p className="text-light-text-muted dark:text-dark-text-muted mt-1" style={{ fontSize: 'var(--text-tiny)' }}>PDF or DOCX</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>Upload Source</Button>
        </div>
      </form>
    </Modal>
  );
}
