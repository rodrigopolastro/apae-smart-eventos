import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, LoginData } from '../services/api.service';

interface LoginScreenProps {
  navigation: any; // Você pode tipar melhor com @react-navigation/native
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return false;
    }

    if (!formData.password) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return false;
    }

    return true;
  };

  const saveTokens = async (accessToken: string, refreshToken: string, user: any) => {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['user', JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.login(formData);
      
      // Salvar tokens no AsyncStorage
      await saveTokens(response.accessToken, response.refreshToken, response.user);
      
      Alert.alert(
        'Sucesso!',
        'Login realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar para a tela principal do app
              navigation.replace('index'); // ou sua tela principal
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro no login',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implementar recuperação de senha se necessário
    Alert.alert('Info', 'Funcionalidade em desenvolvimento');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>
            Faça login para acessar sua conta
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Digite sua senha"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('signup')}>
            <Text style={styles.linkText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
});

export default LoginScreen;