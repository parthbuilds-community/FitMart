import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Stars from './Stars';

describe('Stars', () => {
  it('renders five empty stars when rating is 0', () => {
    const { container } = render(<Stars rating={0} />);
    // Empty stars have opacity style
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });

  it('renders correct number of full stars for a whole-number rating', () => {
    const { container } = render(<Stars rating={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);

    // Count stars with full opacity (no opacity style on the path)
    const fullStars = Array.from(stars).filter(
      (svg) => svg.querySelector('path[style]') === null
    );
    expect(fullStars).toHaveLength(3);
  });

  it('renders a half star when rating has a decimal >= 0.5', () => {
    const { container } = render(<Stars rating={3.5} />);
    const halfStarClip = container.querySelector('clipPath');
    expect(halfStarClip).toBeTruthy();
  });

  it('renders all full stars for a 5-star rating', () => {
    const { container } = render(<Stars rating={5} />);
    const stars = container.querySelectorAll('svg');
    const fullStars = Array.from(stars).filter(
      (svg) => svg.querySelector('path[style]') === null
    );
    expect(fullStars).toHaveLength(5);
  });

  it('applies large size classes when size="lg"', () => {
    const { container } = render(<Stars rating={3} size="lg" />);
    const wrapper = container.querySelector('span');
    expect(wrapper.className).toContain('text-base');
  });

  it('has aria-hidden attribute on the container', () => {
    const { container } = render(<Stars rating={3} />);
    const wrapper = container.querySelector('span');
    expect(wrapper).toHaveAttribute('aria-hidden');
  });

  it('renders no stars when not provided a rating (defaults to 0)', () => {
    const { container } = render(<Stars />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });
});
