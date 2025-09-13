import React from 'react';
import { Quiz } from '@/types/quiz';
import { NewVisualEditor } from './NewVisualEditor';

interface StageEditorProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onNavigateToTheme: () => void;
}

export function StageEditor({
  quiz,
  onUpdate,
  onSave,
  onPreview,
  onPublish,
  onNavigateToTheme
}: StageEditorProps) {
  return (
    <NewVisualEditor
      quiz={quiz}
      onUpdate={onUpdate}
      onSave={onSave}
      onPreview={onPreview}
      onPublish={onPublish}
      onNavigateToTheme={onNavigateToTheme}
    />
  );
}