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
import { apiService, SignupData } from '../services/api.service';

interface SignupScreenProps {
  navigation: any; // Você pode tipar melhor com @react-navigation/native
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'Por favor, informe um email válido');
      return false;
    }

    if (!formData.password) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.signup(formData);
      
      Alert.alert(
        'Sucesso!',
        'Cadastro realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Aqui você pode salvar os tokens no AsyncStorage
              // e navegar para a tela principal ou fazer login automático
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro no cadastro',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para se cadastrar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme sua senha"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Faça login</Text>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
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
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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

export default SignupScreen;