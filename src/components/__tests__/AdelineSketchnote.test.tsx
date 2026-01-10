// src/components/__tests__/AdelineSketchnote.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdelineSketchnote from '../AdelineSketchnote';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <div>ArrowRight</div>,
  Star: () => <div>Star</div>,
  Lightbulb: () => <div>Lightbulb</div>,
  Pencil: () => <div>Pencil</div>,
}));

describe('AdelineSketchnote', () => {
  const mockContent = 'Title\n- Point 1\n- Point 2';

  it('should call onNoteClick when a note is clicked', () => {
    const onNoteClick = jest.fn();
    render(<AdelineSketchnote content={mockContent} onNoteClick={onNoteClick} />);

    const point1 = screen.getByText('Point 1');
    fireEvent.click(point1);

    expect(onNoteClick).toHaveBeenCalledWith('Point 1');
  });
});
