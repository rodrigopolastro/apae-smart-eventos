import CustomAlert from '@/components/CustomAlert';
import CustomHeader from '@/components/CustomHeaderLogin';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../hooks/useAuthStore'; // 1. Alterado para usar a loja Zustand

export default function Login() {
  const router = useRouter();
  // 2. Obtém a função signIn diretamente da loja Zustand
  const { signIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    // A lógica de chamada permanece a mesma
    const result = await signIn({ email, password });
    setLoading(false);

    if (result.success) {
      router.replace('/(associado)/homelogado');
    } else {
      showAlert(result.error || 'Email ou senha incorretos');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <CustomHeader />
          <View style={styles.loginContentWrapper}>
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
            <View style={styles.divider} />
            {loading ? (
              <ActivityIndicator size='large' color='#00527c' />
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <ThemedText style={styles.linkText}>Cadastre-se</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

// Seus estilos existentes aqui...
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContentContainer: {
      alignItems: 'center',
      paddingBottom: 40,
    },
    loginContentWrapper: {
      width: '90%',
      backgroundColor: 'transparent',
      borderRadius: 10,
      padding: 20,
      marginTop: -15,
    },
    sectionTitle: {
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
      color: '#fff',
    },
    linkText: {
      color: '#00527c',
      fontSize: 16,
      fontWeight: '500',
      backgroundColor: 'transparent',
      textAlign: 'center',
    },
});