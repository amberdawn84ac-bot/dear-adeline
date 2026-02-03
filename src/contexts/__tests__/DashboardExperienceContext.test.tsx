import { renderHook, act, waitFor } from '@testing-library/react';
import { DashboardExperienceProvider, useDashboardExperience } from '../DashboardExperienceContext';
import type { ComposedUIPage } from '@/lib/services/genUIOrchestrator';

// Mock fetch
global.fetch = jest.fn();

describe('DashboardExperienceContext', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('useDashboardExperience hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useDashboardExperience());
      }).toThrow('useDashboardExperience must be used within a DashboardExperienceProvider');

      consoleSpy.mockRestore();
    });

    it('should provide context values when inside provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      expect(result.current).toHaveProperty('composedPage');
      expect(result.current).toHaveProperty('setComposedPage');
      expect(result.current).toHaveProperty('triggerGenUIExperience');
      expect(result.current).toHaveProperty('isLoadingGenUI');
    });
  });

  describe('DashboardExperienceProvider', () => {
    it('should initialize with null composedPage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      expect(result.current.composedPage).toBeNull();
    });

    it('should initialize with isLoadingGenUI false', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      expect(result.current.isLoadingGenUI).toBe(false);
    });

    it('should allow setting composedPage directly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      const mockPage: ComposedUIPage = {
        dialogue: 'Test dialogue',
        components: [],
      };

      act(() => {
        result.current.setComposedPage(mockPage);
      });

      expect(result.current.composedPage).toEqual(mockPage);
    });

    it('should clear composedPage when set to null', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      const mockPage: ComposedUIPage = {
        dialogue: 'Test',
        components: [],
      };

      act(() => {
        result.current.setComposedPage(mockPage);
      });

      expect(result.current.composedPage).toEqual(mockPage);

      act(() => {
        result.current.setComposedPage(null);
      });

      expect(result.current.composedPage).toBeNull();
    });
  });

  describe('triggerGenUIExperience', () => {
    it('should set isLoadingGenUI to true while fetching', async () => {
      const mockResponse: ComposedUIPage = {
        dialogue: 'Test response',
        components: [],
      };

      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockResponse,
            });
          }, 100);
        })
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      act(() => {
        result.current.triggerGenUIExperience('Test message');
      });

      expect(result.current.isLoadingGenUI).toBe(true);

      await waitFor(() => expect(result.current.isLoadingGenUI).toBe(false));
    });

    it('should fetch from /api/copilotkit endpoint', async () => {
      const mockResponse: ComposedUIPage = {
        dialogue: 'Test',
        components: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      await act(async () => {
        await result.current.triggerGenUIExperience('I want to learn about money');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/copilotkit',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'I want to learn about money' }),
        })
      );
    });

    it('should update composedPage with fetched data', async () => {
      const mockResponse: ComposedUIPage = {
        dialogue: 'Welcome to the marketplace!',
        components: [
          {
            type: 'dynamicLedger',
            props: { scenario: 'Test', items: [], learningGoal: 'Test' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      await act(async () => {
        await result.current.triggerGenUIExperience('Test message');
      });

      expect(result.current.composedPage).toEqual(mockResponse);
    });

    it('should clear previous page before loading new one', async () => {
      const oldPage: ComposedUIPage = {
        dialogue: 'Old page',
        components: [],
      };

      const newPage: ComposedUIPage = {
        dialogue: 'New page',
        components: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => newPage,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      // Set an old page
      act(() => {
        result.current.setComposedPage(oldPage);
      });

      expect(result.current.composedPage).toEqual(oldPage);

      // Trigger new experience (should clear first)
      act(() => {
        result.current.triggerGenUIExperience('New message');
      });

      // Page should be cleared immediately
      expect(result.current.composedPage).toBeNull();

      // Wait for fetch to complete
      await waitFor(() => expect(result.current.composedPage).toEqual(newPage));
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      await act(async () => {
        await result.current.triggerGenUIExperience('Test message');
      });

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error triggering GenUI experience:',
        expect.any(Error)
      );

      // Should stop loading
      expect(result.current.isLoadingGenUI).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-ok responses', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashboardExperienceProvider>{children}</DashboardExperienceProvider>
      );

      const { result } = renderHook(() => useDashboardExperience(), { wrapper });

      await act(async () => {
        await result.current.triggerGenUIExperience('Test message');
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result.current.isLoadingGenUI).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });
});
