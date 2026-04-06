import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from './useLogin';
import axios from 'axios';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const errorMessage =
    error !== null && axios.isAxiosError(error)
      ? (error.response?.data as { message?: string })?.message ?? 'Login failed'
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-brand mb-6 text-center">
          TM Scheduler
        </h1>

        <form onSubmit={handleSubmit((values) => login(values))} noValidate>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              {...register('username')}
            />
            {errors.username && (
              <p role="alert" className="text-danger text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              {...register('password')}
            />
            {errors.password && (
              <p role="alert" className="text-danger text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p role="alert" className="text-danger text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
