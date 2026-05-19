import dynamic from 'next/dynamic';

const EditorWithNoSSR = dynamic(
  () => import('@/components/editor/EditorWrapper'),
  { ssr: false }
);

export default function Home() {
  return <EditorWithNoSSR />;
}
