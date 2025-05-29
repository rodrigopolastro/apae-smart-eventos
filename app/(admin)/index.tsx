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
  const cardWidth = width * 0.85;
  const cardSpacing = 10;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);

  // Dados mockados para os eventos do carrossel com novos detalhes
  const events = [
    {
      id: '1',
      image: require('../../assets/images/festajunina.jpg'), // Imagem para o primeiro card
      // Corrigido: Usar 'title', 'location', 'date' para corresponder ao uso abaixo
      title: 'O Jardim do Inimigo 25 anos -',
      location: 'Fortaleza',
      date: 'Fortaleza - CE\n12 Set. a 13 Set.',
    },
    {
      id: '2',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Ceará Trap Music Festival',
      location: 'Fortaleza - CE',
      date: 'Sábado, 28 Set. • 19h',
    },
    {
      id: '3',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Festa Junina APAE',
      location: 'APAE Local',
      date: 'Terça-feira, 14 Jun. • 13h',
    },
    {
      id: '4',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Mega Encontro Tech',
      location: 'São Paulo - SP',
      date: 'Sexta-feira, 05 Dez. • 09h',
    },
    {
      id: '5',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Conferência de IA',
      location: 'Rio de Janeiro - RJ',
      date: 'Quarta-feira, 20 Nov. • 10h',
    },
  ];

   const handleLoginPress = () => {
    router.push('/login');
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: '/eventdescription', params: { eventId: eventId } });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (cardWidth + cardSpacing));
    setActiveIndex(newIndex);
    setCurrentScrollX(contentOffsetX);
  };

  const scrollLeft = () => {
    if (scrollViewRef.current) {
      const newX = Math.max(0, currentScrollX - (cardWidth + cardSpacing));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  const scrollRight = () => {
    if (scrollViewRef.current) {
      const maxScrollX = (events.length * (cardWidth + cardSpacing)) - width + cardSpacing;
      const newX = Math.min(maxScrollX, currentScrollX + (cardWidth + cardSpacing));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Corpo principal com azul mais claro - Ocupa toda a tela */}
        <ThemedView style={styles.bodyContainer}>
          {/* O conteúdo real do bodyContainer será empurrado para baixo pelo paddingTop */}
          {/* Texto "Eventos APAE" com fundo amarelo */}
          <ThemedView style={styles.eventsApaeContainer}>
            <ThemedText style={styles.eventsApaeText}>Eventos APAE</ThemedText>
          </ThemedView>

          {/* Carrossel de Eventos */}
          <ThemedView style={styles.carouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsCarousel}
              snapToInterval={cardWidth + cardSpacing}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {events.map((event, index) => (
                <TouchableOpacity key={event.id} style={[styles.eventCard, { marginRight: cardSpacing }]} onPress={() => handleEventPress(event.id)}>
                  <Image source={event.image} style={styles.eventImage} />
                  <ThemedText style={styles.eventCardTitle}>{event.title}</ThemedText>
                  <ThemedText style={styles.eventCardLocation}>{event.location}</ThemedText>
                  <ThemedText style={styles.eventCardDate}>{event.date}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          {/* Pontos de Paginação */}
          <ThemedView style={styles.paginationDotsContainer}>
            {events.map((_, index) => (
              <ThemedView
                key={index}
                style={[
                  styles.paginationDot,
                  activeIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Top Bar / Header - Posicionada absolutamente acima do bodyContainer */}
        <LinearGradient
          colors={['#003366', '#004080']} // Azul mais escuro
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
            <ThemedText style={styles.loginButtonText}>L</ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        {/* Logo central - Posicionada absolutamente acima de tudo */}
        <Image
          source={require('../../assets/images/SmartEventos2.png')}
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
    width: -40,
    height: 150, // Altura da topBar
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: 10,
    // Removido borderBottomLeftRadius e borderBottomRightRadius para ser uma barra reta
    position: 'absolute', // Permite posicionamento sobre outros elementos
  zIndex: 2, // Fica acima do bodyContainer
    top: 50, // 20px do topo para mostrar o bodyContainer
    left: 20, // 20px da esquerda
    right: 20, // 20px da direita
    borderRadius:20,
  },
  loginButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
    marginRight:10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  bodyContainer: {
    flex: 1, // Ocupa todo o espaço disponível
    backgroundColor: '#ADD8E6', // Azul mais claro
    alignItems: 'center',
    // Empurra o conteúdo para baixo para dar espaço à topBar e à logo
    paddingTop: 225, // 150 (altura topBar) + 75 (metade da logo) = 225
    borderTopLeftRadius: 30, // Cantos arredondados visíveis
    borderTopRightRadius: 30, // Cantos arredondados visíveis
    marginTop: 0, // Começa do topo da SafeAreaView
    zIndex: 1, // Fica abaixo da topBar e da logo
    position: 'absolute', // Permite sobreposição com topBar
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    position: 'absolute',
    // Posiciona a logo no centro da borda entre topBar e bodyContainer
    top: 120, // 150 (altura topBar) - 75 (metade da logo) = 75
    left: (width / 2) -60, // Centraliza horizontalmente
    zIndex: 3, // Acima de topBar e bodyContainer
    borderRadius:30,
    
  },
  eventsApaeContainer: {
    backgroundColor: '#ADD8E6',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 50, // Espaçamento abaixo da área da logo
  },
  eventsApaeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',

  },
  carouselContainer: {
    marginBottom: 20,
    width: '90%',
    padding:15,
    borderRadius:20,
    backgroundColor: '#003366'
  },
  carouselScrollView: {
    flex: 1,
    paddingHorizontal: (width - (width * 0.85)) / 2,
    
  },
  eventsCarousel: {
    paddingBottom: 20,
    borderRadius:20,
  },
  eventCard: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,

  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 20,
    color: '#333',
  },
  eventCardLocation: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  eventCardDate: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginTop: 5,
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
