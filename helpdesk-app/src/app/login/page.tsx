'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed');
                setIsLoading(false);
                return;
            }

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            router.push(`/${data.user.role}`);
        } catch (err) {
            console.error('Login error:', err);
            setError('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    // Quick login for development
    const quickLogin = async (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            router.push(`/${data.user.role}`);
        } catch (err) {
            console.error('Login error:', err);
            setError('Something went wrong.');
            setIsLoading(false);
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
                    <h1 className="text-3xl font-bold text-slate-900">Vastel HelpDesk</h1>
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

                    {/* Quick Login Buttons (Dev Only) */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-400 text-center mb-3">Quick Login (Development)</p>

                        {/* Senior CS */}
                        <div className="mb-3">
                            <p className="text-xs font-medium text-slate-500 mb-2">Senior CS</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => quickLogin('dewi@vastel.co.id', 'senior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-[#EB4C36]/10 hover:bg-[#EB4C36]/20 text-[#EB4C36] text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Dewi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('reza@vastel.co.id', 'senior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-[#EB4C36]/10 hover:bg-[#EB4C36]/20 text-[#EB4C36] text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Reza
                                </button>
                            </div>
                        </div>

                        {/* Junior CS */}
                        <div className="mb-3">
                            <p className="text-xs font-medium text-slate-500 mb-2">Junior CS</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => quickLogin('siti@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Siti
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('agus@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Agus
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('putri@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Putri
                                </button>
                                {/* New Agents */}
                                <button
                                    type="button"
                                    onClick={() => quickLogin('budi@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Budi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('dewi.k@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Dewi K.
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('rizky@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Rizky
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('rina@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Rina
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('bayu@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Bayu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('fara@vastel.co.id', 'junior123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Fara
                                </button>
                            </div>
                        </div>

                        {/* IT Support */}
                        <div className="mb-3">
                            <p className="text-xs font-medium text-slate-500 mb-2">IT Support</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => quickLogin('bambang@vastel.co.id', 'it123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Bambang
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('eko@vastel.co.id', 'it123')}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Eko
                                </button>
                            </div>
                        </div>

                        {/* Admin */}
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-2">Admin</p>
                            <button
                                type="button"
                                onClick={() => quickLogin('samuel@vastel.co.id', 'admin123')}
                                disabled={isLoading}
                                className="w-full px-3 py-2 bg-slate-800/10 hover:bg-slate-800/20 text-slate-800 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Samuel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-400 mt-6">
                    © 2024 Vastel Indonesia. All rights reserved.
                </p>
            </div>
        </div>
    );
}
