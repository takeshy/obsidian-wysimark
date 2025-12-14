import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Editable, useEditor } from '../wysimark/entry';

// Wrapper component for Storybook
function WysimarkEditor({
  initialValue = '',
  placeholder = 'Start writing...',
  height,
  minHeight,
  maxHeight,
}: {
  initialValue?: string;
  placeholder?: string;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
}) {
  const [value, setValue] = useState(initialValue);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const editor = useEditor({ height, minHeight, maxHeight });

  const handleChange = useCallback((markdown: string) => {
    setValue(markdown);
  }, []);

  const toggleMarkdown = useCallback(() => {
    setShowMarkdown((prev) => !prev);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={toggleMarkdown}
          style={{
            padding: '8px 16px',
            backgroundColor: showMarkdown ? '#4a9eff' : '#e0e0e0',
            color: showMarkdown ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {showMarkdown ? 'Hide Markdown' : 'Show Markdown'}
        </button>
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
        <Editable
          editor={editor}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>
      {showMarkdown && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#666' }}>
            Raw Markdown:
          </div>
          <pre
            style={{
              margin: 0,
              padding: '12px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </pre>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof WysimarkEditor> = {
  title: 'Wysimark/Editor',
  component: WysimarkEditor,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    initialValue: {
      control: 'text',
      description: 'Initial markdown content',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when empty',
    },
    height: {
      control: 'text',
      description: 'Fixed height of the editor',
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height of the editor',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of the editor',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WysimarkEditor>;

export const Default: Story = {
  args: {
    initialValue: '',
    placeholder: 'Start writing...',
  },
};

export const WithContent: Story = {
  args: {
    initialValue: `# Hello World

This is a **WYSIWYG** markdown editor.

## Features

- Rich text editing
- Markdown support
- Tables
- Code blocks

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`,
    placeholder: 'Start writing...',
  },
};

export const WithFixedHeight: Story = {
  args: {
    initialValue: '# Fixed Height Editor\n\nThis editor has a fixed height.',
    placeholder: 'Start writing...',
    height: '400px',
  },
};

export const WithMinMaxHeight: Story = {
  args: {
    initialValue: '',
    placeholder: 'Start writing... (min: 200px, max: 500px)',
    minHeight: '200px',
    maxHeight: '500px',
  },
};

export const TaskList: Story = {
  args: {
    initialValue: `# Task List Example

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task to do
`,
    placeholder: 'Start writing...',
  },
};
