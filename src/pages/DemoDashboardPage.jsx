import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Droplets,
  Flower2,
  Heart,
  HeartPulse,
  LockKeyhole,
  Moon,
  Sparkles,
  Sprout,
  Sun,
} from 'lucide-react';

const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
const weekDays = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(monday);
  date.setDate(monday.getDate() + index);
  return date;
});

const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(today);
const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(today);

const DemoDashboardPage = () => (
  <div className="min-h-screen bg-[#fff9f7] text-[#3a2029]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#eadbd8] bg-[#fffdfc] px-5 py-7 lg:flex">
      <Link to="/" className="mb-10 flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#800020] text-white"><Flower2 size={21} /></span>
        <span className="font-display text-2xl font-semibold">Bloomwell<span className="text-[#800020]">.</span></span>
      </Link>

      <p className="px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#9b7c82]">Your space</p>
      <nav aria-label="Demo navigation" className="mt-3 space-y-1">
        <a href="#overview" className="flex items-center gap-3 rounded-xl bg-[#f7e9e7] px-3 py-3 text-sm font-bold text-[#800020]"><Activity size={18} /> Overview</a>
        <a href="#cycle" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#72575e] transition hover:bg-[#fff3f1]"><CalendarDays size={18} /> Cycle calendar</a>
        <a href="#insights" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#72575e] transition hover:bg-[#fff3f1]"><HeartPulse size={18} /> My insights</a>
      </nav>

      <div className="mt-auto rounded-2xl bg-[#f8eeeb] p-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#800020]"><LockKeyhole size={17} /></div>
        <p className="font-display text-lg font-semibold">Your health, your way.</p>
        <p className="mt-1 text-xs leading-5 text-[#72575e]">Create an account to save your cycle and personal insights.</p>
        <Link to="/login" className="mt-4 flex items-center justify-between rounded-xl bg-[#800020] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#650018]">
          Get started <ArrowRight size={15} />
        </Link>
      </div>
      <p className="mt-5 px-2 text-[10px] text-[#9b7c82]">A little more in tune, every day.</p>
    </aside>

    <div className="lg:pl-64">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#eadbd8] bg-[#fff9f7]/95 px-5 backdrop-blur sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#800020] text-white"><Flower2 size={17} /></span>
          <span className="font-display text-xl font-semibold">Bloomwell<span className="text-[#800020]">.</span></span>
        </Link>
        <div className="hidden text-sm text-[#72575e] sm:block">{dateLabel}</div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#f7e9e7] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#800020] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#800020]" /> Demo mode</span>
          <Link to="/login" className="rounded-full px-3 py-2 text-sm font-bold text-[#72575e] transition hover:text-[#800020]">Sign in</Link>
          <Link to="/login" className="rounded-full bg-[#800020] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#650018] sm:text-sm">Create account</Link>
        </div>
      </header>

      <main id="overview" className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#9b7c82]">{dateLabel}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your cycle, at a glance<span className="text-[#800020]">.</span></h1>
            <p className="mt-2 text-sm text-[#72575e]">A little space to check in with yourself.</p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-[#eadbd8] bg-white px-3 py-2 text-xs font-semibold text-[#72575e]"><Sparkles size={15} className="text-[#800020]" /> Sample profile · Maya</span>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#f0d7d4] bg-[#fff1ef] px-4 py-3.5 text-sm text-[#68434d]">
          <CircleHelp size={18} className="mt-0.5 shrink-0 text-[#800020]" />
          <p><span className="font-bold">You’re viewing a demo.</span> This sample dashboard is for exploring Bloomwell—no personal health data is shown or saved.</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,.85fr)]">
          <section className="space-y-5">
            <article id="cycle" className="overflow-hidden rounded-[1.75rem] border border-[#eadbd8] bg-white shadow-[0_12px_40px_rgba(58,32,41,.05)]">
              <div className="grid md:grid-cols-[1.05fr_.95fr]">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.13em] text-[#9b7c82]"><span className="h-2 w-2 rounded-full bg-[#800020]" /> Current phase</div>
                  <h2 className="mt-3 font-display text-3xl font-semibold">Follicular phase</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#72575e]">Your energy may be on the way up. Take things at a pace that feels right for you.</p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div><p className="text-xs text-[#9b7c82]">Cycle day</p><p className="mt-1 text-lg font-extrabold">12 <span className="text-xs font-medium text-[#9b7c82]">of 28</span></p></div>
                    <div className="h-9 w-px bg-[#eadbd8]" />
                    <div><p className="text-xs text-[#9b7c82]">Next period</p><p className="mt-1 text-lg font-extrabold">In 16 days</p></div>
                  </div>
                  <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#800020] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#650018]">Track your cycle <ArrowRight size={16} /></Link>
                </div>
                <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-[#fbf2ef] p-6">
                  <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#f5dfdb]" />
                  <div className="absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-[#f7e9e7]" />
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[14px] border-[#f0dcda]">
                    <div className="absolute inset-[-14px] rotate-[35deg] rounded-full border-[14px] border-transparent border-t-[#800020] border-r-[#800020]" />
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-[.15em] text-[#9b7c82]">Cycle day</p>
                      <p className="font-display text-6xl font-semibold text-[#800020]">12</p>
                      <p className="mt-1 text-xs font-semibold text-[#72575e]">Follicular</p>
                    </div>
                  </div>
                  <div className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#800020] shadow-sm"><Sun size={20} /></div>
                  <div className="absolute bottom-8 left-8 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#800020] shadow-sm"><Sprout size={20} /></div>
                </div>
              </div>
              <div className="border-t border-[#f1e7e4] px-6 py-5 sm:px-8">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-sm font-extrabold">{monthLabel}</p><p className="mt-1 text-xs text-[#9b7c82]">Your week in the cycle</p></div>
                  <button type="button" aria-label="Notifications" className="rounded-full p-2 text-[#9b7c82] hover:bg-[#fff3f1]"><Bell size={17} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-3">
                  {weekDays.map((date) => {
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                      <div key={date.toISOString()} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#9b7c82]">{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date)}</span>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-[#800020] text-white' : 'text-[#72575e]'}`}>{date.getDate()}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${date.getDate() % 6 === 0 ? 'bg-[#e2a4a4]' : 'bg-transparent'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-[#eadbd8] bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0ef] text-[#a34c5b]"><Droplets size={19} /></div>
                <p className="mt-4 text-xs font-semibold text-[#9b7c82]">Period estimate</p>
                <p className="mt-1 font-display text-xl font-semibold">16 days away</p>
                <p className="mt-1 text-xs text-[#9b7c82]">Based on a sample 28-day cycle</p>
              </article>
              <article className="rounded-2xl border border-[#eadbd8] bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4efff] text-[#7857a4]"><Heart size={19} /></div>
                <p className="mt-4 text-xs font-semibold text-[#9b7c82]">Fertile window</p>
                <p className="mt-1 font-display text-xl font-semibold">In 2 days</p>
                <p className="mt-1 text-xs text-[#9b7c82]">An estimate, not a guarantee</p>
              </article>
              <article className="rounded-2xl border border-[#eadbd8] bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ed] text-[#557958]"><Moon size={19} /></div>
                <p className="mt-4 text-xs font-semibold text-[#9b7c82]">Today’s check-in</p>
                <p className="mt-1 font-display text-xl font-semibold">Not logged yet</p>
                <Link to="/login" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#800020]">Add a check-in <ChevronRight size={13} /></Link>
              </article>
            </div>
          </section>

          <aside id="insights" className="space-y-5">
            <article className="rounded-[1.75rem] border border-[#eadbd8] bg-white p-6 shadow-[0_12px_40px_rgba(58,32,41,.05)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7e9e7] text-[#800020]"><Sparkles size={19} /></div>
                <span className="rounded-full bg-[#f7e9e7] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#800020]">Sample insight</span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold">Patterns, with perspective.</h2>
              <p className="mt-2 text-sm leading-6 text-[#72575e]">Your demo cycle suggests your energy often rises after your period. Personal patterns become clearer as you log over time.</p>
              <div className="mt-5 rounded-2xl bg-[#fbf5f2] p-4">
                <div className="mb-3 flex items-center justify-between text-xs"><span className="font-bold">Energy trend</span><span className="text-[#9b7c82]">Example data</span></div>
                <div className="flex h-20 items-end gap-2">
                  {[34, 45, 37, 58, 49, 69, 78, 64, 86, 74, 91, 82].map((height, index) => (
                    <span key={index} className={`flex-1 rounded-t-md ${index === 8 ? 'bg-[#800020]' : 'bg-[#e8c5c6]'}`} style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-[#9b7c82]"><span>Period</span><span>Today</span></div>
              </div>
              <Link to="/login" className="mt-5 flex items-center justify-between rounded-xl border border-[#eadbd8] px-4 py-3 text-sm font-bold text-[#800020] transition hover:bg-[#fff9f7]">
                Explore your insights <ArrowRight size={16} />
              </Link>
            </article>

            <article className="rounded-[1.75rem] bg-[#3a2029] p-6 text-[#fff9f7]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#efc5c9]"><HeartPulse size={16} /> A gentle reminder</div>
              <p className="mt-4 font-display text-2xl leading-snug">You don’t have to track everything to understand your body.</p>
              <p className="mt-3 text-sm leading-6 text-[#f4e3e1]">Start with what matters to you. Bloomwell is here when you’re ready.</p>
              <Link to="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fff9f7] px-4 py-2.5 text-sm font-extrabold text-[#800020] transition hover:bg-white">Make it yours <Check size={15} /></Link>
            </article>
          </aside>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#eadbd8] py-5 text-[11px] text-[#9b7c82]">
          <span>Bloomwell · A gentler way to understand your cycle.</span>
          <span className="flex items-center gap-1.5"><LockKeyhole size={12} /> Your health data is personal and private.</span>
        </footer>
      </main>
    </div>
  </div>
);

export default DemoDashboardPage;
