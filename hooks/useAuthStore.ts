import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import api from '../api';

// Interface para o objeto de usuário
interface User {
  id: number;
  type: string;
  name: string;
  user_type: string;
  email: string;
}

// Interface para o nosso estado de autenticação
interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  initializeAuth: () => Promise<void>;
}

// Criação da loja com Zustand
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  // Ação para inicializar o estado a partir do AsyncStorage
  initializeAuth: async () => {
    try {
      const storagedUser = await AsyncStorage.getItem('@user');
      const storagedToken = await AsyncStorage.getItem('@token');

      if (storagedUser && storagedToken) {
        set({ user: JSON.parse(storagedUser) });
        api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
      }
    } catch (e) {
      console.error('Falha ao carregar dados de autenticação', e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Ação de Login
  signIn: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken } = response.data;

      set({ user }); // Atualiza o estado na loja
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      await AsyncStorage.setItem('@user', JSON.stringify(user));
      await AsyncStorage.setItem('@token', accessToken);

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login.';
      return { success: false, error: errorMessage };
    }
  },

  // Ação de Logout
  signOut: async () => {
    await AsyncStorage.multiRemove(['@user', '@token']);
    delete api.defaults.headers.common['Authorization'];
    set({ user: null }); // Limpa o usuário do estado
  },
}));
