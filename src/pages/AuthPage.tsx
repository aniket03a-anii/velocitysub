import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess }) => {
  const { login, register, loginAsDemo, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [name, setName] = useState('Anaghraj S. Thakur');
  const [email, setEmail] = useState('you@studio.com');
  const [password, setPassword] = useState('Velocity2026!');
  const [confirmPassword, setConfirmPassword] = useState('Velocity2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to create workspace account.');
      }
    } else if (mode === 'forgot') {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessMsg('Reset instructions sent to your email.');
      } else {
        setErrorMsg(res.error || 'Failed to send reset link.');
      }
    }

    setLoading(false);
  };

  const handleQuickDemo = () => {
    loginAsDemo();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F2F0E7] text-[#092326] flex items-center justify-center p-6 md:p-12 antialiased selection:bg-[#E4EBD8]">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* LEFT COLUMN (Exact layout & editorial typography from image.png) */}
        <div className="space-y-6 md:pr-4">
          <h1 className="font-serif text-5xl lg:text-6xl font-normal tracking-tight text-[#092326] leading-[1.08]">
            Your work,<br />
            kept in ink.
          </h1>
          <p className="text-sm text-[#526064] font-sans max-w-sm leading-relaxed">
            One quiet workspace for your subscription, analytics and notifications — nothing more, nothing louder.
          </p>

          <div className="pt-2 hidden md:block">
            <span className="text-[11px] font-mono text-[#526064] uppercase tracking-wider">
              Velocity Workspace · v2.4
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN (Exact form card & typography from image.png) */}
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl lg:text-4xl font-normal text-[#092326] tracking-tight">
              {mode === 'forgot' ? 'Reset password' : 'Welcome back'}
            </h2>
            <p className="text-xs text-[#526064] font-sans">
              {mode === 'forgot'
                ? 'Enter your email to receive recovery instructions.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign in / Sign up segmented pill) */}
          {mode !== 'forgot' && (
            <div className="flex p-0.5 bg-[#FBF9F3] border border-[#D8D5CA] rounded-[6px] text-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-[4px] font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-[#092326] text-[#FBF9F3] shadow-xs'
                    : 'text-[#526064] hover:text-[#092326]'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-[4px] font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-[#092326] text-[#FBF9F3] shadow-xs'
                    : 'text-[#526064] hover:text-[#092326]'
                }`}
              >
                Sign up
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-[6px] text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#E4EBD8] border border-[#D8D5CA] text-[#092326] rounded-[6px] text-xs">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anaghraj S. Thakur"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F3] border border-[#D8D5CA] rounded-[6px] text-[#092326] placeholder-[#526064]/50 focus:outline-none focus:ring-1 focus:ring-[#092326]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full px-3.5 py-2.5 bg-[#FBF9F3] border border-[#D8D5CA] rounded-[6px] text-[#092326] placeholder-[#526064]/50 focus:outline-none focus:ring-1 focus:ring-[#092326]"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">
                    PASSWORD
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#526064] hover:text-[#092326] underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FBF9F3] border border-[#D8D5CA] rounded-[6px] text-[#092326] placeholder-[#526064]/50 focus:outline-none focus:ring-1 focus:ring-[#092326] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526064] hover:text-[#092326]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">
                  CONFIRM PASSWORD
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F3] border border-[#D8D5CA] rounded-[6px] text-[#092326] placeholder-[#526064]/50 focus:outline-none focus:ring-1 focus:ring-[#092326] font-mono"
                />
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#092326] text-[#FBF9F3] hover:bg-[#14393d] rounded-[6px] font-medium text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {mode === 'login'
                ? 'Sign in'
                : mode === 'register'
                ? 'Create account'
                : 'Send reset instructions'}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#526064] hover:text-[#092326] underline"
              >
                ← Back to sign in
              </button>
            </div>
          )}

          {/* Social Continue Divider (image.png) */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-[#D8D5CA] w-full" />
            <span className="bg-[#F2F0E7] px-3 text-[11px] text-[#526064] absolute font-sans">
              or continue with
            </span>
          </div>

          {/* Google Button (image.png) */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 bg-[#FBF9F3] border border-[#D8D5CA] hover:bg-white text-[#092326] rounded-[6px] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* Quick Demo Workspace Access */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 text-[11px] font-semibold text-[#092326] bg-[#E4EBD8] hover:bg-[#d8e4c7] border border-[#D8D5CA] rounded-[6px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#092326]" />
              <span>Launch Velocity Demo Workspace (347 Statements)</span>
            </button>
          </div>

          {/* Legal disclaimer (image.png) */}
          <p className="text-center text-[11px] text-[#526064] pt-2">
            By continuing you agree to Velocity's{' '}
            <span className="underline cursor-pointer hover:text-[#092326]">Terms</span> and{' '}
            <span className="underline cursor-pointer hover:text-[#092326]">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
