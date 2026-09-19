import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { householdAPI } from '../services/api';

const InviteAcceptPage = () => {
  const { token } = useParams(); const navigate = useNavigate(); const [message, setMessage] = useState('Accepting your household invite...');
  useEffect(() => { householdAPI.accept(token).then(() => { setMessage('You are now connected to this household.'); setTimeout(() => navigate('/baby'), 1000); }).catch((error) => setMessage(error.response?.data?.message || 'This invite could not be accepted.')); }, [token, navigate]);
  return <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-6"><div className="app-surface max-w-md p-8 text-center"><CheckCircle2 className="mx-auto mb-4 text-blue-500" size={40} /><h1 className="font-display text-2xl font-semibold">Household invite</h1><p className="mt-3 text-sm text-[var(--color-muted)]">{message}</p></div></div>;
};

export default InviteAcceptPage;
