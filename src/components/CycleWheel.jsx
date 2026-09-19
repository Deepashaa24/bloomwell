import { motion } from 'framer-motion';
import { addDays, differenceInDays } from 'date-fns';

const phases = [
  { name: 'Menstrual', color: '#800020', soft: '#f7d6d0' },
  { name: 'Follicular', color: '#800020', soft: '#f7d6d0' },
  { name: 'Ovulation', color: '#800020', soft: '#d48d9a' },
  { name: 'Luteal', color: '#800020', soft: '#d48d9a' },
];

const point = (center, radius, angle) => ({
  x: center + radius * Math.cos((angle - 90) * Math.PI / 180),
  y: center + radius * Math.sin((angle - 90) * Math.PI / 180),
});

const sectorPath = (center, innerRadius, outerRadius, startAngle, endAngle) => {
  const outerStart = point(center, outerRadius, startAngle);
  const outerEnd = point(center, outerRadius, endAngle);
  const innerEnd = point(center, innerRadius, endAngle);
  const innerStart = point(center, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`;
};

const phaseForDay = (day, cycleLength, periodLength) => {
  const ovulationDay = Math.floor(cycleLength / 2);
  const fertileStart = ovulationDay - 2;
  const fertileEnd = ovulationDay + 2;
  if (day <= periodLength) return phases[0];
  if (day < fertileStart) return phases[1];
  if (day <= fertileEnd) return phases[2];
  return phases[3];
};

const CycleWheel = ({ prediction, settings, cycleStartDate, onDaySelect }) => {
  const cycleLength = prediction?.cycleLength || settings?.cycleLength || 28;
  const periodLength = settings?.periodLength || 5;
  const currentDay = Math.min(Math.max(prediction?.currentCycleDay || 1, 1), cycleLength);
  const daysUntil = Math.max(prediction?.daysUntilNextPeriod || 0, 0);
  const ovulationDay = Math.floor(cycleLength / 2);
  const fertileStart = ovulationDay - 2;
  const fertileEnd = ovulationDay + 2;
  const pregnancyChance = currentDay >= fertileStart && currentDay <= fertileEnd ? (currentDay === ovulationDay ? 'High' : 'Medium') : 'Low';
  const center = 180;
  const outerRadius = 126;
  const innerRadius = 91;
  const step = 360 / cycleLength;
  const cycleStart = cycleStartDate ? new Date(cycleStartDate) : new Date();
  const marker = point(center, outerRadius + 7, (currentDay - 0.5) * step);

  return (
    <section className="app-surface overflow-hidden p-4 sm:p-7" aria-labelledby="cycle-wheel-title">
      <div className="mb-3 flex items-start justify-between gap-4"><div><p className="text-xs font-bold   text-blue-500">Your rhythm at a glance</p><h2 id="cycle-wheel-title" className="font-display text-2xl font-semibold sm:text-3xl">Today in your cycle</h2></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 dark:bg-navy-700 dark:text-blue-100">{prediction?.currentPhase || 'Tracking'}</span></div>
      <div className="relative mx-auto aspect-square w-full max-w-[27rem]">
        <svg viewBox="0 0 360 360" className="h-full w-full" role="img" aria-label={`Cycle wheel, current cycle day ${currentDay} of ${cycleLength}`}>
          <circle cx={center} cy={center} r={outerRadius + 1} fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth="2" />
          {Array.from({ length: cycleLength }, (_, index) => {
            const day = index + 1;
            const startAngle = index * step + 0.8;
            const endAngle = (index + 1) * step - 0.8;
            const phase = phaseForDay(day, cycleLength, periodLength);
            const isPast = day <= currentDay;
            return <motion.path key={day} d={sectorPath(center, innerRadius, outerRadius, startAngle, endAngle)} fill={isPast ? phase.color : phase.soft} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: isPast ? 1 : 0.65, pathLength: 1 }} transition={{ delay: index * 0.015, duration: 0.45 }} onClick={() => onDaySelect?.(addDays(cycleStart, day - 1))} className="cursor-pointer outline-none transition-[filter] hover:brightness-95 focus:brightness-90" role="button" tabIndex="0" aria-label={`Cycle day ${day}, ${phase.name} phase`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onDaySelect?.(addDays(cycleStart, day - 1)); }} />;
          })}
          {Array.from({ length: cycleLength }, (_, index) => {
            const day = index + 1;
            const location = point(center, outerRadius + 22, (day - 0.5) * step);
            return <text key={`day-${day}`} x={location.x} y={location.y} textAnchor="middle" dominantBaseline="middle" className={`cursor-pointer select-none text-[9px] font-semibold sm:text-[10px] ${day === currentDay ? 'fill-[var(--color-ink)]' : 'fill-[var(--color-muted)]'}`} onClick={() => onDaySelect?.(addDays(cycleStart, day - 1))}>{day}</text>;
          })}
          <motion.circle cx={marker.x} cy={marker.y} r="7" fill="#800020" stroke="#f7d6d0" strokeWidth="4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }} />
          <circle cx={center} cy={center} r={innerRadius - 5} fill="var(--color-canvas)" />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"><p className="font-display text-4xl font-semibold sm:text-5xl">Day {currentDay}</p><p className="mt-1 text-xs font-semibold  tracking-wider text-[var(--color-muted)]">{daysUntil} days until next period</p><p className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${pregnancyChance === 'High' ? 'bg-blue-100 text-blue-700' : pregnancyChance === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>{pregnancyChance} chance of pregnancy today</p></div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-[var(--color-muted)] sm:gap-x-6"><Legend color={phases[0].color} label="Menstrual" /><Legend color={phases[1].color} label="Follicular" /><Legend color={phases[2].color} label="Ovulation" /><Legend color={phases[3].color} label="Luteal" /></div>
      <p className="mt-3 text-center text-[11px] text-[var(--color-muted)]">Tap a day to open its check-in</p>
    </section>
  );
};

const Legend = ({ color, label }) => <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>;

export default CycleWheel;
