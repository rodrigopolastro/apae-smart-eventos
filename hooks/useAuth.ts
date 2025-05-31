// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api.service';

interface User {
  id: number;
  type: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Carregar dados salvos ao iniciar o app
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userString] = await AsyncStorage.multiGet([
        'accessToken',
        'refreshToken',
        'user',
      ]);

      const token = accessToken[1];
      const refresh = refreshToken[1];
      const user = userString[1] ? JSON.parse(userString[1]) : null;

      if (token && refresh && user) {
        setAuthState({
          user,
          accessToken: token,
          refreshToken: refresh,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      
      // Salvar no AsyncStorage
      await AsyncStorage.multiSet([
        ['accessToken', response.accessToken],
        ['refreshToken', response.refreshToken],
        ['user', JSON.stringify(response.user)],
      ]);

      // Atualizar estado
      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no login' 
      };
    }
  };

  const logout = async () => {
    try {
      // Remover dados do AsyncStorage
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      
      // Resetar estado
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshAccessToken = async () => {
    if (!authState.refreshToken) {
      await logout();
      return false;
    }

    try {
      const response = await apiService.refreshToken(authState.refreshToken);
      
      // Atualizar token no AsyncStorage
      await AsyncStorage.setItem('accessToken', response.accessToken);
      
      // Atualizar estado
      setAuthState(prev => ({
        ...prev,
        accessToken: response.accessToken,
      }));

      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      await logout();
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.signup({ name, email, password });
      
      // Salvar no AsyncStorage
      await AsyncStorage.multiSet([
        ['accessToken', response.accessToken],
        ['refreshToken', response.refreshToken],
        ['user', JSON.stringify(response.user)],
      ]);

      // Atualizar estado
      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no cadastro' 
      };
    }
  };

  return {
    ...authState,
    login,
    logout,
    signup,
    refreshAccessToken,
  };
};