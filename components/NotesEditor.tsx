'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  initialContent?: string;
  onSave?: (value: string) => Promise<void>;
}

export function NotesEditor({ initialContent = '', onSave }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'editor'
      }
    }
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editor || !onSave) return;
    setStatus('Saving…');
    await onSave(editor.getHTML());
    setStatus('Saved');
  }

  return (
    <form onSubmit={handleSubmit} className="notes">
      <EditorContent editor={editor} />
      {onSave && (
        <button type="submit" disabled={!editor}>
          Save notes
        </button>
      )}
      {status && <p role="status">{status}</p>}
      <style jsx>{`
        .notes {
          display: grid;
          gap: 1rem;
        }
        :global(.editor) {
          min-height: 160px;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          padding: 1rem;
          background: #fff;
        }
        button {
          border: none;
          border-radius: 999px;
          padding: 0.75rem 1rem;
          background: #111827;
          color: #fff;
          cursor: pointer;
          justify-self: flex-start;
        }
      `}</style>
    </form>
  );
}
