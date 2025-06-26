import { useAuthStore } from '@/hooks/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ColorValue,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Defina a interface para as props do CustomHeader
interface CustomHeaderProps {
  isLoginScreen?: boolean; // Nova prop opcional para indicar se é a tela de login
}

export default function CustomHeader({ isLoginScreen }: CustomHeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  // --- Definição das variáveis de cor com tipagem explícita ---
  let gradientColors: [ColorValue, ColorValue, ...ColorValue[]];
  let logoBorderColor: ColorValue;
  let buttonBackgroundColor: ColorValue;
  let buttonShadowColor: ColorValue;
  let buttonBorderColor: ColorValue;

  // Lógica para definir as cores do header com base no modo (login) ou tipo de usuário
  if (isLoginScreen) {
    // Cores para MODO LOGIN (CINZA)
    gradientColors = ['#007AFF', '#5DADE2']; // Tons de azul
    logoBorderColor = '#5DADE2';
    buttonBackgroundColor = '#5DADE2';
    buttonShadowColor = '#007AFF';
    buttonBorderColor = '#007AFF';
  } else if (user && user.type === 'admin') {
    // Cores para ADMIN (AMARELO MAIS ESCURO)
    gradientColors = ['#FFC107', '#FFA000']; // Amarelo padrão e laranja-âmbar (Material Design)
    logoBorderColor = '#FFA000';
    buttonBackgroundColor = '#FFA000';
    buttonShadowColor = '#FFC107';
    buttonBorderColor = '#FFC107';
  } else if (user && user.type === 'associate') {
    // Cores para ASSOCIADO (AZUL)
    gradientColors = ['#007AFF', '#5DADE2']; // Tons de azul
    logoBorderColor = '#5DADE2';
    buttonBackgroundColor = '#5DADE2';
    buttonShadowColor = '#007AFF';
    buttonBorderColor = '#007AFF';
  } else {
    // Cores para NÃO LOGADO (CINZA) - Padrão se não for login, admin ou associado
    gradientColors = ['#007AFF', '#5DADE2']; // Tons de azul
    logoBorderColor = '#5DADE2';
    buttonBackgroundColor = '#5DADE2';
    buttonShadowColor = '#007AFF';
    buttonBorderColor = '#007AFF';
  }
  // --- Fim da definição de cores ---

  const redirectToLogin = () => {
    router.replace('/login');
  };

  const logout = () => {
    signOut();
    router.replace('/login');
  };

  const handleGoBack = () => {
    router.replace('/(associado)'); // Volta para a tela inicial (associado)
  };

  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={isLoginScreen ? styles.topBarLogin : styles.topBar}
      >
        {
          isLoginScreen ? (
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={[
                  styles.backButton,
                  {
                    backgroundColor: buttonBackgroundColor,
                    shadowColor: buttonShadowColor,
                    borderColor: buttonBorderColor,
                  },
                ]}
              >
                <Ionicons name='arrow-back' size={20} color='white' />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : user ? (
            // NOVO: Container para o nome e tipo do usuário
            <View style={styles.loggedInInfoContainer}>
              <Text style={styles.userNameText}>Olá, {user.name || 'Usuário'}!</Text>
              <Text style={styles.userTypeText}>
                {user.type === 'admin' ? 'Administrador' : 'Associado'}
              </Text>
            </View>
          ) : null // Não mostra nada se não for tela de login e não houver usuário logado
        }

        {/* Botões de login/logout/perfis (mantidos à direita) */}
        {!isLoginScreen ? (
          user ? (
            <View style={styles.loggedInButtonsContainer}>
              {/* NOVO: Container para os botões logados */}
              {/* {user.type === 'admin' && (
                <TouchableOpacity
                  onPress={() => router.push('/admin')}
                  style={[
                    styles.loginButton,
                    {
                      backgroundColor: buttonBackgroundColor,
                      shadowColor: buttonShadowColor,
                      borderColor: buttonBorderColor,
                      marginRight: 10,
                    },
                  ]}
                >
                  <Text style={styles.loginButtonText}>Painel Admin</Text>
                </TouchableOpacity>
              )} */}
              {/* {user.type === 'associate' && (
                <TouchableOpacity
                  onPress={() => router.push('/meuingresso')}
                  style={[
                    styles.loginButton,
                    {
                      backgroundColor: buttonBackgroundColor,
                      shadowColor: buttonShadowColor,
                      borderColor: buttonBorderColor,
                      marginRight: 10,
                    },
                  ]}
                >
                  <Text style={styles.loginButtonText}>Meu Ingresso</Text>
                </TouchableOpacity>
              )} */}
              <TouchableOpacity
                onPress={logout}
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: buttonBackgroundColor,
                    shadowColor: buttonShadowColor,
                    borderColor: buttonBorderColor,
                  },
                ]}
              >
                <Text style={styles.loginButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={redirectToLogin}
              style={[
                styles.loginButton,
                {
                  backgroundColor: buttonBackgroundColor,
                  shadowColor: buttonShadowColor,
                  borderColor: buttonBorderColor,
                },
              ]}
            >
              <Text style={styles.loginButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          )
        ) : null}
      </LinearGradient>

      <Image
        source={require('../assets/images/SmartEventos2.png')}
        style={[
          styles.centerLogo,
          { borderColor: logoBorderColor },
          isLoginScreen ? styles.centerLogoLogin : null,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 160 + 75 + 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 20,
    overflow: 'visible',
  },

  topBar: {
    width: width - 20,
    height: 150,
    justifyContent: 'space-between', // Altera para distribuir espaço entre os itens
    flexDirection: 'row', // Permite que os itens fiquem lado a lado
    alignItems: 'flex-start', // Alinha os itens no topo
    paddingTop: 10,
    paddingHorizontal: 20, // Ajuste o padding horizontal
    borderRadius: 20,
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  topBarLogin: {
    width: width - 20,
    height: 150,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    borderRadius: 20,
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 5,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // NOVO: Estilos para o container de informações do usuário logado
  loggedInInfoContainer: {
    alignItems: 'flex-start', // Alinha o texto à esquerda dentro do container
    marginTop: 10, // Pequena margem para não colar no topo
    // Ajuste o `marginRight` se houver muitos botões à direita
  },
  userNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff', // Cor do texto, ajuste conforme o gradiente
  },
  userTypeText: {
    fontSize: 12,
    color: '#eee', // Cor secundária para o tipo de usuário
    opacity: 0.8,
  },
  // NOVO: Container para os botões quando logado
  loggedInButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Alinha com o texto do usuário
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 15,
    // Removido marginTop e marginRight aqui, pois agora estão no container
    shadowOffset: { width: 10, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 2,
  },
  loginButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  centerLogo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    position: 'absolute',
    top: 90,
    left: width / 2 - 63,
    zIndex: 3,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 2,
  },
  centerLogoLogin: {
    top: 90,
  },
});
