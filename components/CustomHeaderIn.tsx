import React from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, Image, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CustomHeaderProps {
  onPress?: () => void;
}

export default function CustomHeader({ onPress }: CustomHeaderProps) {
  const router = useRouter();

  const handleIngresso = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/meuingresso');
    }
  };

  return (
    // O headerContainer agora não é mais absoluto no contexto da tela,
    // ele fará parte do fluxo do ScrollView em index.tsx.
    <View style={styles.headerContainer}>
        
      {/* Top Bar / Header */}
      <LinearGradient
        colors={['#005452', '#48a3a7']} // Azul mais escuro
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        <TouchableOpacity onPress={handleIngresso} style={styles.ingressoButton}>
          <ThemedText style={styles.ingressoButtonText}>Meus Ingressos</ThemedText>
        </TouchableOpacity>
      </LinearGradient>

      {/* Logo central */}
      <Image
      
        source={require('../assets/images/SmartEventos2.png')} // Caminho ajustado para o componente
        style={styles.centerLogo}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%', // Ocupa a largura total disponível
    // A altura do headerContainer deve acomodar a topBar e a parte inferior da logo
    height: 160 + 75 + 20, // Altura da topBar (160) + metade da logo (75) + paddingTop (20) = 255
    backgroundColor: 'transparent',
    alignItems: 'center', // Centraliza a topBar e a logo horizontalmente
    paddingTop: 20, // Espaço no topo para mostrar o fundo azul claro
    //borderBottomLeftRadius: 30, // Arredondamento para o fundo do headerContainer
    //borderBottomRightRadius: 30, // Arredondamento para o fundo do headerContainer
    // Removido marginBottom: -75, pois o cabeçalho agora rola com o conteúdo
    overflow: 'visible',
  },
  
  topBar: {
    width: width - 20, // Largura da tela menos 20px de margem de cada lado
    height: 150, // Altura da topBar
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: 10,
    borderRadius: 20, // Arredondamento em todos os cantos
    position: 'absolute', // Posiciona a topBar dentro do headerContainer
    top: 20, // 20px do topo do headerContainer para mostrar o fundo azul claro
    left: 10,
    right: 10,
    zIndex: 2, // Fica acima do fundo do headerContainer
    shadowColor: '#000', // Cor da sombra preta
    shadowOffset: { width: 10, height: 15 }, // Deslocamento maior para baixo
    shadowOpacity: 1, // Opacidade aumentada para 40%
    shadowRadius: 10, // Raio de desfoque maior
    elevation: 20, // Propriedade específica para Android, aumentada
    overflow: 'visible',
    backgroundColor: 'transparent',
  },

  ingressoButton: {
    //backgroundColor: '#00527c',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginTop: 10,
    marginRight: 10,
    shadowColor: '#005452', // Cor da sombra preta
    shadowOffset: { width: 10, height: 15 }, // Deslocamento maior para baixo
    shadowOpacity: 0.4, // Opacidade aumentada para 40%
    shadowRadius: 10, // Raio de desfoque maior
    elevation: 20, // Propriedade específica para Android, aumentada
    borderWidth: 2, // Define a largura da borda
    borderColor: '#48a3a7',
  },

  ingressoButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    //color: '#000',
  },

  centerLogo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    position: 'absolute', // A logo ainda é absoluta dentro do headerContainer
    // Posiciona a logo no centro da borda entre topBar e o conteúdo abaixo
    // top: (topBar.top + topBar.height) - (logo.height / 2) = (20 + 160) - 75 = 180 - 75 = 105
    top: 90,
    left: (width / 2) - 63, // Centraliza horizontalmente
    zIndex: 3, // Acima da topBar
    borderRadius:30,
    shadowColor: '#000', // Cor da sombra preta
    shadowOffset: { width: 10, height: 15 }, // Deslocamento maior para baixo
    shadowOpacity: 0.4, // Opacidade aumentada para 40%
    shadowRadius: 10, // Raio de desfoque maior
    elevation: 20, // Propriedade específica para Android, aumentada  
    borderWidth: 2, // Define a largura da borda
    borderColor: '#48a3a7',
   //borderColor: 'yellow'
  },
});
