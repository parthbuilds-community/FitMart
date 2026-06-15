const { getFallbackResponse, PRODUCT_TEMPLATE } = require('./chatConfig');

describe('getFallbackResponse()', () => {

  describe('keyword matching', () => {
    test('returns protein response when message contains "protein"', () => {
      const result = getFallbackResponse('What protein should I take?');
      expect(result).toContain('protein');
      expect(result).toContain('1.6-2.2g per kg');
    });

    test('returns workout response when message contains "workout"', () => {
      const result = getFallbackResponse('Give me a workout plan');
      expect(result).toContain('strength training');
      expect(result).toContain('3-4');
    });

    test('returns workout response when message contains "exercise"', () => {
      const result = getFallbackResponse('What exercise should I do?');
      expect(result).toContain('strength training');
    });

    test('returns weight loss response when message contains "weight loss"', () => {
      const result = getFallbackResponse('How do I achieve weight loss?');
      expect(result).toContain('calorie deficit');
    });

    test('returns muscle gain response when message contains "muscle"', () => {
      const result = getFallbackResponse('How do I build muscle?');
      expect(result).toContain('calorie surplus');
    });

    test('returns muscle gain response when message contains "gain"', () => {
      const result = getFallbackResponse('I want to gain weight');
      expect(result).toContain('calorie surplus');
    });
  });

  describe('case insensitivity', () => {
    test('matches "PROTEIN" in uppercase', () => {
      const result = getFallbackResponse('Tell me about PROTEIN');
      expect(result).toContain('1.6-2.2g per kg');
    });

    test('matches "Workout" in mixed case', () => {
      const result = getFallbackResponse('I need a Workout routine');
      expect(result).toContain('strength training');
    });

    test('matches "WEIGHT LOSS" in uppercase', () => {
      const result = getFallbackResponse('WEIGHT LOSS tips please');
      expect(result).toContain('calorie deficit');
    });

    test('matches "Muscle" in mixed case', () => {
      const result = getFallbackResponse('Muscle building advice');
      expect(result).toContain('calorie surplus');
    });
  });

  describe('generic fallback', () => {
    test('returns generic response for unrelated message', () => {
      const result = getFallbackResponse('What is the weather today?');
      expect(result).toContain('workouts');
      expect(result).toContain('nutrition');
    });

    test('returns generic response for empty string', () => {
      const result = getFallbackResponse('');
      expect(result).toContain('workouts');
    });

    test('returns a non-empty string for any input', () => {
      const result = getFallbackResponse('random gibberish xyz123');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe('PRODUCT_TEMPLATE()', () => {
  test('renders product name', () => {
    const result = PRODUCT_TEMPLATE({ name: 'Whey Protein' });
    expect(result).toContain('Whey Protein');
  });

  test('includes brand when provided', () => {
    const result = PRODUCT_TEMPLATE({ name: 'Whey Protein', brand: 'MuscleBlaze' });
    expect(result).toContain('MuscleBlaze');
  });

  test('includes price when provided', () => {
    const result = PRODUCT_TEMPLATE({ name: 'Creatine', price: 1999 });
    expect(result).toContain('1,999');
  });

  test('omits brand when not provided', () => {
    const result = PRODUCT_TEMPLATE({ name: 'BCAA', price: 799 });
    expect(result).not.toContain('by');
  });

  test('omits price when not provided', () => {
    const result = PRODUCT_TEMPLATE({ name: 'BCAA', brand: 'Fast&Up' });
    expect(result).not.toContain('₹');
  });

  test('always includes the Recommended Products header', () => {
    const result = PRODUCT_TEMPLATE({ name: 'Whey' });
    expect(result).toContain('Recommended Products');
  });
});