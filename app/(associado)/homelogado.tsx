import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Definindo interfaces para tipagem
interface UserTicket {
  count: number;
  qrCode: string;
}

interface UserTickets {
  [key: string]: UserTicket;
}

interface Event {
  id: string;
  image: any;
  text: string;
  details: string;
}

// Dados mockados dos ingressos do usuário com tipagem
const userTickets: UserTickets = {
  '1': { count: 2, qrCode: 'https://example.com/qrcode1.pdf' }, // Expo Ecomm Circuito
  '3': { count: 4, qrCode: 'https://example.com/qrcode3.pdf' }, // Festa Junina
  '5': { count: 1, qrCode: 'https://example.com/qrcode5.pdf' }  // Conferência de IA
};

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardWidth = width * 0.7;
  const cardMarginRight = 15;
  const [currentScrollX, setCurrentScrollX] = useState(0);

  // Dados mockados para os eventos do carrossel com tipagem
  const events: Event[] = [
    {
      id: '1',
      image: require('../../assets/images/festajunina.jpg'),
      text: 'Expo Ecomm Circuito 2025',
      details: 'Goiânia 2025 | Terça-feira, 14 Out. • 13h',
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
      text: 'Festa Junina',
      details: 'APAE 2025 | Terça-feira, 14 Out. • 13h',
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

  const handleMyTicketsPress = () => {
    router.push('/meuingresso');
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: '/eventdescription', params: { eventId: eventId } });
  };

  const handleViewQRCode = (eventId: string) => {
    const qrCodeUrl = userTickets[eventId]?.qrCode;
    if (qrCodeUrl) {
      alert(`Abrindo QRCode para evento ${eventId}\nURL: ${qrCodeUrl}`);
    }
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
        {/* Top Bar / Header */}
        <LinearGradient
          colors={['#007AFF', '#5DADE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <ThemedView style={styles.headerContent}>
            <Image
              source={require('../../assets/images/logoapae.png')}
              style={styles.headerLogo}
            />
            <ThemedText style={styles.headerTitle}>APAE</ThemedText>
            <TouchableOpacity onPress={handleMyTicketsPress} style={styles.myTicketsButton}>
              <View style={styles.ticketBadge}>
                <ThemedText style={styles.ticketBadgeText}>
                  {Object.values(userTickets).reduce((total, ticket) => total + ticket.count, 0)}
                </ThemedText>
              </View>
              <ThemedText style={styles.myTicketsButtonText}>Meus Ingressos</ThemedText>
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
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {events.map(event => (
                <View key={event.id} style={styles.eventCardContainer}>
                  <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(event.id)}>
                    <Image source={event.image} style={styles.eventImage} />
                    <ThemedText style={styles.eventCardText}>{event.text}</ThemedText>
                    <ThemedText style={styles.eventCardDetails}>{event.details}</ThemedText>
                  </TouchableOpacity>
                  
                  {/* Badge de ingressos comprados */}
                  {userTickets[event.id] && (
                    <View style={styles.eventTicketInfo}>
                      <ThemedText style={styles.ticketCountText}>
                        {userTickets[event.id].count} ingresso(s) comprado(s)
                      </ThemedText>
                      <TouchableOpacity 
                        style={styles.viewQRButton}
                        onPress={() => handleViewQRCode(event.id)}
                      >
                        <ThemedText style={styles.viewQRButtonText}>Ver QRCode</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={scrollRight} style={styles.arrowButton}>
              <IconSymbol size={30} name='chevron.right' color='#333' />
            </TouchableOpacity>
          </ThemedView>
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
  myTicketsButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  myTicketsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ticketBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  ticketBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
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
  eventCardContainer: {
    position: 'relative',
    marginRight: 15,
  },
  eventCard: {
    width: width * 0.7,
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
  eventTicketInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    marginTop: -5,
  },
  ticketCountText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  viewQRButton: {
    backgroundColor: '#34C759',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  viewQRButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});