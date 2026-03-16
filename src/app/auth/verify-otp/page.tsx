'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/lib/store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function VerifyOtpPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Include credentials to receive httpOnly cookie from server
          credentials: 'include',
          body: JSON.stringify({
            phone: formData.phone,
            code: formData.code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      if (data.success && data.data) {
        dispatch(
          setCredentials({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            user: data.data.user,
          })
        );

        // Redirect based on user role
        const roleMap: Record<string, string> = {
          SUPER_ADMIN: '/dashboard/super-admin',
          SCHOOL_ADMIN: '/dashboard/school',
          TEACHER: '/dashboard/teacher',
          STUDENT: '/dashboard/student',
        };
        router.push(roleMap[data.data.user.role] || '/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <Card className="w-full max-w-md border-[var(--light-border)] dark:border-[#1a1f2e] dark:bg-[#0f141a]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[var(--light-text-primary)] dark:text-white">
            Claim Your Account
          </CardTitle>
          <p className="text-sm text-[var(--light-text-secondary)] dark:text-[#9ca3af] text-center mt-2">
            Enter the OTP code sent to your phone to activate your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+2348012345678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              className="dark:bg-[#151a23] dark:border-[#1a1f2e] dark:text-white"
            />

            <Input
              label="OTP Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })
              }
              required
              className="dark:bg-[#151a23] dark:border-[#1a1f2e] dark:text-white"
            />

            <Button
              type="submit"
              className="w-full py-4"
              isLoading={isLoading}
              disabled={!formData.phone || !formData.code}
            >
              Verify & Activate Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

