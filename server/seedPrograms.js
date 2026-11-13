const Exercise = require('./models/Exercise');
const Program = require('./models/Program');

const EXERCISES = [
  ['push-ups', 'Push-ups', 'Chest', 'Bodyweight'],
  ['incline-push-ups', 'Incline Push-ups', 'Chest', 'Bench'],
  ['dumbbell-press', 'Dumbbell Press', 'Chest', 'Dumbbells'],
  ['squats', 'Bodyweight Squats', 'Legs', 'Bodyweight'],
  ['lunges', 'Forward Lunges', 'Legs', 'Bodyweight'],
  ['glute-bridges', 'Glute Bridges', 'Glutes', 'Bodyweight'],
  ['calf-raises', 'Calf Raises', 'Calves', 'Bodyweight'],
  ['plank', 'Plank', 'Core', 'Bodyweight'],
  ['side-plank', 'Side Plank', 'Core', 'Bodyweight'],
  ['dead-bug', 'Dead Bug', 'Core', 'Bodyweight'],
  ['bird-dog', 'Bird Dog', 'Core', 'Bodyweight'],
  ['crunches', 'Crunches', 'Core', 'Bodyweight'],
  ['jumping-jacks', 'Jumping Jacks', 'Cardio', 'Bodyweight'],
  ['high-knees', 'High Knees', 'Cardio', 'Bodyweight'],
  ['mountain-climbers', 'Mountain Climbers', 'Cardio', 'Bodyweight'],
  ['marching', 'March in Place', 'Cardio', 'Bodyweight'],
  ['brisk-walk', 'Brisk Walking', 'Cardio', 'None'],
  ['arm-circles', 'Arm Circles', 'Mobility', 'Bodyweight'],
  ['cat-cow', 'Cat-Cow Stretch', 'Mobility', 'Bodyweight'],
  ['child-pose', 'Child’s Pose', 'Mobility', 'Mat'],
  ['hip-flexor-stretch', 'Hip Flexor Stretch', 'Mobility', 'Bodyweight'],
  ['hamstring-stretch', 'Hamstring Stretch', 'Mobility', 'Bodyweight'],
  ['standing-balance', 'Single-Leg Balance', 'Balance', 'Bodyweight'],
  ['heel-to-toe-walk', 'Heel-to-Toe Walk', 'Balance', 'Bodyweight'],
  ['bird-dog-balance', 'Bird Dog Balance', 'Balance', 'Bodyweight'],
  ['superman', 'Superman Hold', 'Back', 'Bodyweight'],
  ['reverse-lunges', 'Reverse Lunges', 'Legs', 'Bodyweight'],
  ['wall-sit', 'Wall Sit', 'Legs', 'Wall'],
  ['burpees', 'Burpees', 'Full Body', 'Bodyweight'],
  ['shadow-boxing', 'Shadow Boxing', 'Cardio', 'Bodyweight'],
  ['hip-hinge', 'Bodyweight Hip Hinge', 'Glutes', 'Bodyweight'],
  ['wall-push-ups', 'Wall Push-ups', 'Chest', 'Wall'],
  ['shoulder-stretch', 'Shoulder Stretch', 'Mobility', 'Bodyweight'],
  ['standing-knee-raises', 'Standing Knee Raises', 'Core', 'Bodyweight'],
  ['squat-hold', 'Squat Hold', 'Legs', 'Bodyweight'],
].map(([slug, name, bodyPart, equipment]) => ({
  slug,
  name,
  bodyPart,
  equipment,
  difficulty: 'Beginner',
  instructions: `Perform ${name.toLowerCase()} with controlled movement, maintain good posture, and stop if you feel pain.`,
}));

const FOCUS_EXERCISES = {
  'Full Body': [
    'squats', 'push-ups', 'glute-bridges', 'bird-dog', 'marching',
  ],
  'Upper Body': [
    'push-ups', 'incline-push-ups', 'dumbbell-press',
    'superman', 'arm-circles',
  ],
  'Lower Body': [
    'squats', 'lunges', 'glute-bridges', 'calf-raises', 'wall-sit',
  ],
  'Core': [
    'plank', 'side-plank', 'dead-bug', 'bird-dog', 'crunches',
  ],
  'Cardio': [
    'brisk-walk', 'marching', 'jumping-jacks',
    'high-knees', 'shadow-boxing',
  ],
  'Intervals': [
    'high-knees', 'mountain-climbers', 'jumping-jacks',
    'marching', 'brisk-walk',
  ],
  'Mobility': [
    'cat-cow', 'child-pose', 'hip-flexor-stretch',
    'hamstring-stretch', 'shoulder-stretch',
  ],
  'Recovery': [
    'brisk-walk', 'cat-cow', 'child-pose',
    'hamstring-stretch', 'shoulder-stretch',
  ],
  'Balance': [
    'standing-balance', 'heel-to-toe-walk',
    'bird-dog-balance', 'dead-bug', 'marching',
  ],
  'Strength': [
    'squats', 'push-ups', 'reverse-lunges',
    'glute-bridges', 'plank',
  ],
  'HIIT': [
    'burpees', 'mountain-climbers', 'high-knees',
    'squats', 'marching',
  ],
  'Push': [
    'push-ups', 'incline-push-ups', 'dumbbell-press',
    'wall-push-ups', 'arm-circles',
  ],
  'Pull': [
    'superman', 'bird-dog', 'hip-hinge',
    'shoulder-stretch', 'plank',
  ],
  'Steady Cardio': [
    'brisk-walk', 'marching', 'shadow-boxing',
    'standing-knee-raises', 'calf-raises',
  ],
  'Tempo Cardio': [
    'brisk-walk', 'jumping-jacks', 'high-knees',
    'shadow-boxing', 'marching',
  ],
  'Hips': [
    'hip-flexor-stretch', 'glute-bridges', 'lunges',
    'child-pose', 'squat-hold',
  ],
  'Upper Body Mobility': [
    'arm-circles', 'shoulder-stretch', 'cat-cow',
    'wall-push-ups', 'child-pose',
  ],
  'Hamstrings': [
    'hamstring-stretch', 'hip-hinge', 'glute-bridges',
    'cat-cow', 'brisk-walk',
  ],
  'Spine': [
    'cat-cow', 'child-pose', 'bird-dog',
    'superman', 'shoulder-stretch',
  ],
  'Core Stability': [
    'plank', 'side-plank', 'dead-bug',
    'bird-dog', 'standing-knee-raises',
  ],
  'Core Strength': [
    'plank', 'crunches', 'side-plank',
    'mountain-climbers', 'dead-bug',
  ],
};

const PROGRAMS = [
  {
    title: 'Foundation Fitness',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    lengthDays: 28,
    tags: ['beginner', 'fitness', 'full-body'],
    image: '',
    schedule: [
      'Full Body', 'Cardio', 'Lower Body', 'Mobility',
      'Upper Body', 'Core', 'Recovery',
    ],
  },
  {
    title: 'Strength Builder',
    goal: 'Strength and Muscle Building',
    difficulty: 'Intermediate',
    lengthDays: 42,
    tags: ['strength', 'muscle-building'],
    image: '',
    schedule: [
      'Upper Body', 'Lower Body', 'Push', 'Pull',
      'Strength', 'Core', 'Recovery',
    ],
  },
  {
    title: 'Cardio Endurance',
    goal: 'Cardiovascular Endurance',
    difficulty: 'Intermediate',
    lengthDays: 35,
    tags: ['cardio', 'endurance', 'conditioning'],
    image: '',
    schedule: [
      'Steady Cardio', 'Intervals', 'Lower Body', 'Mobility',
      'Tempo Cardio', 'Core', 'Recovery',
    ],
  },
  {
    title: 'Flexibility & Mobility',
    goal: 'Flexibility and Mobility',
    difficulty: 'Beginner',
    lengthDays: 28,
    tags: ['flexibility', 'mobility', 'recovery'],
    image: '',
    schedule: [
      'Mobility', 'Hips', 'Upper Body Mobility', 'Hamstrings',
      'Spine', 'Balance', 'Recovery',
    ],
  },
  {
    title: 'Advanced Shred',
    goal: 'Conditioning and Fat Loss',
    difficulty: 'Advanced',
    lengthDays: 56,
    tags: ['advanced', 'conditioning', 'fat-loss'],
    image: '',
    schedule: [
      'HIIT', 'Upper Body', 'Lower Body', 'Cardio',
      'Full Body', 'Core Strength', 'Recovery',
    ],
  },
  {
    title: 'Core & Balance',
    goal: 'Core Stability and Balance',
    difficulty: 'Beginner-Intermediate',
    lengthDays: 21,
    tags: ['core', 'balance', 'stability'],
    image: '',
    schedule: [
      'Core Stability', 'Balance', 'Mobility', 'Core Strength',
      'Lower Body', 'Balance', 'Recovery',
    ],
  },
];

async function seedPrograms() {
  // Upsert exercises first so every program references real Exercise IDs.
  const exerciseBySlug = new Map();

  for (const exercise of EXERCISES) {
    const saved = await Exercise.findOneAndUpdate(
      { slug: exercise.slug },
      { $set: exercise },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    exerciseBySlug.set(exercise.slug, saved._id);
  }

  let programCount = 0;
  let scheduledDayCount = 0;

  for (const definition of PROGRAMS) {
    const days = Array.from(
      { length: definition.lengthDays },
      (_, index) => {
        const focus = definition.schedule[index % definition.schedule.length];
        const exerciseSlugs = FOCUS_EXERCISES[focus];

        if (!exerciseSlugs || exerciseSlugs.length < 4 || exerciseSlugs.length > 8) {
          throw new Error(`Invalid exercise schedule for focus: ${focus}`);
        }

        return {
          dayNumber: index + 1,
          title: `Day ${index + 1}: ${focus}`,
          focus,
          exercises: exerciseSlugs.map((slug) => {
            const id = exerciseBySlug.get(slug);
            if (!id) throw new Error(`Missing seeded exercise: ${slug}`);
            return id;
          }),
        };
      }
    );

    const program = {
      title: definition.title,
      goal: definition.goal,
      difficulty: definition.difficulty,
      lengthDays: definition.lengthDays,
      days,
      tags: definition.tags,
      image: definition.image,
    };

    // Validate the complete document before persisting it.
    await new Program(program).validate();

    await Program.findOneAndUpdate(
      { title: program.title },
      { $set: program },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    programCount += 1;
    scheduledDayCount += days.length;
    console.log(`Seeded: ${program.title} (${days.length} days)`);
  }

  console.log(
    `Fitness seed complete: ${exerciseBySlug.size} exercises, ` +
    `${programCount} programs, ${scheduledDayCount} scheduled days.`
  );
}

module.exports = seedPrograms;
