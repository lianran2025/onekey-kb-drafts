'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

type Props = {
  html: string;
  onChange: (html: string) => void;
};

export function VisualHtmlEditor({ html, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: html || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'visual-rich-editor-content',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (html !== current) {
      editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
    }
  }, [editor, html]);

  if (!editor) {
    return <div className="muted">编辑器加载中...</div>;
  }

  return (
    <div className="visual-rich-editor-shell">
      <div className="visual-rich-editor-toolbar">
        <button type="button" className="btn btn-small btn-ghost" onClick={() => editor.chain().focus().toggleBold().run()}>
          加粗
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => editor.chain().focus().toggleItalic().run()}>
          斜体
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          无序列表
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          有序列表
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          二级标题
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => editor.chain().focus().setParagraph().run()}>
          正文
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
