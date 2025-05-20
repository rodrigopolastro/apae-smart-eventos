import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validações básicas
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    setLoading(true);

    // try {
    //   const response = await api.post('/auth/login', {
    //     email,
    //     password,
    //   });

    //   // Sucesso no login => armazenar o token aqui
    //   // await AsyncStorage.setItem('@token', response.data.token);

    //   // Redirecionar para a tela principal após login
    //   navigation.navigate('Principal');
    // } catch (error) {
    //   let errorMessage = 'Erro ao realizar login';

    //   if (error.response) {
    //     if (error.response.status === 401) {
    //       errorMessage = 'Email ou senha incorretos';
    //     } else if (error.response.data.message) {
    //       errorMessage = error.response.data.message;
    //     }
    //   }

    //   Alert.alert('Erro', errorMessage);
    // } finally {
    //   setLoading(false);
    // }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.innerContainer}>
        <StatusBar hidden={true} />
        <ThemedText style={styles.title}>SmartEventos</ThemedText>
        <ThemedText style={styles.sectionTitle}>Login</ThemedText>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          placeholder='Digite seu email:'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />
        <ThemedText style={styles.label}>Senha:</ThemedText>
        <TextInput
          style={styles.input}
          placeholder='Digite sua senha:'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <ThemedView style={styles.divider} />
        {loading ? (
          <ActivityIndicator size='large' color='#0000ff' />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
          </TouchableOpacity>
        )}
        <ThemedView style={styles.footerLinks}>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.linkText}>Cadastre-se</Text>
          </TouchableOpacity>

          {/* Removi a navegação para ForgotPasswordScreen para focar nos erros atuais */}
          {/* <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          >
            <Text style={styles.linkText}>Esqueceu a senha?</Text>
          </TouchableOpacity> */}
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
});
