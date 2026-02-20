'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    houseAddress: '',
    communityName: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Trigger storage event to update auth state in other components
      window.dispatchEvent(new Event('storage'));

      // Role-based redirect: Admin → admin dashboard, User → dashboard
      // Use window.location.href for full page reload to ensure state is synced
      if (data.user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-1 text-center text-sm text-black">Select your role and community</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <Input
              label="Community Name"
              type="text"
              required
              placeholder="Your community or area name"
              value={formData.communityName}
              onChange={(e) =>
                setFormData({ ...formData, communityName: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Role
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'USER' | 'ADMIN',
                  })
                }
              >
                <option value="USER">User (Community Member)</option>
                <option value="ADMIN">Admin (Community Authority)</option>
              </select>
            </div>
            <Input
              label={formData.role === 'USER' ? 'House Address (Required)' : 'House Address (Optional)'}
              type="text"
              required={formData.role === 'USER'}
              placeholder={formData.role === 'USER' ? 'Street, city, zip' : 'Optional for admin'}
              value={formData.houseAddress}
              onChange={(e) =>
                setFormData({ ...formData, houseAddress: e.target.value })
              }
            />
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
