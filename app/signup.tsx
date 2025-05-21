import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validações básicas
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // setLoading(true);

    // try {
    //   const response = await axios.post('https://sua-api.com/auth/register', {
    //     email,
    //     password,
    //   });

    //   Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    //   router.push('/login');
    // } catch (error) {
    //   // Tratamento de erros da API
    //   let errorMessage = 'Erro ao realizar cadastro';

    //   if (error.response) {
    //     if (error.response.status === 400) {
    //       errorMessage = 'Email já cadastrado';
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
        <Image
                  source={require('../assets/images/logoapae.png')} // Verifique se o caminho está correto
                  style={styles.logo}
                />
        <ThemedText style={styles.title}>SmartEventos</ThemedText>

        <ThemedText style={styles.sectionTitle}>Cadastre-se</ThemedText>

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
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
          <Text style={styles.loginLinkText}>Já tem uma conta? Login</Text>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: { // Novo estilo para a imagem
    width: 150, // Ajuste a largura conforme necessário
    height: 150, // Ajuste a altura conforme necessário
    alignSelf: 'center', // Centraliza a imagem horizontalmente
    marginBottom: 40, // Espaçamento abaixo da imagem
    resizeMode: 'contain', // Garante que a imagem se ajuste sem cortar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
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
  registerButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
});
