import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FitnessChatBot from '../components/FitnessChatBot'; 

describe('FitnessChatBot', () => {
  it('renders without crashing', () => {
    render(<FitnessChatBot />);
  });
});