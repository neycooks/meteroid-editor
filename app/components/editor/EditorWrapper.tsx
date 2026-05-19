'use client';

import { EditorProvider } from '@/context/EditorContext';
import Editor from '@/components/editor';

export default function EditorWrapper() {
  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  );
}
