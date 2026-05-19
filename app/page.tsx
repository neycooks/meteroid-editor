'use client';

import { EditorProvider } from '@/context/EditorContext';
import Editor from '@/components/editor';

export default function Home() {
  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  );
}
