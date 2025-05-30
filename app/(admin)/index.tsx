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

  const events = [
    {
      id: '1',
      image: require('../../assets/images/festajunina.jpg'),
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
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={['#003366', '#004080']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        <Image
          source={require('../../assets/images/SmartEventos2.png')}
          style={styles.centerLogo}
        />

        <ThemedView style={styles.bodyContainer}>
          <ThemedView style={styles.eventsApaeContainer}>
            <ThemedText style={styles.eventsApaeText}>Eventos APAE</ThemedText>
          </ThemedView>

          {/* Carrossel horizontal */}
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
            {events.map((event) => (
              <TouchableOpacity key={event.id} style={[styles.eventCard, { marginRight: cardSpacing }]} onPress={() => handleEventPress(event.id)}>
                <Image source={event.image} style={styles.eventImage} />
                <ThemedText style={styles.eventCardTitle}>{event.title}</ThemedText>
                <ThemedText style={styles.eventCardLocation}>{event.location}</ThemedText>
                <ThemedText style={styles.eventCardDate}>{event.date}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dots de navegação */}
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

          {/* Lista vertical dos mesmos eventos */}
          {events.map((event) => (
            <TouchableOpacity key={event.id + '-list'} style={styles.eventCard} onPress={() => handleEventPress(event.id)}>
              <Image source={event.image} style={styles.eventImage} />
              <ThemedText style={styles.eventCardTitle}>{event.title}</ThemedText>
              <ThemedText style={styles.eventCardLocation}>{event.location}</ThemedText>
              <ThemedText style={styles.eventCardDate}>{event.date}</ThemedText>
            </TouchableOpacity>
          ))}
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
  scrollContainer: {
  flex: 1,
  backgroundColor: '#ADD8E6',
},
  bodyContainer: {
    flex: 1,
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
    paddingTop: 225,
   // borderTopLeftRadius: 30,
   // borderTopRightRadius: 30,
    //position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topBar: {
    width: width - 40,
    height: 160,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: 10,
    borderRadius: 30,
    position: 'absolute',
    zIndex: 2,
    top: 50,
    left: 20,
    right: 20,
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
  centerLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    position: 'absolute',
    top: 120,
    left: (width / 2) - 75,
    zIndex: 3,
    borderRadius: 30,
  },
  eventsApaeContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 70,
  },
  eventsApaeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  carouselContainer: {
    marginBottom: 20,
    width: '90%',
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 20,
  },
  carouselScrollView: {
    flex: 1,
    paddingHorizontal: (width - (width * 0.85)) / 2,
  },
  eventsCarousel: {
    paddingBottom: 20,
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
    height: 200,
    resizeMode: 'cover',
  },
  eventCardTitle: {
    fontSize: 20,
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
    backgroundColor: '#007AFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventsList: {
    width: '90%',
  },
});
