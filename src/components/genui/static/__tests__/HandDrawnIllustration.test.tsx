import { render, screen } from '@testing-library/react';
import { HandDrawnIllustration } from '../HandDrawnIllustration';

describe('HandDrawnIllustration', () => {
  it('should render an image with correct src', () => {
    render(<HandDrawnIllustration src="/doodles/test.svg" alt="Test illustration" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/doodles/test.svg');
  });

  it('should render an image with correct alt text', () => {
    render(<HandDrawnIllustration src="/doodles/test.svg" alt="A hand-drawn castle" />);

    const img = screen.getByAltText('A hand-drawn castle');
    expect(img).toBeInTheDocument();
  });

  it('should apply hand-drawn aesthetic styling', () => {
    const { container } = render(
      <HandDrawnIllustration src="/doodles/test.svg" alt="Test" />
    );

    const wrapper = container.firstChild as HTMLElement;

    // Check for hand-drawn aesthetic classes
    expect(wrapper).toHaveClass('border-2');
    expect(wrapper).toHaveClass('rotate-1'); // Playful tilt
    expect(wrapper).toHaveClass('shadow-md');
  });

  it('should apply rotation transform to image', () => {
    render(<HandDrawnIllustration src="/doodles/test.svg" alt="Test" />);

    const img = screen.getByRole('img');

    // Check for the rotation transform
    expect(img).toHaveStyle({ transform: 'rotate(-2deg)' });
  });

  it('should handle different image paths', () => {
    const { rerender } = render(
      <HandDrawnIllustration src="/images/castle.png" alt="Castle" />
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/castle.png');

    rerender(<HandDrawnIllustration src="https://example.com/image.jpg" alt="External" />);

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should render with responsive image classes', () => {
    render(<HandDrawnIllustration src="/doodles/test.svg" alt="Test" />);

    const img = screen.getByRole('img');

    expect(img).toHaveClass('max-w-full');
    expect(img).toHaveClass('h-auto');
  });
});
