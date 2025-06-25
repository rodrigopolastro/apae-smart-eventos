import CustomHeader from '@/components/CustomHeader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Defina a URL base da sua API.
// Substitua 'YOUR_API_BASE_URL' pela URL real do seu backend
// (ex: 'http://localhost:3000' ou o IP da sua máquina se estiver testando em um dispositivo físico).
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date_time: string; // Ou Date, dependendo de como você prefere manipular datas no front
  cover_image_bucket?: string;
  cover_image_path?: string;
  imageUrl?: string; // Para a URL assinada
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardWidth = width * 0.85;
  const cardSpacing = 10;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/events`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Event[] = await response.json();

        // Para cada evento, buscar a URL da imagem de capa
        const eventsWithImages = await Promise.all(
          data.map(async (event) => {
            if (event.cover_image_bucket && event.cover_image_path) {
              try {
                const imageResponse = await fetch(`${API_BASE_URL}/events/${event.id}/imageUrl`);
                if (imageResponse.ok) {
                  const imageData = await imageResponse.json();
                  return { ...event, imageUrl: imageData.imageUrl };
                } else {
                  console.warn(
                    `Could not fetch image for event ${event.id}:`,
                    imageResponse.status
                  );
                  return { ...event, imageUrl: undefined }; // Ou um placeholder
                }
              } catch (imgError) {
                console.error(`Error fetching image for event ${event.id}:`, imgError);
                return { ...event, imageUrl: undefined }; // Ou um placeholder
              }
            }
            return { ...event, imageUrl: undefined }; // Ou um placeholder
          })
        );
        setEvents(eventsWithImages);
      } catch (e: any) {
        console.error('Failed to fetch events:', e);
        setError(e.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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

  // Funções scrollLeft e scrollRight não são mais estritamente necessárias se você está usando snapToInterval
  // e dependendo do comportamento de scroll do usuário. Mantive-as comentadas caso queira reintroduzi-las.
  // const scrollLeft = () => {
  //   if (scrollViewRef.current) {
  //     const newX = Math.max(0, currentScrollX - (cardWidth + cardSpacing));
  //     scrollViewRef.current.scrollTo({ x: newX, animated: true });
  //   }
  // };

  // const scrollRight = () => {
  //   if (scrollViewRef.current) {
  //     const maxScrollX = (events.length * (cardWidth + cardSpacing)) - width + cardSpacing;
  //     const newX = Math.min(maxScrollX, currentScrollX + (cardWidth + cardSpacing));
  //     scrollViewRef.current.scrollTo({ x: newX, animated: true });
  //   }
  // };

  // Função auxiliar para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString('pt-BR', options).replace('.', ''); // Ex: "12 Set. 2025"
  };

  // Função auxiliar para formatar a data/hora para eventos com hora específica
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    return (
      date.toLocaleDateString('pt-BR', options) +
      ' • ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#006db2' />
        <ThemedText style={styles.loadingText}>Carregando eventos...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Erro ao carregar eventos: {error}</ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null); /* Recarrega os eventos */
          }}
        >
          <ThemedText style={styles.retryButtonText}>Tentar Novamente</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <CustomHeader />

          <ThemedView style={styles.bodyContentWrapper}>
            <ThemedView style={styles.eventsApaeContainer}>
              <ThemedText style={styles.eventsApaeText}>Principais Eventos do Mês</ThemedText>
            </ThemedView>

            {/* Carrossel de Eventos (apenas os 3 primeiros ou quantos quiser) */}
            {events.length > 0 && (
              <ThemedView style={styles.carouselContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.eventsCarousel}
                  snapToInterval={cardWidth + cardSpacing}
                  decelerationRate='fast'
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  {events.slice(0, 3).map((event, index) => (
                    <TouchableOpacity
                      key={event.id}
                      style={[styles.eventCard, { marginRight: cardSpacing }]}
                      onPress={() => handleEventPress(event.id)}
                    >
                      <Image
                        source={
                          event.imageUrl
                            ? { uri: event.imageUrl }
                            : require('../../assets/images/festajunina.jpg')
                        } // Fallback para imagem local
                        style={styles.eventImage}
                      />
                      <ThemedText style={styles.eventCardTitle}>{event.name}</ThemedText>
                      <ThemedText style={styles.eventCardLocation}>{event.location}</ThemedText>
                      <ThemedText style={styles.eventCardDate}>
                        {formatDate(event.date_time)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ThemedView>
            )}

            {/* Pontos de Paginação */}
            {events.length > 0 && (
              <ThemedView style={styles.paginationDotsContainer}>
                {events.slice(0, 3).map((_, index) => (
                  <ThemedView
                    key={index}
                    style={[
                      styles.paginationDot,
                      activeIndex === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </ThemedView>
            )}

            {/* Lista de Todos os Eventos (vertical) */}
            <ThemedView style={styles.allEventsListContainer}>
              <ThemedText style={styles.allEventsListTitle}>Todos os Eventos</ThemedText>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id + '-list'}
                  style={styles.listItemCard}
                  onPress={() => handleEventPress(event.id)}
                >
                  <Image
                    source={
                      event.imageUrl
                        ? { uri: event.imageUrl }
                        : require('../../assets/images/festajunina.jpg')
                    } // Fallback para imagem local
                    style={styles.listItemImage}
                  />
                  <ThemedView style={styles.listItemTextContent}>
                    <ThemedText style={styles.listItemTitle}>{event.name}</ThemedText>
                    <ThemedText style={styles.listItemLocation}>{event.location}</ThemedText>
                    <ThemedText style={styles.listItemDate}>
                      {formatDateTime(event.date_time)}
                    </ThemedText>
                    <ThemedText style={styles.listItemDescription} numberOfLines={2}>
                      {event.description}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  bodyContentWrapper: {
    width: '100%',
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  eventsApaeContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 3,
    marginTop: 10,
  },
  eventsApaeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  carouselContainer: {
    width: '100%',
    padding: 10,
    height: 300,
    backgroundColor: 'transparent',
  },
  carouselScrollView: {
    flex: 1,
    paddingHorizontal: (width - width * 0.85) / 2,
  },
  eventsCarousel: {
    paddingBottom: 20,
  },
  eventCard: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: 'yellow',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 10,
    color: '#333',
  },
  eventCardLocation: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    marginTop: 5,
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
    marginTop: 0,
    borderRadius: 20,
    padding: 5,
    backgroundColor: 'transparent',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'yellow',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#006db2',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  allEventsListContainer: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  allEventsListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'left',
  },
  listItemCard: {
    flexDirection: 'row',
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
    marginBottom: 15,
  },
  listItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 8,
    margin: 10,
  },
  listItemTextContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  listItemLocation: {
    fontSize: 13,
    color: '#666',
  },
  listItemDate: {
    fontSize: 13,
    color: '#666',
  },
  listItemDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#006db2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
