import { motion } from 'framer-motion';
import { Activity, ChevronRight, Droplets, Footprints, HeartPulse, Moon, Sparkles, ThumbsDown, ThumbsUp, Utensils } from 'lucide-react';

const config = {
  nutrition: { icon: Utensils, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200', label: 'Nutrition' },
  activity: { icon: Footprints, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200', label: 'Movement' },
  symptom: { icon: HeartPulse, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200', label: 'Symptom care' },
  sleep: { icon: Moon, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200', label: 'Sleep' },
  wellness: { icon: Sparkles, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200', label: 'Wellness' },
};

const iconByName = { 'heart-pulse': HeartPulse, utensils: Utensils, footprints: Footprints, moon: Moon, sparkles: Sparkles, droplets: Droplets };

const RecommendationCard = ({ recommendation, onDismiss, onRate }) => {
  const style = config[recommendation.content?.category] || config.wellness;
  const Icon = iconByName[recommendation.content?.icon] || style.icon;
  return <motion.article drag="x" dragConstraints={{ left: -80, right: 80 }} dragElastic={0.2} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80) onDismiss(recommendation._id); }} layout className="group relative min-w-[min(19rem,82vw)] snap-start rounded-2xl border border-blue-100/80 bg-[#fff5f5]/75 p-5 shadow-soft backdrop-blur transition hover:-translate-y-1 dark:border-navy-700/70 dark:bg-navy-900/75"><div className="mb-5 flex items-start justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.color}`}><Icon size={19} /></div><button type="button" onClick={() => onDismiss(recommendation._id)} aria-label={`Dismiss ${recommendation.content?.title}`} className="focus-ring rounded-full p-1 text-[var(--color-muted)] opacity-60 transition hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"><ChevronRight size={17} /></button></div><p className="mb-2 text-[11px] font-bold   text-[var(--color-muted)]">{style.label}</p><h3 className="font-display text-xl font-semibold leading-tight">{recommendation.content?.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{recommendation.content?.body}</p><div className="mt-4 flex gap-1 border-t border-blue-100 pt-2 dark:border-navy-700"><span className="mr-1 text-[10px] text-[var(--color-muted)]">Useful?</span><button type="button" onClick={() => onRate?.(recommendation, 'positive')} aria-label="Helpful recommendation" className="focus-ring rounded-md p-1 text-[var(--color-muted)] hover:bg-blue-100 hover:text-blue-600"><ThumbsUp size={13} /></button><button type="button" onClick={() => onRate?.(recommendation, 'negative')} aria-label="Unhelpful recommendation" className="focus-ring rounded-md p-1 text-[var(--color-muted)] hover:bg-blue-100 hover:text-blue-600"><ThumbsDown size={13} /></button></div></motion.article>;
};

export const RecommendationSkeleton = () => <div className="min-w-[min(19rem,82vw)] animate-pulse rounded-2xl border border-blue-100 bg-[#fff5f5]/60 p-5 dark:border-navy-700 dark:bg-navy-900/60"><div className="mb-5 h-10 w-10 rounded-xl bg-blue-100 dark:bg-navy-700" /><div className="mb-3 h-2 w-20 rounded bg-blue-100 dark:bg-navy-700" /><div className="h-5 w-3/4 rounded bg-blue-100 dark:bg-navy-700" /><div className="mt-4 space-y-2"><div className="h-3 w-full rounded bg-blue-100 dark:bg-navy-700" /><div className="h-3 w-5/6 rounded bg-blue-100 dark:bg-navy-700" /></div></div>;

export default RecommendationCard;
