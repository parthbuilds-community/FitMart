import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FitnessChatBot from './FitnessChatBot';

// Mock global fetch
global.fetch = vi.fn();

describe('FitnessChatBot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chatbot FAB button initially', () => {
    render(<FitnessChatBot />);
    const fabButton = screen.getByRole('button', { name: /open fitness assistant/i });
    expect(fabButton).toBeInTheDocument();
  });

  it('opens and closes the chat dialog when FAB is clicked', async () => {
    render(<FitnessChatBot />);
    const fabButton = screen.getByRole('button', { name: /open fitness assistant/i });
    
    // Initially, the dialog has aria-hidden="true" or is closed
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
    expect(fabButton).toHaveAttribute('aria-expanded', 'false');

    // Click FAB to open
    fireEvent.click(fabButton);
    expect(fabButton).toHaveAttribute('aria-expanded', 'true');

    // Click FAB again to close
    fireEvent.click(fabButton);
    expect(fabButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays the welcome message when chat is opened', () => {
    render(<FitnessChatBot />);
    const fabButton = screen.getByRole('button', { name: /open fitness assistant/i });
    fireEvent.click(fabButton);

    const welcomeMsg = screen.getByText(/Hello! I'm your FitMart fitness assistant/i);
    expect(welcomeMsg).toBeInTheDocument();
  });

  it('sends a user message and displays the bot response with markdown parsing', async () => {
    // Mock the api response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'This is a **mocked** response.' }),
    });

    render(<FitnessChatBot />);
    
    // Open chat
    const fabButton = screen.getByRole('button', { name: /open fitness assistant/i });
    fireEvent.click(fabButton);

    // Find textarea and send button
    const textarea = screen.getByPlaceholderText(/Ask about workouts, diet, protein/i);
    const sendButton = screen.getByRole('button', { name: /send message/i });

    // Type a message and send
    fireEvent.change(textarea, { target: { value: 'Hello fitness bot' } });
    fireEvent.click(sendButton);

    // User message should appear in log
    expect(screen.getByText('Hello fitness bot')).toBeInTheDocument();

    // Wait for the bot response to appear and parse markdown correctly
    await waitFor(() => {
      expect(screen.getByText(/This is a/i)).toBeInTheDocument();
    });

    // Verify **mocked** markdown is parsed into <strong> tags
    const boldElement = screen.getByText('mocked');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('STRONG');
  });
});
