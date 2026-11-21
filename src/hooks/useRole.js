import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const useRole = (project) => {
  const { user } = useAuth();
  return useMemo(() => {
    if (!project || !user) return 'viewer';
    if (project.owner?._id === user._id || project.owner === user._id) return 'admin';
    const member = (project.members || []).find((m) => m.user?._id === user._id || m._id === user._id);
    if (member) return member.role || 'viewer';
    return 'viewer';
  }, [project, user]);
};

export const canPerform = (role, action) => {
  const permissions = {
    edit: ['admin', 'editor'],
    delete: ['admin'],
    manage: ['admin'],
    share: ['admin', 'editor'],
  };
  return (permissions[action] || []).includes(role);
};
