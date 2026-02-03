import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicLedger } from '../DynamicLedger';
import * as useInteractionLoggerModule from '@/hooks/useInteractionLogger';

// Mock useInteractionLogger
const mockLogInteraction = jest.fn();

jest.mock('@/hooks/useInteractionLogger', () => ({
  useInteractionLogger: jest.fn(() => mockLogInteraction),
}));

describe('DynamicLedger', () => {
  const mockScenario = 'You are a merchant at a medieval market';
  const mockItems = [
    { name: 'Loaf of Bread', wholesalePrice: 2, retailPrice: 3 },
    { name: 'Baguette', wholesalePrice: 1.5, retailPrice: 2.5 },
  ];
  const mockLearningGoal = 'Understand profit margins';

  beforeEach(() => {
    mockLogInteraction.mockClear();
  });

  it('should render scenario text', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    expect(screen.getByText(mockScenario)).toBeInTheDocument();
  });

  it('should render learning goal', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    expect(screen.getByText(/Your Goal:.*Understand profit margins/i)).toBeInTheDocument();
  });

  it('should render all items with their names', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    expect(screen.getByText('Loaf of Bread')).toBeInTheDocument();
    expect(screen.getByText('Baguette')).toBeInTheDocument();
  });

  it('should display wholesale prices', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    expect(screen.getByText(/Cost: \$2\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Cost: \$1\.50/)).toBeInTheDocument();
  });

  it('should calculate profit correctly', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    // Initial profit for Loaf: $3 - $2 = $1
    // Initial profit for Baguette: $2.5 - $1.5 = $1
    // Both display as "1.00" (the number without "$" symbol due to icon layout)
    const profitElements = screen.getAllByText('1.00');
    expect(profitElements.length).toBe(2);
  });

  it('should calculate profit margin correctly', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    // Initial margin for Loaf: ($1 / $3) * 100 = 33.33%
    expect(screen.getByText(/33%/)).toBeInTheDocument();

    // Initial margin for Baguette: ($1 / $2.5) * 100 = 40%
    expect(screen.getByText(/40%/)).toBeInTheDocument();
  });

  it('should update calculations when price slider changes', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    // Find the slider for "Loaf of Bread"
    const sliders = screen.getAllByRole('slider');
    const loafSlider = sliders[0]; // First item

    // Change price to $4
    fireEvent.change(loafSlider, { target: { value: '4' } });

    // New profit: $4 - $2 = $2 (displays as "2.00")
    expect(screen.getByText('2.00')).toBeInTheDocument();

    // New margin: ($2 / $4) * 100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should log interaction when slider moves', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    const sliders = screen.getAllByRole('slider');
    const loafSlider = sliders[0];

    fireEvent.change(loafSlider, { target: { value: '4.5' } });

    expect(mockLogInteraction).toHaveBeenCalledWith('slider_change', {
      item: 'Loaf of Bread',
      newPrice: 4.5,
      newProfit: 2.5, // $4.5 - $2
    });
  });

  it('should track explored items', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    // Initially button is disabled and message says to change all prices
    const doneButton = screen.getByText(/Done Exploring/i);
    expect(doneButton).toBeDisabled();
    expect(screen.getByText(/Change the price of all items to finish/)).toBeInTheDocument();

    const sliders = screen.getAllByRole('slider');

    // Move first slider
    fireEvent.change(sliders[0], { target: { value: '4' } });
    expect(doneButton).toBeDisabled(); // Still disabled

    // Move second slider
    fireEvent.change(sliders[1], { target: { value: '3' } });
    expect(doneButton).not.toBeDisabled(); // Now enabled
    expect(screen.getByText(/Great job! You've explored all the items/)).toBeInTheDocument();
  });

  it('should call onComplete with correct data when done button clicked', () => {
    const mockOnComplete = jest.fn();

    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
        onComplete={mockOnComplete}
      />
    );

    const sliders = screen.getAllByRole('slider');

    // Explore both items
    fireEvent.change(sliders[0], { target: { value: '4' } });
    fireEvent.change(sliders[1], { target: { value: '3' } });

    // Click done
    const doneButton = screen.getByText(/Done Exploring/i);
    fireEvent.click(doneButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      itemsExplored: 2,
      conceptsMastered: ['profit margin', 'markup percentage'],
      score: 100, // 2/2 = 100%
    });
  });

  it('should log completion when done button clicked', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    const sliders = screen.getAllByRole('slider');

    // Explore all items to enable the button
    fireEvent.change(sliders[0], { target: { value: '4' } });
    fireEvent.change(sliders[1], { target: { value: '3' } });

    const doneButton = screen.getByText(/Done Exploring/i);
    fireEvent.click(doneButton);

    expect(mockLogInteraction).toHaveBeenCalledWith('complete_activity', {
      results: expect.objectContaining({
        itemsExplored: expect.any(Number),
        conceptsMastered: expect.any(Array),
        score: expect.any(Number),
      }),
    });
  });

  it('should allow slider to move within valid range', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    const sliders = screen.getAllByRole('slider');
    const loafSlider = sliders[0] as HTMLInputElement;

    // Min should be wholesale price ($2)
    expect(loafSlider.min).toBe('2');

    // Max should be 3x wholesale ($6)
    expect(loafSlider.max).toBe('6');

    // Step should be 0.25
    expect(loafSlider.step).toBe('0.25');
  });

  it('should display retail price that updates with slider', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    const sliders = screen.getAllByRole('slider');

    // Initial retail price is in the slider value
    expect((sliders[0] as HTMLInputElement).value).toBe('3');

    // Change price
    fireEvent.change(sliders[0], { target: { value: '5' } });

    // Updated retail price reflected in slider
    expect((sliders[0] as HTMLInputElement).value).toBe('5');
  });

  it('should handle zero or negative profit margins correctly', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    const sliders = screen.getAllByRole('slider');

    // Set price equal to wholesale (zero profit)
    fireEvent.change(sliders[0], { target: { value: '2' } });

    // Profit should be 0.00 (displays as "0.00")
    expect(screen.getByText('0.00')).toBeInTheDocument();

    // Margin should be 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should use hand-drawn aesthetic styling', () => {
    const { container } = render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal={mockLearningGoal}
      />
    );

    const ledgerContainer = container.firstChild as HTMLElement;

    // Check for hand-drawn aesthetic
    expect(ledgerContainer).toHaveClass('border-2');
    expect(ledgerContainer).toHaveClass('border-[#2F4731]'); // Forest green
    expect(ledgerContainer).toHaveClass('bg-[#FFF9F0]'); // Cream
    expect(ledgerContainer).toHaveClass('transform');
    expect(ledgerContainer).toHaveClass('-rotate-1'); // Playful tilt
  });
});
