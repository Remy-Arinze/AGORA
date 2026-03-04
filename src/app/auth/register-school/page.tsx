'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useRegisterSchoolMutation } from '@/lib/store/api/publicApi';

export default function RegisterSchoolPage() {
    const [registerSchool, { isLoading }] = useRegisterSchoolMutation();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria',
        hasPrimary: false,
        hasSecondary: false,
        hasTertiary: false,
        registrationNote: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerEmail: '',
        ownerPhone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhoneChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!formData.hasPrimary && !formData.hasSecondary && !formData.hasTertiary) {
            setError('Please select at least one school type.');
            return;
        }

        try {
            const response = await registerSchool(formData).unwrap();
            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            setError(
                err?.data?.message || err?.message || 'An error occurred during registration.'
            );
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-[#151a23] p-8 rounded-xl border border-[#1a1f2e] text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted</h2>
                    <p className="text-[#9ca3af] mb-6">
                        Thank you for registering your school on Agora. Your application is currently under review by our administration team. You will be notified via email once your account has been verified.
                    </p>
                    <Link href="/auth/login" className="text-[#2490FD] hover:text-white transition-colors">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-center mb-8">
                    <Image
                        src="/assets/logos/agora_worded_white.png"
                        alt="Agora"
                        width={100}
                        height={24}
                        className="h-6 w-auto"
                        priority
                    />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3 text-center">
                    Register Your School
                </h1>
                <p className="text-[#9ca3af] text-center mb-8">
                    Join Agora to streamline your school's management.
                </p>

                <form onSubmit={handleSubmit} className="bg-[#151a23] p-6 sm:p-8 rounded-xl border border-[#1a1f2e] space-y-8">
                    {error && (
                        <Alert variant="error">{error}</Alert>
                    )}

                    {/* School Details */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4 border-b border-[#1a1f2e] pb-2">School Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-white mb-1">School Name *</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="Official School Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">School Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="contact@school.com"
                                />
                            </div>
                            <PhoneInput
                                label="School Phone"
                                required
                                value={formData.phone}
                                onChange={(val) => handlePhoneChange('phone', val)}
                                placeholder="8012345678"
                                labelClassName="text-white"
                            />
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-white mb-1">Address</label>
                                <input
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="123 School Road"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">City</label>
                                <input
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="Lagos"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">State</label>
                                <input
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="Lagos State"
                                />
                            </div>
                        </div>
                    </div>

                    {/* School Type */}
                    <div>
                        <h2 className="text-sm text-white mb-4 border-b border-[#1a1f2e] pb-2">School Type *</h2>
                        <div className="flex flex-wrap gap-6 text-xs">
                            <label className="flex items-center gap-2 text-white cursor-pointer hover:text-blue-400 transition-colors">
                                <input
                                    type="checkbox"
                                    name="hasPrimary"
                                    checked={formData.hasPrimary}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                />
                                Primary Education
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer hover:text-blue-400 transition-colors">
                                <input
                                    type="checkbox"
                                    name="hasSecondary"
                                    checked={formData.hasSecondary}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                />
                                Secondary Education
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer hover:text-blue-400 transition-colors">
                                <input
                                    type="checkbox"
                                    name="hasTertiary"
                                    checked={formData.hasTertiary}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                />
                                Tertiary Education
                            </label>
                        </div>
                    </div>

                    {/* Owner Details */}
                    <div>
                        <h2 className="text-sm text-white mb-4 border-b border-[#1a1f2e] pb-2">School Owner Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">First Name *</label>
                                <input
                                    name="ownerFirstName"
                                    type="text"
                                    required
                                    value={formData.ownerFirstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Last Name *</label>
                                <input
                                    name="ownerLastName"
                                    type="text"
                                    required
                                    value={formData.ownerLastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Email *</label>
                                <input
                                    name="ownerEmail"
                                    type="email"
                                    required
                                    value={formData.ownerEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 rounded-lg bg-[#0d1117] text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#2490FD] focus:border-[#2490FD] transition-all border-[#1a1f2e]"
                                    placeholder="owner@school.com"
                                />
                            </div>
                            <PhoneInput
                                label="Owner Phone"
                                required
                                value={formData.ownerPhone}
                                onChange={(val) => handlePhoneChange('ownerPhone', val)}
                                placeholder="8012345678"
                                labelClassName="text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3.5 text-lg"
                            isLoading={isLoading}
                        >
                            Submit Registration
                        </Button>
                        <div className="text-center mt-4">
                            <Link href="/auth/login" className="text-sm text-[#9ca3af] hover:text-[#2490FD] hover:underline transition-colors border-b border-transparent">
                                Already have an account? Sign In
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
