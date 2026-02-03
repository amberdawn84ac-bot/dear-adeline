import { render, screen } from '@testing-library/react';
import { GuidingQuestion } from '../GuidingQuestion';

describe('GuidingQuestion', () => {
  it('should render the question text', () => {
    render(<GuidingQuestion text="What happens when you double the price?" />);

    expect(screen.getByText('What happens when you double the price?')).toBeInTheDocument();
  });

  it('should display "A Question to Ponder..." header', () => {
    render(<GuidingQuestion text="Test question" />);

    expect(screen.getByText('A Question to Ponder...')).toBeInTheDocument();
  });

  it('should render with yellow theme for prominence', () => {
    const { container } = render(<GuidingQuestion text="Test question" />);

    const questionBox = container.firstChild as HTMLElement;

    expect(questionBox).toHaveClass('bg-yellow-50');
    expect(questionBox).toHaveClass('border-yellow-200');
  });

  it('should include lightbulb icon', () => {
    const { container } = render(<GuidingQuestion text="Test question" />);

    // Lucide icons render as SVGs
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-yellow-500');
  });

  it('should handle long questions', () => {
    const longQuestion = 'This is a very long question that spans multiple lines and tests whether the component handles wrapping text appropriately without breaking the layout or causing visual issues';

    render(<GuidingQuestion text={longQuestion} />);

    expect(screen.getByText(longQuestion)).toBeInTheDocument();
  });

  it('should handle questions with special characters', () => {
    const question = "What's the profit margin if you raise prices by 50%?";

    render(<GuidingQuestion text={question} />);

    expect(screen.getByText(question)).toBeInTheDocument();
  });

  it('should use hand-drawn fonts for whimsical aesthetic', () => {
    render(<GuidingQuestion text="Test question" />);

    const header = screen.getByText('A Question to Ponder...');
    expect(header).toHaveClass("font-['Architects_Daughter']");

    const questionText = screen.getByText('Test question');
    expect(questionText).toHaveClass("font-['Kalam']");
  });

  it('should render with appropriate spacing and layout', () => {
    const { container } = render(<GuidingQuestion text="Test question" />);

    const questionBox = container.firstChild as HTMLElement;

    // Check for spacing classes
    expect(questionBox).toHaveClass('my-6');
    expect(questionBox).toHaveClass('p-4');
    expect(questionBox).toHaveClass('gap-4');
  });
});
