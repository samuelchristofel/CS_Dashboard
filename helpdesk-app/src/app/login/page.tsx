'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const users = [
    { email: 'jay@helpdesk.com', password: 'senior123', role: 'senior', name: 'Jay Won' },
    { email: 'himari@helpdesk.com', password: 'junior123', role: 'junior', name: 'Himari' },
    { email: 'budi@helpdesk.com', password: 'it123', role: 'it', name: 'Budi Santoso' },
    { email: 'admin@helpdesk.com', password: 'admin123', role: 'admin', name: 'Admin' },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // In real app, this would set a cookie/session
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role - all roles use /{role} now
            router.push(`/${user.role}`);
        } else {
            setError('Invalid email or password');
        }

        setIsLoading(false);
    };

    const quickLogin = (role: string) => {
        const user = users.find(u => u.role === role);
        if (user) {
            setEmail(user.email);
            setPassword(user.password);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#EB4C36] text-white shadow-lg shadow-[#EB4C36]/30 mb-4">
                        <span className="material-symbols-outlined text-4xl">support_agent</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">HelpDesk</h1>
                    <p className="text-slate-500 mt-2">Customer Support System</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-soft p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Sign In</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#EB4C36] hover:bg-[#d13a25] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-[#EB4C36]/30 disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Quick Login Buttons */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Quick Login (Demo)</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => quickLogin('senior')}
                                className="px-3 py-2 bg-[#EB4C36]/10 text-[#EB4C36] rounded-lg text-sm font-medium hover:bg-[#EB4C36]/20 transition-colors"
                            >
                                Senior CS
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('junior')}
                                className="px-3 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                            >
                                Junior CS
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('it')}
                                className="px-3 py-2 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
                            >
                                IT Support
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('admin')}
                                className="px-3 py-2 bg-slate-900/10 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-900/20 transition-colors"
                            >
                                Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
