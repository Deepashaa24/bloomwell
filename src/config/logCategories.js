import {
  Activity,
  Brain,
  CalendarDays,
  CircleDot,
  Droplets,
  Dumbbell,
  Flame,
  Flower2,
  HeartPulse,
  Moon,
  Salad,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';

const option = (value, label, Icon) => ({ value, label, Icon });

export const logCategories = [
  { id: 'flow', label: 'Flow', field: 'flow', multi: false, color: 'red', options: [option('light', 'Light', Droplets), option('medium', 'Medium', Droplets), option('heavy', 'Heavy', Droplets), option('super_heavy', 'Super heavy', Droplets)] },
  { id: 'spotting', label: 'Spotting', field: 'spotting', multi: true, color: 'red', options: [option('none', 'None', ShieldCheck), option('red', 'Red', Droplets), option('brown', 'Brown', Droplets), option('clotting', 'Clotting', Droplets)] },
  { id: 'collectionMethod', label: 'Collection method', field: 'collectionMethod', multi: true, color: 'red', options: [option('tampon', 'Tampon', ShieldCheck), option('pad', 'Pad', ShieldCheck), option('panty_liner', 'Panty liner', ShieldCheck), option('cup', 'Cup', ShieldCheck)] },
  { id: 'feelings', label: 'Feelings', field: 'feelings', multi: true, color: 'orange', options: [option('mood_swings', 'Mood swings', HeartPulse), option('not_in_control', 'Not in control', Wind), option('fine', 'Fine', Sun), option('happy', 'Happy', Sparkles), option('overwhelmed', 'Overwhelmed', Wind), option('numb', 'Numb', Moon)] },
  { id: 'pain', label: 'Pain', field: 'pain', multi: true, color: 'blue', options: [option('pain_free', 'Pain free', ShieldCheck), option('headache', 'Headache', Brain), option('cramps', 'Cramps', HeartPulse), option('ovulation_pain', 'Ovulation pain', Activity), option('breast_tenderness', 'Breast tenderness', HeartPulse), option('back_pain', 'Back pain', Stethoscope), option('body_ache', 'Body ache', Activity)] },
  { id: 'digestion', label: 'Digestion', field: 'digestion', multi: true, color: 'blue', options: [option('ok', 'OK', Salad), option('bloated', 'Bloated', Wind), option('gassy', 'Gassy', Wind), option('heartburn', 'Heartburn', Flame), option('nausea', 'Nausea', Waves)] },
  { id: 'stool', label: 'Stool', field: 'stool', multi: true, color: 'blue', options: [option('ok', 'OK', ShieldCheck), option('constipation', 'Constipation', Activity), option('diarrhea', 'Diarrhea', Waves)] },
  { id: 'discharge', label: 'Discharge', field: 'discharge', multi: false, color: 'blue', options: [option('none', 'None', ShieldCheck), option('sticky', 'Sticky', Droplets), option('creamy', 'Creamy', Droplets), option('eggwhite', 'Eggwhite', Waves), option('watery', 'Watery', Droplets), option('clumpy', 'Clumpy', Waves)] },
  { id: 'skin', label: 'Skin', field: 'skin', multi: true, color: 'blue', options: [option('ok', 'OK', ShieldCheck), option('good', 'Good', Sparkles), option('acne', 'Acne', CircleDot), option('dry_skin', 'Dry skin', Wind), option('oily_skin', 'Oily skin', Droplets)] },
  { id: 'hair', label: 'Hair', field: 'hair', multi: true, color: 'blue', options: [option('ok_hair_day', 'OK hair day', ShieldCheck), option('good_hair_day', 'Good hair day', Sparkles), option('bad_hair_day', 'Bad hair day', Wind), option('oily_scalp', 'Oily scalp', Droplets)] },
  { id: 'cravings', label: 'Cravings', field: 'cravings', multi: true, color: 'orange', options: [option('sweet', 'Sweet', Sparkles), option('salty', 'Salty', Salad), option('greasy', 'Greasy', Flame), option('spicy', 'Spicy', Flame)] },
  { id: 'sexLife', label: 'Sex life', field: 'sexLife', multi: true, color: 'teal', options: [option('protected', 'Protected', ShieldCheck), option('unprotected', 'Unprotected', HeartPulse), option('withdrawal', 'Withdrawal', Activity), option('no_sex_today', 'No sex today', Moon)] },
  { id: 'energy', label: 'Energy', field: 'energy', multi: true, color: 'orange', options: [option('exhausted', 'Exhausted', Moon), option('tired', 'Tired', Moon), option('ok', 'OK', ShieldCheck), option('energetic', 'Energetic', Zap)] },
  { id: 'mind', label: 'Mind', field: 'mind', multi: true, color: 'orange', options: [option('forgetful', 'Forgetful', Brain), option('brain_fog', 'Brain fog', Brain), option('calm', 'Calm', Flower2), option('stressed', 'Stressed', Wind)] },
  { id: 'socialLife', label: 'Social life', field: 'socialLife', multi: true, color: 'orange', options: [option('sociable', 'Sociable', Sparkles), option('withdrawn', 'Withdrawn', Moon), option('supportive', 'Supportive', HeartPulse), option('argumentative', 'Argumentative', Wind)] },
  { id: 'exercise', label: 'Exercise', field: 'exercise', multi: true, color: 'green', options: [option('running', 'Running', Activity), option('swimming', 'Swimming', Waves), option('yoga', 'Yoga', Flower2), option('cycling', 'Cycling', Activity), option('gym', 'Gym', Dumbbell), option('walking', 'Walking', Wind)] },
  { id: 'pms', label: 'PMS', field: 'pms', multi: false, color: 'orange', options: [option('pms', 'PMS', CalendarDays)] },
  { id: 'meditation', label: 'Meditation', field: 'meditation', multi: false, color: 'green', options: [option('meditation', 'Meditation', Flower2)] },
];

export const categoryColorClasses = {
  red: { border: 'border-red-300', background: 'bg-red-400/15', text: 'text-red-200', icon: 'text-red-300' },
  orange: { border: 'border-orange-300', background: 'bg-orange-400/15', text: 'text-orange-200', icon: 'text-orange-300' },
  blue: { border: 'border-blue-400', background: 'bg-blue-400/15', text: 'text-blue-200', icon: 'text-blue-300' },
  teal: { border: 'border-teal-300', background: 'bg-teal-400/15', text: 'text-teal-200', icon: 'text-teal-300' },
  green: { border: 'border-emerald-300', background: 'bg-emerald-400/15', text: 'text-emerald-200', icon: 'text-emerald-300' },
};
