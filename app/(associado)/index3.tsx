import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardWidth = width * 0.7; // Largura do card
  const cardMarginRight = 15; // Margem direita do card
  const [currentScrollX, setCurrentScrollX] = useState(0);


  // Dados mockados para os eventos do carrossel
  const events = [
    {
      id: '1',
      image: require('../../assets/images/festajunina.jpg'), // Imagem do ExpoEcomm
      text: 'Campinas Innovation Week...',
      details: 'Pátio Ferroviário de Campinas - ...\n09 de Jun a 13 de Jun',
    },
    {
      id: '2',
      image: require('../../assets/images/festajunina.jpg'),
      text: 'Ceará Trap Music Festival',
      details: 'Fortaleza - CE | Sábado, 28 Set. • 19h',
    },
    {
      id: '3',
      image: require('../../assets/images/festajunina.jpg'),
      text: 'Festa Junina APAE',
      details: 'APAE 2025 | Terça-feira, 14 Jun. • 13h',
    },
    {
      id: '4',
      image: require('../../assets/images/festajunina.jpg'),
      text: 'Mega Encontro Tech',
      details: 'São Paulo - SP | Sexta-feira, 05 Dez. • 09h',
    },
    {
      id: '5',
      image: require('../../assets/images/festajunina.jpg'),
      text: 'Conferência de IA',
      details: 'Rio de Janeiro - RJ | Quarta-feira, 20 Nov. • 10h',
    },
  ];

 const handleLoginPress = () => {
    router.push('/login');
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: '/eventdescription', params: { eventId: eventId } });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentScrollX(event.nativeEvent.contentOffset.x);
  };

  const scrollLeft = () => {
    if (scrollViewRef.current) {
      const newX = Math.max(0, currentScrollX - (cardWidth + cardMarginRight));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  const scrollRight = () => {
    if (scrollViewRef.current) {
      const totalContentWidth = events.length * (cardWidth + cardMarginRight);
      const maxScrollX = totalContentWidth - width + cardMarginRight;
      const newX = Math.min(maxScrollX, currentScrollX + (cardWidth + cardMarginRight));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Corpo principal com azul mais claro */}
        <ThemedView style={styles.bodyContainer}>
          {/* Texto "Eventos APAE" com fundo amarelo */}
          <ThemedView style={styles.eventsApaeContainer}>
            <ThemedText style={styles.eventsApaeText}>Eventos APAE</ThemedText>
          </ThemedView>

          {/* Carrossel de Eventos com setas */}
          <ThemedView style={styles.carouselContainer}>
            <TouchableOpacity onPress={scrollLeft} style={styles.arrowButton}>
              {/* Ícone de seta para a esquerda */}
              {/* Certifique-se de que IconSymbol está importado e funciona corretamente */}
              <ThemedText style={styles.arrowText}>{'<'}</ThemedText>
            </TouchableOpacity>

            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsCarousel}
              snapToInterval={cardWidth + cardMarginRight}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.carouselScrollView} 
            >
              {events.map(event => (
                <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => handleEventPress(event.id)}>
                  <Image source={event.image} style={styles.eventImage} />
                  <ThemedText style={styles.eventCardText}>{event.text}</ThemedText>
                  <ThemedText style={styles.eventCardDetails}>{event.details}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={scrollRight} style={styles.arrowButton}>
              {/* Ícone de seta para a direita */}
              {/* Certifique-se de que IconSymbol está importado e funciona corretamente */}
              <ThemedText style={styles.arrowText}>{'>'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Top Bar / Header */}
        <LinearGradient
          colors={['#003366', '#004080']} // Azul mais escuro
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        {/* Logo central - Agora fora do bodyContainer para zIndex funcionar */}
        <Image
          source={require('../../assets/images/SmartEventos2.png')} // Usando SmartEventos2.png
          style={styles.centerLogo}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute', // Essencial para zIndex
    zIndex: 2, // A topBar fica acima do bodyContainer
    top: 0,
  },
  loginButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
    paddingTop: 0, // Removido padding para ajuste com a logo
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 100, // Ajuste para que o bodyContainer comece abaixo da topBar
    zIndex: 1, // Opcional, mas indica que está abaixo
  },
  centerLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    position: 'absolute', // Posiciona a logo de forma absoluta
    top: 25, // Ajuste para centralizar verticalmente na topBar
    left: (width / 2) - 75, // Centraliza horizontalmente (largura da tela / 2 - metade da largura da logo)
    zIndex: 3, // Garante que a logo fique acima de TUDO
    borderRadius: 30,
  },
  eventsApaeContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 75, // Ajusta a posição abaixo da logo
  },
  eventsApaeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%', // Garante que o contêiner do carrossel ocupe a largura total
    paddingHorizontal: 10, // Adiciona padding para as setas não ficarem coladas na borda
  },
  arrowButton: {
    padding: 5, // Reduzido o padding para as setas
    backgroundColor: 'rgba(255,255,255,0.7)', // Fundo semi-transparente para as setas
    borderRadius: 20, // Arredondar os botões das setas
    width: 40, // Largura fixa para o botão da seta
    height: 40, // Altura fixa para o botão da seta
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  arrowText: { // Estilo para o texto das setas (se IconSymbol não funcionar)
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  carouselScrollView: { // Novo estilo para o ScrollView
    flex: 1, // Permite que o ScrollView ocupe o espaço restante entre as setas
  },
  eventsCarousel: {
    paddingBottom: 20,
    // paddingRight: 40, // Removido, pois o padding do carouselContainer já lida com as bordas
  },
  eventCard: {
    width: width * 0.7,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    color: '#333',
  },
  eventCardDetails: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});