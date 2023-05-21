import { ref } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../supabase';

export const useUserStore = defineStore('users', () => {
  const user = ref(null);
  const errorMessage = ref('');
  const loading = ref(false);
  const loadingUser = ref(false);

  const resetError = () => {
    errorMessage.value = '';
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSignUp = async (credentials) => {
    const { username, email, password } = credentials;

    if (!username) {
      errorMessage.value = 'A username is required';
      return;
    }

    if (username.length < 5) {
      errorMessage.value = 'Username needs to be at least 5 characters';
      return;
    }

    if (username.length > 20) {
      errorMessage.value = 'Username cannot be more than 20 characters';
      return;
    }

    if (/\s|[^a-zA-Z0-9]/.test(username)) {
      errorMessage.value =
        'Username cannot contain spaces or special characters';
      return;
    }

    if (!email || !validateEmail(email)) {
      errorMessage.value = 'A valid email address is required';
      return;
    }

    if (!password || password.length < 6) {
      errorMessage.value = 'Password needs to be at least 6 characters';
      return;
    }

    loading.value = true;

    // VALIDATE IF USER EXISTS
    const { data } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();

    if (data) {
      loading.value = false;
      errorMessage.value = 'Username is taken';
      return;
    }

    errorMessage.value = '';

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      loading.value = false;
      errorMessage.value = error.message;
      return;
    }

    await supabase.from('users').insert({
      username,
      email,
    });

    const { data: newUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    user.value = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };

    loading.value = false;
  };

  const handleLogin = async (credentials) => {
    const { email, password } = credentials;

    if (!email || !validateEmail(email)) {
      errorMessage.value = 'A valid email address is required';
      return;
    }

    if (!password || password.length < 6) {
      errorMessage.value = 'Password needs to be at least 6 characters';
      return;
    }

    loading.value = true;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      loading.value = false;
      errorMessage.value = error.message;
      return;
    }

    const { data: existinguser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    user.value = existinguser;
    loading.value = false;
    errorMessage.value = '';
  };

  const getUser = async () => {
    loadingUser.value = true;
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      loadingUser.value = false;
      return (user.value = null);
    }

    const { data: retrievedUser } = await supabase
      .from('users')
      .select()
      .eq('email', data.user.email)
      .single();

    user.value = retrievedUser;

    loadingUser.value = false;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    user.value = null;
  };

  return {
    user,
    errorMessage,
    loading,
    loadingUser,
    handleLogin,
    handleSignUp,
    handleLogout,
    getUser,
    resetError,
  };
});
