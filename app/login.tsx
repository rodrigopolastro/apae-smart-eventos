import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView, // Importado para permitir rolagem
  Dimensions, // Importado para Dimensions.get('window').width
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api'; // Ajuste o caminho conforme onde você salvou api.ts
import CustomHeader from '@/components/CustomHeaderLogin'; // Importa o CustomHeader
import CustomAlert from '@/components/CustomAlert'; // Importa o CustomAlert

const { width } = Dimensions.get('window'); // Obtém a largura da janela para cálculos de estilo

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false); // Estado para visibilidade do alerta
  const [alertMessage, setAlertMessage] = useState(''); // Estado para a mensagem do alerta

  // Função para exibir o alerta personalizado
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Função para esconder o alerta personalizado
  const hideAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
  };

  const handleLogin = async () => {
    // Validações básicas
    if (!email || !password) {
      showAlert('Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Por favor, insira um email válido');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { // Requisição para a rota de login
        email,
        password,
      });

      // Sucesso no login => armazenar o token aqui
      if (response.data && response.data.accessToken) {
        await AsyncStorage.setItem('@token', response.data.accessToken); // Armazenar o access token
        if (response.data.refreshToken) {
          await AsyncStorage.setItem('@refreshToken', response.data.refreshToken);
        }

        showAlert('Login realizado com sucesso!');
        router.replace('/homelogado'); // Redireciona para a tela principal após login
      } else {
        showAlert('Login bem-sucedido, mas o token de acesso não foi recebido.');
      }

    } catch (error: any) {
      let errorMessage = 'Erro ao realizar login';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Erro do servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet ou o endereço da API.';
      } else {
        errorMessage = `Erro: ${error.message}`;
      }

      showAlert(errorMessage); // Exibe o erro usando o alerta personalizado
    } finally {
      setLoading(false);
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
      {/* SafeAreaView para lidar com entalhes e barras de status */}
      <SafeAreaView style={styles.safeArea}>
        {/* ScrollView para permitir que todo o conteúdo role */}
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          {/* O CustomHeader é o primeiro elemento no ScrollView e rola com o conteúdo */}
          <CustomHeader />

          {/* Wrapper para o conteúdo do formulário de login */}
          <ThemedView style={styles.loginContentWrapper}>
            <StatusBar hidden={true} /> {/* Esconde a barra de status */}
            {/* O título "Login" agora está dentro do formulário */}
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
            
              <TouchableOpacity onPress={() => router.push('/signup')}>
                {/* ALTERAÇÃO AQUI: Usando ThemedText para consistência */}
                <ThemedText style={styles.linkText}>Cadastre-se</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          
        </ScrollView>
      </SafeAreaView>

      {/* O componente CustomAlert é renderizado fora do ScrollView para ser um overlay */}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Cor de fundo principal da tela
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContentContainer: {
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    paddingBottom: 40, // Adiciona um padding no final para rolagem
   
  },
  loginContentWrapper: {
    width: '90%', // Largura do contêiner do formulário
    backgroundColor: 'transparent', // Fundo branco para o formulário
    borderRadius: 10,
    padding: 20,
    // Margem negativa para puxar o formulário para cima e criar a sobreposição com a logo
    marginTop: -15, // Metade da altura da logo (130 / 2 = 65)
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  // O estilo 'logo' e 'title' foram removidos, pois a logo e o título principal estão no CustomHeader
  sectionTitle: { // Estilo para o título "Login" dentro do formulário
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000'
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#000'
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
    backgroundColor: '#00527c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff', // Cor do texto do botão "Entrar"
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },
  linkText: {
    color: '#00527c',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent'
  },
});
