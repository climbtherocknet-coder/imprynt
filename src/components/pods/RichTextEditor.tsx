'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  padding: '0.375rem 0.5rem',
  backgroundColor: 'var(--surface, #161c28)',
  border: '1px solid var(--border-light, #283042)',
  borderBottom: 'none',
  borderRadius: '0.5rem 0.5rem 0 0',
  flexWrap: 'wrap',
};

const btnBase: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  backgroundColor: 'transparent',
  border: '1px solid transparent',
  borderRadius: '0.25rem',
  fontSize: '0.8125rem',
  color: 'var(--text-mid, #a8adb8)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1,
  transition: 'border-color 0.1s, color 0.1s',
};

const btnActive: React.CSSProperties = {
  borderColor: 'var(--border-light, #283042)',
  color: 'var(--accent, #e8a849)',
  backgroundColor: 'var(--surface, #161c28)',
};

function ToolbarButton({
  label,
  title,
  active,
  onClick,
  extraStyle,
}: {
  label: string;
  title: string;
  active: boolean;
  onClick: () => void;
  extraStyle?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
      style={{
        ...btnBase,
        ...(active ? btnActive : {}),
        ...extraStyle,
      }}
    >
      {label}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: {
          keepMarks: true,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rte-content',
        'data-placeholder': placeholder || 'Write your content...',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // TipTap returns <p></p> for empty content
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Sync external value changes (e.g., loading from API)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalizedCurrent = current === '<p></p>' ? '' : current;
    if (value !== normalizedCurrent) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('URL', previous);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      <div style={toolbarStyle}>
        <ToolbarButton
          label="B"
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          extraStyle={{ fontWeight: 700 }}
        />
        <ToolbarButton
          label="I"
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          extraStyle={{ fontStyle: 'italic' }}
        />
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-light, #283042)', alignSelf: 'center', margin: '0 0.125rem' }} />
        <ToolbarButton
          label={'\u2022'}
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1."
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          extraStyle={{ fontSize: '0.75rem' }}
        />
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-light, #283042)', alignSelf: 'center', margin: '0 0.125rem' }} />
        <ToolbarButton
          label={'\uD83D\uDD17'}
          title="Link"
          active={editor.isActive('link')}
          onClick={setLink}
          extraStyle={{ fontSize: '0.75rem' }}
        />
      </div>
      <div
        style={{
          border: '1px solid var(--border-light, #283042)',
          borderRadius: '0 0 0.5rem 0.5rem',
          backgroundColor: 'var(--bg, #0c1017)',
          minHeight: 100,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
