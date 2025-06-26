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
import { useAuthStore } from '../hooks/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // Importe o MaterialIcons

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Novo estado para visibilidade da senha

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
            {/* Wrapper para o campo de senha e o ícone */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]} // Aplica estilos do input normal e adiciona um para o padding extra
                placeholder='Digite sua senha:'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Controla a visibilidade
                autoCapitalize='none'
              />
              <TouchableOpacity
                style={styles.togglePasswordButton}
                onPress={() => setShowPassword(!showPassword)} // Alterna a visibilidade
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'} // Ícone muda conforme a visibilidade
                  size={24}
                  color='#888'
                />
              </TouchableOpacity>
            </View>

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
    paddingTop: 30
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
    marginBottom: 20, // Removido do passwordInput para o container
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  // Novo estilo para o container do input de senha com ícone
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 20, // Mantido o marginBottom aqui para o container inteiro
  },
  passwordInput: {
    flex: 1, // Faz o input ocupar o espaço restante
    borderWidth: 0, // Remove a borda do input interno, pois o container já tem
    marginBottom: 0, // Remove o marginBottom do input interno
  },
  togglePasswordButton: {
    padding: 12, // Aumenta a área clicável
    // Ajuste o padding para centralizar o ícone se necessário
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