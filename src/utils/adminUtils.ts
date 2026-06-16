import { supabase } from '@/integrations/supabase/client';

export const ensureAdminUser = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return null;
    }

    // Check if user has admin profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      // Create admin profile for current user
      console.log('Creating admin profile for user:', user.email);
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          user_type: 'admin',
          institute_name: 'AICTE Admin'
        });

      if (error) {
        console.error('Error creating admin profile:', error);
        return null;
      }

      return 'admin';
    }

    return profile.user_type;
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    return null;
  }
};