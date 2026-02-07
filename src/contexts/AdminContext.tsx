import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  users: UserWithDetails[];
  systemSettings: SystemSetting[];
  apiLogs: ApiUsageLog[];
  subscriptions: UserSubscription[];
  fetchUsers: () => Promise<void>;
  fetchSystemSettings: () => Promise<void>;
  fetchApiLogs: () => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'moderator' | 'user') => Promise<void>;
  updateUserSubscription: (userId: string, plan: 'free' | 'pro' | 'enterprise', maxSlides: number) => Promise<void>;
  updateSystemSetting: (key: string, value: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
  removeAdmin: (userId: string) => Promise<void>;
}

interface UserWithDetails {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: 'admin' | 'moderator' | 'user';
  plan: 'free' | 'pro' | 'enterprise';
  max_slides: number;
  presentation_count: number;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  category: string;
  updated_at: string;
}

interface ApiUsageLog {
  id: string;
  user_id: string | null;
  api_name: string;
  model_name: string | null;
  request_type: string | null;
  status: string;
  tokens_used: number;
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  max_slides: number;
  max_presentations_per_month: number | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiUsageLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        setIsAdmin(!error && data?.role === 'admin');
      } catch {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Get profiles with presentation counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at, updated_at');

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get subscriptions
      const { data: subs, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Get presentation counts
      const { data: presentations, error: presError } = await supabase
        .from('presentations')
        .select('user_id');

      if (presError) throw presError;

      // Count presentations per user
      const presentationCounts: Record<string, number> = {};
      presentations?.forEach(p => {
        presentationCounts[p.user_id] = (presentationCounts[p.user_id] || 0) + 1;
      });

      // Combine data
      const usersData: UserWithDetails[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userSub = subs?.find(s => s.user_id === profile.id);

        return {
          id: profile.id,
          email: profile.full_name || 'Unknown',
          created_at: profile.created_at || '',
          last_sign_in_at: profile.updated_at,
          role: (userRole?.role as 'admin' | 'moderator' | 'user') || 'user',
          plan: (userSub?.plan as 'free' | 'pro' | 'enterprise') || 'free',
          max_slides: userSub?.max_slides || 12,
          presentation_count: presentationCounts[profile.id] || 0,
        };
      });

      setUsers(usersData);
      setSubscriptions(subs || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [isAdmin]);

  const fetchSystemSettings = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      const settings = (data || []).map(s => ({
        ...s,
        setting_value: typeof s.setting_value === 'string' 
          ? s.setting_value 
          : JSON.stringify(s.setting_value),
      }));

      setSystemSettings(settings);
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  }, [isAdmin]);

  const fetchApiLogs = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setApiLogs(data || []);
    } catch (error) {
      console.error('Error fetching API logs:', error);
    }
  }, [isAdmin]);

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    if (!isAdmin) return;

    try {
      // Check if role exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing role
        await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
      } else {
        // Insert new role
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUserSubscription = async (userId: string, plan: 'free' | 'pro' | 'enterprise', maxSlides: number) => {
    if (!isAdmin) return;

    try {
      // Check if subscription exists
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await supabase
          .from('user_subscriptions')
          .update({ plan, max_slides: maxSlides })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_subscriptions')
          .insert({ user_id: userId, plan, max_slides: maxSlides });
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const updateSystemSetting = async (key: string, value: string) => {
    if (!isAdmin || !user) return;

    try {
      await supabase
        .from('system_settings')
        .update({ 
          setting_value: value,
          updated_by: user.id,
        })
        .eq('setting_key', key);

      await fetchSystemSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const promoteToAdmin = async (userId: string) => {
    await updateUserRole(userId, 'admin');
  };

  const removeAdmin = async (userId: string) => {
    await updateUserRole(userId, 'user');
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      isLoading,
      users,
      systemSettings,
      apiLogs,
      subscriptions,
      fetchUsers,
      fetchSystemSettings,
      fetchApiLogs,
      updateUserRole,
      updateUserSubscription,
      updateSystemSetting,
      promoteToAdmin,
      removeAdmin,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
