import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().url({ message: "Must be a valid URL" }),
  JWT_SECRET: z.string().min(8, { message: "Secret must be at least 8 characters long" }),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid or missing environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }
  return result.data;
};