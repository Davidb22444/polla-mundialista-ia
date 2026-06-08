import { supabase } from '../lib/supabase.js';

export const AuthApi = {
  signUp: async (username, password) => {
    // Usamos el username como email simulado para usar Auth nativo
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@pollamundialista.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    
    if (error) throw error;

    return data;
  },

  signIn: async (username, password) => {
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@pollamundialista.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
