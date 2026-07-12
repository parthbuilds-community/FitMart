import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FitnessChatBot from './FitnessChatBot';

describe('FitnessChatBot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens from the FAB and shows the welcome message', async () => {
    const user = userEvent.setup();
    render(<FitnessChatBot />);

    const fab = screen.getByRole('button', { name: /open fitness assistant/i });
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true');

    await user.click(fab);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText(/fitmart fitness assistant/i)).toBeInTheDocument();
  });

  it('sanitizes markdown from bot replies, stripping disallowed tags/scripts', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          reply: 'Nice work! <script>window.__pwned = true;</script>**strong** advice',
        }),
      }),
    );

    render(<FitnessChatBot />);
    await user.click(screen.getByRole('button', { name: /open fitness assistant/i }));

    await user.type(
      screen.getByRole('textbox', { name: /ask the fitness assistant/i }),
      'How do I build muscle?',
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const log = screen.getByRole('log');
    await within(log).findByText(/nice work/i);

    expect(log.querySelector('script')).toBeNull();
    expect(window.__pwned).toBeUndefined();
    expect(log.querySelector('strong')).toHaveTextContent('strong');
  });
});
