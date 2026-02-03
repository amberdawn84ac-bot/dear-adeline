import { render, screen } from '@testing-library/react';
import { ComposedPageRenderer } from '../ComposedPageRenderer';
import type { ComposedUIPage } from '@/lib/services/genUIOrchestrator';

describe('ComposedPageRenderer', () => {
  const mockPage: ComposedUIPage = {
    dialogue: "Let's explore profit margins through a marketplace experience!",
    components: [
      {
        type: 'handDrawnIllustration',
        props: {
          src: '/doodles/marketplace.svg',
          alt: 'Medieval marketplace',
        },
      },
      {
        type: 'dynamicLedger',
        props: {
          scenario: 'You are a merchant',
          items: [
            { name: 'Bread', wholesalePrice: 2, retailPrice: 3 },
          ],
          learningGoal: 'Understand margins',
        },
      },
      {
        type: 'guidingQuestion',
        props: {
          text: 'What happens when you raise prices?',
        },
      },
    ],
    nextActions: [
      { id: 'explore', label: 'Explore More', action: 'explore_tool' },
    ],
  };

  it('should render dialogue text', () => {
    render(<ComposedPageRenderer composedPage={mockPage} />);

    expect(screen.getByText("Let's explore profit margins through a marketplace experience!")).toBeInTheDocument();
  });

  it('should render all components in order', () => {
    const { container } = render(<ComposedPageRenderer composedPage={mockPage} />);

    // Check that components are rendered
    // Illustration should have an img
    expect(container.querySelector('img')).toBeInTheDocument();

    // Ledger should have scenario text
    expect(screen.getByText('You are a merchant')).toBeInTheDocument();

    // Question should be present
    expect(screen.getByText('What happens when you raise prices?')).toBeInTheDocument();
  });

  it('should render handDrawnIllustration component', () => {
    render(<ComposedPageRenderer composedPage={mockPage} />);

    const img = screen.getByAltText('Medieval marketplace');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/doodles/marketplace.svg');
  });

  it('should render dynamicLedger component', () => {
    render(<ComposedPageRenderer composedPage={mockPage} />);

    expect(screen.getByText('You are a merchant')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('should render guidingQuestion component', () => {
    render(<ComposedPageRenderer composedPage={mockPage} />);

    expect(screen.getByText('What happens when you raise prices?')).toBeInTheDocument();
  });

  it('should handle page without dialogue', () => {
    const pageWithoutDialogue: ComposedUIPage = {
      components: [
        {
          type: 'guidingQuestion',
          props: { text: 'Test question' },
        },
      ],
    };

    render(<ComposedPageRenderer composedPage={pageWithoutDialogue} />);

    expect(screen.getByText('Test question')).toBeInTheDocument();
  });

  it('should handle unknown component types gracefully', () => {
    const pageWithUnknown: ComposedUIPage = {
      components: [
        {
          type: 'unknownComponentType',
          props: {},
        },
      ],
    };

    render(<ComposedPageRenderer composedPage={pageWithUnknown} />);

    expect(screen.getByText(/Unknown component type "unknownComponentType"/)).toBeInTheDocument();
  });

  it('should log warning for unknown component types', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const pageWithUnknown: ComposedUIPage = {
      components: [
        {
          type: 'unknownType',
          props: {},
        },
      ],
    };

    render(<ComposedPageRenderer composedPage={pageWithUnknown} />);

    expect(consoleSpy).toHaveBeenCalledWith('Unknown component type: unknownType');

    consoleSpy.mockRestore();
  });

  it('should render empty components array', () => {
    const emptyPage: ComposedUIPage = {
      dialogue: 'Just dialogue, no components',
      components: [],
    };

    render(<ComposedPageRenderer composedPage={emptyPage} />);

    expect(screen.getByText('Just dialogue, no components')).toBeInTheDocument();
  });

  it('should apply proper spacing between components', () => {
    const { container } = render(<ComposedPageRenderer composedPage={mockPage} />);

    const mainContainer = container.querySelector('.flex.flex-col.gap-4');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should render multiple components of the same type', () => {
    const pageWithMultipleSame: ComposedUIPage = {
      components: [
        {
          type: 'guidingQuestion',
          props: { text: 'Question 1' },
        },
        {
          type: 'guidingQuestion',
          props: { text: 'Question 2' },
        },
      ],
    };

    render(<ComposedPageRenderer composedPage={pageWithMultipleSame} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('should pass props correctly to child components', () => {
    const specificProps: ComposedUIPage = {
      components: [
        {
          type: 'dynamicLedger',
          props: {
            scenario: 'Specific scenario text',
            items: [
              { name: 'Unique Item', wholesalePrice: 5, retailPrice: 10 },
            ],
            learningGoal: 'Specific goal',
          },
        },
      ],
    };

    render(<ComposedPageRenderer composedPage={specificProps} />);

    expect(screen.getByText('Specific scenario text')).toBeInTheDocument();
    expect(screen.getByText('Unique Item')).toBeInTheDocument();
  });
});
