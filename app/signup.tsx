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

import api from '../api'; // <<<<<<<< IMPORTANTE: Importe a instância do Axios que você criou!
// Se o seu api.ts estiver na raiz do projeto (apae-smart-eventos/api.ts) e o signup.tsx em app/signup.tsx,
// o caminho relativo correto é '../api'. Se você organizou de outra forma (ex: src/api.ts),
// pode precisar ajustar para '../../api' ou para um alias como '@/api' se configurado.

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState(''); // <<<<<<<< NOVO: Estado para o nome
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validações básicas (AGORA INCLUINDO O NOME)
    if (!email || !password || !name) { // <<<<<<<< ATUALIZADO: Verificando 'name'
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

    setLoading(true); // Inicia o indicador de carregamento

    try {
      // <<<<<<<< INTEGRAÇÃO COM O BACKEND: Requisição POST para /users
      const response = await api.post('/users', {
           // Enviando o nome para o backend
        email,
        password,
        name,
      });

      // Se a requisição foi bem-sucedida (status 201 Created)
      if (response.status === 201) { // Verifique o status 201 para sucesso na criação
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
        router.replace('/login'); // Redireciona para a tela de login após o cadastro
      } else {
        // Embora Axios geralmente jogue um erro para status != 2xx,
        // é bom ter um fallback aqui para casos inesperados.
        Alert.alert('Erro', 'Ocorreu um erro inesperado no cadastro.');
      }
    } catch (error: any) { // <<<<<<<< Tratamento de erros da requisição
      let errorMessage = 'Erro ao realizar cadastro';

      if (error.response) {
        // O servidor respondeu com um status diferente de 2xx
        if (error.response.status === 409) { // Código 409 para Conflito (e-mail já registrado)
          errorMessage = 'Este e-mail já está cadastrado.';
        } else if (error.response.status === 400) { // Código 400 para Bad Request (dados inválidos)
          // Se o backend retornar uma mensagem de erro específica no data.message
          errorMessage = error.response.data.message || 'Dados inválidos para cadastro.';
        } else if (error.response.data && error.response.data.message) {
          // Para outros erros do servidor que tenham uma mensagem customizada
          errorMessage = error.response.data.message;
        } else {
          // Para erros do servidor sem mensagem customizada
          errorMessage = `Erro do servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        // A requisição foi feita, mas não houve resposta (ex: rede offline, URL incorreta)
        errorMessage = 'Erro de conexão. Verifique sua internet ou o endereço da API.';
      } else {
        // Algo aconteceu na configuração da requisição que disparou um erro (ex: problema no código Axios)
        errorMessage = `Erro: ${error.message}`;
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false); // Finaliza o indicador de carregamento
    }
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
          source={require('../assets/images/logoapae.png')}
          style={styles.logo}
        />
        <ThemedText style={styles.title}>SmartEventos</ThemedText>

        <ThemedText style={styles.sectionTitle}>Cadastre-se</ThemedText>

        {/* <<<<<<<< NOVO: TextInput para o nome */}
        <ThemedText style={styles.label}>Nome:</ThemedText>
        <TextInput
          style={styles.input}
          placeholder='Digite seu nome:'
          value={name}
          onChangeText={setName}
          autoCapitalize='words' // Capitaliza as primeiras letras de cada palavra
        />

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
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 40,
    resizeMode: 'contain',
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