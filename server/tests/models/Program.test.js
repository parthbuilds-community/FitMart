const mongoose = require('mongoose');
const Program = require('../../models/Program');

function validProgram(overrides = {}) {
  return {
    title: 'Test Fitness Program',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    lengthDays: 1,
    days: [{
      dayNumber: 1,
      title: 'Day 1: Full Body',
      focus: 'Full Body',
      exercises: Array.from(
        { length: 5 },
        () => new mongoose.Types.ObjectId()
      ),
    }],
    tags: ['fitness'],
    ...overrides,
  };
}

describe('Program model validation', () => {
  test('accepts a valid program', async () => {
    await expect(
      new Program(validProgram()).validate()
    ).resolves.toBeUndefined();
  });

  test('rejects a program without a title', async () => {
    await expect(
      new Program(validProgram({ title: '' })).validate()
    ).rejects.toThrow();
  });

  test('rejects an unsupported difficulty', async () => {
    await expect(
      new Program(validProgram({ difficulty: 'Expert' })).validate()
    ).rejects.toThrow();
  });

  test('requires the number of days to match lengthDays', async () => {
    await expect(
      new Program(validProgram({ lengthDays: 2 })).validate()
    ).rejects.toThrow();
  });

  test('rejects fewer than four exercises on a day', async () => {
    const data = validProgram();
    data.days[0].exercises = Array.from(
      { length: 3 },
      () => new mongoose.Types.ObjectId()
    );

    await expect(new Program(data).validate()).rejects.toThrow();
  });

  test('rejects more than eight exercises on a day', async () => {
    const data = validProgram();
    data.days[0].exercises = Array.from(
      { length: 9 },
      () => new mongoose.Types.ObjectId()
    );

    await expect(new Program(data).validate()).rejects.toThrow();
  });

  test('rejects incorrectly numbered days', async () => {
    const data = validProgram();
    data.days[0].dayNumber = 2;

    await expect(new Program(data).validate()).rejects.toThrow();
  });
});
