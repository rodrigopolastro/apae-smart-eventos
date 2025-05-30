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
  // Ajuste a largura do card para permitir a visualização parcial dos cards adjacentes
  const cardWidth = width * 0.85; // 85% da largura da tela para o card principal
  const cardSpacing = 10; // Espaçamento entre os cards
  const [activeIndex, setActiveIndex] = useState(0); // Estado para o índice do card ativo
  const [currentScrollX, setCurrentScrollX] = useState(0); // Movido para dentro do componente

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
    // Calcula o índice do card ativo com base na posição do scroll
    const newIndex = Math.round(contentOffsetX / (cardWidth + cardSpacing));
    setActiveIndex(newIndex);
    setCurrentScrollX(contentOffsetX); // Atualiza currentScrollX aqui
  };

  // Funções scrollLeft e scrollRight não são mais necessárias com a remoção das setas
  // Mas mantidas caso queira reintroduzir a navegação por botão no futuro.
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
        {/* Corpo principal com azul mais claro */}
        <ThemedView style={styles.bodyContainer}>
          {/* Texto "Eventos APAE" com fundo amarelo */}
          <ThemedView style={styles.eventsApaeContainer}>
            <ThemedText style={styles.eventsApaeText}>Eventos APAE</ThemedText>
          </ThemedView>

          {/* Carrossel de Eventos */}
          <ThemedView style={styles.carouselContainer}>
            {/* Removido TouchableOpacity para as setas */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsCarousel}
              snapToInterval={cardWidth + cardSpacing} // Ajustado para o novo espaçamento
              decelerationRate="fast"
              onScroll={handleScroll} // Atualiza o índice do card ativo
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
            {/* Removido TouchableOpacity para as setas */}
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
    position: 'absolute',
    zIndex: 2,
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
    paddingTop: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 100,
    zIndex: 1,
  },
  centerLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    position: 'absolute',
    top: 25,
    left: (width / 2) - 75,
    zIndex: 3,
  },
  eventsApaeContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 75,
  },
  eventsApaeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  carouselContainer: {
    // Removido flexDirection, alignItems, justifyContent pois as setas foram removidas
    marginBottom: 20,
    width: '100%',
  },
  // Removido arrowButton e arrowText styles
  carouselScrollView: {
    flex: 1,
    // Adicionado paddingHorizontal para mostrar os cards adjacentes
    paddingHorizontal: (width - (width * 0.85)) / 2,
  },
  eventsCarousel: {
    paddingBottom: 20,
    // Removido paddingRight
  },
  eventCard: {
    width: width * 0.85, // Largura do card principal
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
    marginBottom: 10, // Espaçamento para os pontos de paginação
  },
  eventImage: {
    width: '100%',
    height: 200, // Aumentado para dar mais destaque à imagem
    resizeMode: 'cover',
  },
  eventCardTitle: { // Novo estilo para o título do evento
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 10,
    color: '#333',
  },
  eventCardLocation: { // Novo estilo para o local
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    marginTop: 5,
  },
  eventCardDate: { // Novo estilo para a data
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
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF', // Cor do ponto ativo
    width: 10, // Levemente maior
    height: 10,
    borderRadius: 5,
  },
});