import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, HeartPulse, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const passwordScore = (password) => [password.length >= 6, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const score = passwordScore(form.password);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = isLogin ? await login(form.email, form.password) : await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error);
  };

  return (
    <main className="min-h-screen bg-[#f7d6d0] p-3 text-[#3a2029] sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#e2b4bd] bg-[#fff5f5] shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#e2b4bd] p-12 text-[#3a2029] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[42px] border-[#800020]/30" />
          <div className="absolute bottom-20 -left-24 h-80 w-80 rounded-full border-[58px] border-[#800020]/20" />
          <div className="relative"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#800020] text-[#fff5f5]"><HeartPulse size={23} /></div><p className="mb-3 text-xs font-bold text-[#800020]">Bloomwell AI</p><h1 className="max-w-sm font-display text-5xl font-semibold leading-[1.05]">Your body has a rhythm. We help you hear it.</h1></div>
          <div className="relative max-w-sm rounded-2xl border border-[#3a2029]/10 bg-[#fff5f5]/40 p-5 backdrop-blur"><p className="font-display text-2xl leading-tight">“Small signals become powerful insights when you see them together.”</p><div className="mt-5 flex items-center gap-2 text-sm text-[#3a2029]/70"><span className="h-2 w-2 rounded-full bg-[#800020]" />Private by design · Yours to explore</div></div>
        </section>
        <section className="flex items-center px-6 py-10 sm:px-14 lg:px-20">
          <div className="w-full max-w-md"><div className="mb-10 lg:hidden"><p className="font-display text-2xl font-semibold">Bloomwell<span className="text-blue-500">.</span></p></div><div className="mb-8"><p className="mb-2 text-sm font-bold   text-blue-500">A gentler way to track</p><h2 className="font-display text-4xl font-semibold">{isLogin ? 'Welcome back' : 'Start your care story'}</h2><p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{isLogin ? 'Your patterns are waiting for you.' : 'Create a private space for your cycle and wellbeing.'}</p></div>
            {error && <div role="alert" className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-navy-700 dark:text-blue-100">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence initial={false} mode="popLayout">{!isLogin && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><label className="relative block"><UserRound className="absolute left-4 top-4 text-[var(--color-muted)]" size={18} /><input value={form.name} onChange={update('name')} required={!isLogin} placeholder=" " className="peer focus-ring w-full rounded-xl border border-blue-100 bg-transparent px-11 pb-3 pt-5 text-sm outline-none transition focus:border-blue-500 dark:border-navy-700" /><span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-[#f7d6d0] px-1 text-sm text-[var(--color-muted)] transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs dark:bg-navy-900">Your name</span></label></motion.div>}</AnimatePresence>
              <label className="relative block"><Mail className="absolute left-4 top-4 text-[var(--color-muted)]" size={18} /><input type="email" value={form.email} onChange={update('email')} required placeholder=" " className="peer focus-ring w-full rounded-xl border border-blue-100 bg-transparent px-11 pb-3 pt-5 text-sm outline-none transition focus:border-blue-500 dark:border-navy-700" /><span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-[#f7d6d0] px-1 text-sm text-[var(--color-muted)] transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs dark:bg-navy-900">Email address</span></label>
              <label className="relative block"><LockKeyhole className="absolute left-4 top-4 text-[var(--color-muted)]" size={18} /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} minLength={6} required placeholder=" " className="peer focus-ring w-full rounded-xl border border-blue-100 bg-transparent px-11 pb-3 pt-5 pr-12 text-sm outline-none transition focus:border-blue-500 dark:border-navy-700" /><span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-[#f7d6d0] px-1 text-sm text-[var(--color-muted)] transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs dark:bg-navy-900">Password</span><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="focus-ring absolute right-3 top-3 rounded-lg p-1 text-[var(--color-muted)] hover:text-blue-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></label>
              {!isLogin && <div aria-label={`Password strength ${score} of 4`} className="flex gap-1">{[0, 1, 2, 3].map((item) => <span key={item} className={`h-1 flex-1 rounded-full ${item < score ? 'bg-blue-500' : 'bg-blue-100 dark:bg-navy-700'}`} />)}</div>}
              <button disabled={loading} type="submit" className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-4 text-sm font-bold text-[#fff5f5] shadow-soft transition hover:bg-blue-600 active:scale-[.99] disabled:opacity-60">{loading ? 'Please wait...' : isLogin ? 'Enter Bloomwell' : 'Create my account'} {!loading && <ArrowRight size={17} />}</button>
            </form>
            <button type="button" onClick={() => { setIsLogin((value) => !value); setError(''); }} className="focus-ring mt-7 flex w-full items-center justify-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-blue-600">{isLogin ? 'New to Bloomwell? Create an account' : 'Already have an account? Sign in'} {isLogin && <Check size={15} />}</button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
