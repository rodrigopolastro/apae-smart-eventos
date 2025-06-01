import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
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

import api from '../api'; // Importe a instância do Axios que você criou!
import CustomHeader from '@/components/CustomHeader'; // Importa o CustomHeader
import CustomAlert from '@/components/CustomAlert'; // Importa o CustomAlert

const { width } = Dimensions.get('window'); // Obtém a largura da janela para cálculos de estilo

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
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

  const handleRegister = async () => {
    // Validações básicas
    if (!email || !password || !name) {
      showAlert('Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Por favor, insira um email válido');
      return;
    }

    if (password.length < 6) {
      showAlert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true); // Inicia o indicador de carregamento

    try {
      const response = await api.post('/users', {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        showAlert('Usuário cadastrado com sucesso!');
        router.replace('/login'); // Redireciona para a tela de login após o cadastro
      } else {
        showAlert('Ocorreu um erro inesperado no cadastro.');
      }
    } catch (error: any) {
      let errorMessage = 'Erro ao realizar cadastro';

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Este e-mail já está cadastrado.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Dados inválidos para cadastro.';
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
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          {/* CustomHeader como o primeiro elemento rolável */}
          <CustomHeader />

          {/* Wrapper para o conteúdo do formulário de cadastro */}
          <ThemedView style={styles.signupContentWrapper}>
            {/* O título "Cadastre-se" agora está dentro do formulário */}
            <ThemedText style={styles.sectionTitle}>Cadastre-se</ThemedText>

            <ThemedText style={styles.label}>Nome:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder='Digite seu nome:'
              value={name}
              onChangeText={setName}
              autoCapitalize='words'
            />

            <ThemedText style={styles.label}>Email:</ThemedText>
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
                <ThemedText style={styles.registerButtonText}>Cadastrar</ThemedText>
              </TouchableOpacity>
            )}

            {/* <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
              <ThemedText style={styles.loginLinkText}>Já tem uma conta? Login</ThemedText>
            </TouchableOpacity> */}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      {/* CustomAlert é renderizado fora do ScrollView para ser um overlay */}
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
  signupContentWrapper: { // Estilo para o wrapper do formulário de cadastro
    width: '90%', // Largura do contêiner do formulário
    backgroundColor: 'transparent', // Fundo branco para o formulário
    borderRadius: 10,
    padding: 20,
    // Margem negativa para puxar o formulário para cima e criar a sobreposição com a logo
    marginTop: -35, // Metade da altura da logo (130 / 2 = 65) do CustomHeader
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  sectionTitle: { // Estilo para o título "Cadastre-se" dentro do formulário
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#000',
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
  registerButton: { // Botão de cadastro
    backgroundColor: '#00527c', // Cor de fundo do botão
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: { // Texto do botão de cadastro
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loginLink: { // Link "Já tem uma conta? Login"
    alignItems: 'center',
  },
  loginLinkText: { // Texto do link
    color: '#00527c',
    fontSize: 16,
    fontWeight: '500',
  },
});
