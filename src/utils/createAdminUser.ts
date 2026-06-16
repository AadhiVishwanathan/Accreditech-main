import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  try {
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@aicte.gov.in',
      password: 'admin123',
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          institute_name: 'AICTE Admin',
          user_type: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return { success: false, error: authError.message };
    }

    console.log('Admin user created successfully:', authData);
    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed to create admin user' };
  }
};

// Auto-execute when this file is imported in development
if (import.meta.env.DEV) {
  console.log('To create admin user, run: createAdminUser()');
}