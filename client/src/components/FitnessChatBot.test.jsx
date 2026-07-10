import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FitnessChatBot from './FitnessChatBot';

describe('FitnessChatBot Component', () => {
  
  it('renders the chat floating action button (FAB) initially', () => {
    // 1. Render the component into our virtual test browser
    render(<FitnessChatBot />);
    
    // 2. Find the button using the accessibility label you provided in the code
    const openButton = screen.getByLabelText(/Open fitness assistant/i);
    
    // 3. Assert that the button is successfully rendered on the screen
    expect(openButton).toBeInTheDocument();
  });

  it('opens the chat window and displays the welcome message when clicked', () => {
    render(<FitnessChatBot />);

    // 1. Find the button and simulate a user clicking it
    const openButton = screen.getByLabelText(/Open fitness assistant/i);
    fireEvent.click(openButton);

    // 2. Verify the welcome message appears
    const welcomeMessage = screen.getByText(/Hello! I'm your FitMart fitness assistant/i);
    expect(welcomeMessage).toBeInTheDocument();

    // 3. Verify the quick reply buttons appear
    const dietPlanButton = screen.getByText(/Diet plan/i);
    expect(dietPlanButton).toBeInTheDocument();
  });

});