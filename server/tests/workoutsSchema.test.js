const { updateWorkoutLogSchema } = require('../validation/requestSchemas');

describe('workout validation schemas', () => {
  const validExercise = {
    id: 'exercise-1',
    name: 'Push Up',
    bodyPart: 'chest',
    target: 'pectorals',
    equipment: 'body weight',
    gifUrl: 'https://example.com/push-up.gif',
  };

  describe('updateWorkoutLogSchema.body', () => {
    test('should pass with a valid workout log payload', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        title: 'Push Day',
        notes: 'Felt strong today',
        exercises: [validExercise],
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        date: '2026-06-11',
        title: 'Push Day',
        notes: 'Felt strong today',
      });
      expect(result.data.exercises).toHaveLength(1);
    });

    test('should pass with only the required date field', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
      });

      expect(result.success).toBe(true);
    });

    test('should pass with an empty exercises array', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: [],
      });

      expect(result.success).toBe(true);
    });

    test('should fail when date is missing', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        title: 'Push Day',
      });

      expect(result.success).toBe(false);
    });

    test('should fail when date is empty', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '',
      });

      expect(result.success).toBe(false);
    });

    test('should fail when date has the wrong type', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: 20260611,
      });

      expect(result.success).toBe(false);
    });

    test('should fail when exercises is not an array', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: 'push ups',
      });

      expect(result.success).toBe(false);
    });

    test('should fail when exercise id is missing', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: [
          {
            name: 'Push Up',
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    test('should fail when exercise name is missing', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: [
          {
            id: 'exercise-1',
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    test('should fail when exercise id is empty', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: [
          {
            id: '',
            name: 'Push Up',
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    test('should fail when exercise name is empty', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: [
          {
            id: 'exercise-1',
            name: '',
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    test('should fail with unknown fields in workout log payload', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        extraField: 'not allowed',
      });

      expect(result.success).toBe(false);
    });

    test('should fail with unknown fields inside exercise payload', () => {
      const result = updateWorkoutLogSchema.body.safeParse({
        date: '2026-06-11',
        exercises: [
          {
            id: 'exercise-1',
            name: 'Push Up',
            randomField: 'not allowed',
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });
});
