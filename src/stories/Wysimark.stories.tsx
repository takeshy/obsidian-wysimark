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
  const editor = useEditor({ height, minHeight, maxHeight });

  const handleChange = useCallback((markdown: string) => {
    setValue(markdown);
    console.log('Markdown changed:', markdown);
  }, []);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      <Editable
        editor={editor}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
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
