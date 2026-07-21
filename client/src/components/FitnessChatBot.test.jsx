import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FitnessChatBot from './FitnessChatBot';

describe('FitnessChatBot', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the floating action button and welcome message when opened', () => {
    render(<FitnessChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /open fitness assistant/i }));
    expect(
      screen.getByText(/Ask me anything about workouts, diet, protein/i)
    ).toBeInTheDocument();
  });

  it('renders markdown from the bot as HTML while stripping unsafe tags/scripts', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: '**Great question!** <script>window.__hacked = true;</script> Try some *cardio*.',
      }),
    });

    render(<FitnessChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /open fitness assistant/i }));

    const textarea = screen.getByLabelText(/ask the fitness assistant/i);
    fireEvent.change(textarea, { target: { value: 'How do I get fit?' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText('Great question!')).toBeInTheDocument();
    });

    const strongEl = screen.getByText('Great question!');
    expect(strongEl.tagName).toBe('STRONG');

    expect(document.querySelector('script[src], script:not([type])')).toBeFalsy();
    expect(window.__hacked).toBeUndefined();
  });
});