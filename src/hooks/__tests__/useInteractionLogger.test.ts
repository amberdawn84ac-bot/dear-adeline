import { renderHook, act } from '@testing-library/react';
import { useInteractionLogger } from '../useInteractionLogger';

describe('useInteractionLogger', () => {
  // Spy on console.log since the hook currently logs to console
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should return a logInteraction function', () => {
    const { result } = renderHook(() => useInteractionLogger('testComponent'));

    expect(result.current).toBeInstanceOf(Function);
  });

  it('should log interaction with correct structure', () => {
    const { result } = renderHook(() => useInteractionLogger('dynamicLedger'));

    act(() => {
      result.current('slider_change', { itemName: 'Loaf', newPrice: 4.50 });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Interaction]',
      expect.objectContaining({
        componentType: 'dynamicLedger',
        action: 'slider_change',
        data: { itemName: 'Loaf', newPrice: 4.50 },
        timestamp: expect.any(Number),
      })
    );
  });

  it('should include componentId if provided', () => {
    const { result } = renderHook(() =>
      useInteractionLogger('dynamicLedger', 'ledger-123')
    );

    act(() => {
      result.current('button_click', {});
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Interaction]',
      expect.objectContaining({
        componentId: 'ledger-123',
        componentType: 'dynamicLedger',
        action: 'button_click',
      })
    );
  });

  it('should generate timestamp automatically', () => {
    const { result } = renderHook(() => useInteractionLogger('testComponent'));

    const beforeTimestamp = Date.now();

    act(() => {
      result.current('test_action', { test: 'data' });
    });

    const afterTimestamp = Date.now();

    const loggedEvent = consoleSpy.mock.calls[0][1];
    expect(loggedEvent.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    expect(loggedEvent.timestamp).toBeLessThanOrEqual(afterTimestamp);
  });

  it('should handle empty data object', () => {
    const { result } = renderHook(() => useInteractionLogger('testComponent'));

    act(() => {
      result.current('empty_action', {});
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Interaction]',
      expect.objectContaining({
        data: {},
      })
    );
  });

  it('should handle complex data structures', () => {
    const { result } = renderHook(() => useInteractionLogger('testComponent'));

    const complexData = {
      nested: { value: 123 },
      array: [1, 2, 3],
      string: 'test',
      number: 42,
      boolean: true,
    };

    act(() => {
      result.current('complex_action', complexData);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Interaction]',
      expect.objectContaining({
        data: complexData,
      })
    );
  });

  it('should maintain stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useInteractionLogger('testComponent')
    );

    const firstFunction = result.current;

    rerender();

    const secondFunction = result.current;

    expect(firstFunction).toBe(secondFunction);
  });

  it('should log multiple interactions independently', () => {
    const { result } = renderHook(() => useInteractionLogger('testComponent'));

    act(() => {
      result.current('action1', { value: 1 });
      result.current('action2', { value: 2 });
      result.current('action3', { value: 3 });
    });

    expect(consoleSpy).toHaveBeenCalledTimes(3);
    expect(consoleSpy.mock.calls[0][1].data).toEqual({ value: 1 });
    expect(consoleSpy.mock.calls[1][1].data).toEqual({ value: 2 });
    expect(consoleSpy.mock.calls[2][1].data).toEqual({ value: 3 });
  });
});
