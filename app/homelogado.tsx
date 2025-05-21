import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react'; // Importa useState também

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardWidth = width * 0.7; // Largura do card
  const cardMarginRight = 15; // Margem direita do card
  const [currentScrollX, setCurrentScrollX] = useState(0); // Novo estado para a posição de scroll atual

  // Dados mockados para os eventos do carrossel
  const events = [
    {
      id: '1',
      image: require('../assets/images/festajunina.jpg'),
      text: 'Expo Ecomm Circuito 2025',
      details: 'Goiânia 2025 | Terça-feira, 14 Out. • 13h',
    },
    {
      id: '2',
      image: require('../assets/images/festajunina.jpg'),
      text: 'Ceará Trap Music Festival',
      details: 'Fortaleza - CE | Sábado, 28 Set. • 19h',
    },
    {
      id: '3',
      image: require('../assets/images/festajunina.jpg'),
      text: 'Festa Junina',
      details: 'APAE 2025 | Terça-feira, 14 Out. • 13h',
    },
    {
      id: '4',
      image: require('../assets/images/festajunina.jpg'),
      text: 'Mega Encontro Tech',
      details: 'São Paulo - SP | Sexta-feira, 05 Dez. • 09h',
    },
    {
      id: '5',
      image: require('../assets/images/festajunina.jpg'),
      text: 'Conferência de IA',
      details: 'Rio de Janeiro - RJ | Quarta-feira, 20 Nov. • 10h',
    },
  ];

  const handleLoginPress = () => {
    router.push('/login');
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
      const maxScrollX = (events.length * (cardWidth + cardMarginRight)) - width + cardMarginRight;
      const newX = Math.min(maxScrollX, currentScrollX + (cardWidth + cardMarginRight));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar / Header */}
    <LinearGradient
          colors={['#007AFF', '#5DADE2']} // Cores de gradiente azul
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <ThemedView style={styles.headerContent}>
            <Image
              source={require('../assets/images/logoapae.png')}
              style={styles.headerLogo}
            />
            <ThemedText style={styles.headerTitle}>APAE</ThemedText>
            <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
              <ThemedText style={styles.loginButtonText}>login</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </LinearGradient>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText style={styles.eventsSectionTitle}>Eventos</ThemedText>

          {/* Carousel / Horizontal Scroll of Events with Navigation Arrows */}
          <ThemedView style={styles.carouselContainer}>
            <TouchableOpacity onPress={scrollLeft} style={styles.arrowButton}>
              <IconSymbol size={30} name='chevron.left' color='#333' />
            </TouchableOpacity>

            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsCarousel}
              snapToInterval={cardWidth + cardMarginRight}
              decelerationRate="fast"
              onScroll={handleScroll} // Adiciona o handler de scroll
              scrollEventThrottle={16} // Otimiza a frequência do evento de scroll
            >
              {events.map(event => (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <Image source={event.image} style={styles.eventImage} />
                  <ThemedText style={styles.eventCardText}>{event.text}</ThemedText>
                  <ThemedText style={styles.eventCardDetails}>{event.details}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={scrollRight} style={styles.arrowButton}>
              <IconSymbol size={30} name='chevron.right' color='#333' />
            </TouchableOpacity>
          </ThemedView>

          {/* Espaço para mais conteúdo abaixo do carrossel se necessário */}
        </ScrollView>
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
    height: 80,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'transparent',
  },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  scrollContent: {
    padding: 20,
  },
  eventsSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  arrowButton: {
    padding: 10,
  },
  eventsCarousel: {
    paddingBottom: 20,
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