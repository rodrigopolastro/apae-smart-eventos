import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  const cardWidth = width * 0.8;
  const cardSpacing = 20;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);

  const events = [
    {
      id: '1',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'O Jardim do Inimigo 25 anos',
      location: 'Fortaleza - CE',
      date: '12 - 13 Set',
      category: 'Música',
      participants: '2.5k',
    },
    {
      id: '2',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Ceará Trap Music Festival',
      location: 'Fortaleza - CE',
      date: '28 Set • 19h',
      category: 'Festival',
      participants: '1.8k',
    },
    {
      id: '3',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Festa Junina APAE',
      location: 'APAE Local',
      date: '14 Jun • 13h',
      category: 'Cultural',
      participants: '500',
    },
    {
      id: '4',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Mega Encontro Tech',
      location: 'São Paulo - SP',
      date: '05 Dez • 09h',
      category: 'Tecnologia',
      participants: '3.2k',
    },
    {
      id: '5',
      image: require('../../assets/images/festajunina.jpg'),
      title: 'Conferência de IA',
      location: 'Rio de Janeiro - RJ',
      date: '20 Nov • 10h',
      category: 'Tech',
      participants: '1.5k',
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Música': '#FF6B6B',
      'Festival': '#4ECDC4',
      'Cultural': '#45B7D1',
      'Tecnologia': '#96CEB4',
      'Tech': '#FECA57'
    };
    return colors[category] || '#DDA0DD';
  };

  // Debug: Vamos verificar os eventos que deveriam aparecer na lista vertical
  const carouselEvents = events.slice(0, 3);
  const verticalEvents = events.slice(3);
  
  console.log('Total de eventos:', events.length);
  console.log('Eventos do carrossel:', carouselEvents.length);
  console.log('Eventos da lista vertical:', verticalEvents.length);
  console.log('Eventos verticais:', verticalEvents.map(e => e.title));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Olá! 👋</Text>
              <Text style={styles.subtitle}>Descubra eventos incríveis</Text>
            </View>
            <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/SmartEventos2.png')}
              style={styles.centerLogo}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Corpo principal */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Badge "Eventos APAE" */}
        <View style={styles.sectionHeader}>
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.badgeText}>✨ Eventos APAE</Text>
            </LinearGradient>
          </View>
          <Text style={styles.sectionSubtitle}>Próximos eventos para você</Text>
        </View>

        {/* Carrossel de eventos (primeiros 3) */}
        <View style={styles.carouselSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={cardWidth + cardSpacing}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            pagingEnabled={false}
          >
            {carouselEvents.map((event, index) => (
              <TouchableOpacity 
                key={event.id} 
                style={[styles.eventCard, { marginRight: index === carouselEvents.length - 1 ? 20 : cardSpacing }]}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.9}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={event.image} style={styles.eventImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                  />
                  <View style={styles.categoryBadge}>
                    <Text style={[styles.categoryText, { backgroundColor: getCategoryColor(event.category) }]}>
                      {event.category}
                    </Text>
                  </View>
                  <View style={styles.participantsContainer}>
                    <Text style={styles.participantsText}>👥 {event.participants}</Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailText}>
                        {event.date}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Indicadores de paginação */}
        <View style={styles.paginationContainer}>
          {carouselEvents.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Lista vertical dos outros eventos - SEMPRE MOSTRAR PARA DEBUG */}
        <View style={styles.otherEventsSection}>
          <Text style={styles.otherEventsTitle}>
            Outros Eventos ({verticalEvents.length})
          </Text>
          {verticalEvents.length > 0 ? (
            <View style={styles.verticalEventsList}>
              {verticalEvents.map((event) => (
                <TouchableOpacity 
                  key={event.id}
                  style={styles.verticalEventCard}
                  onPress={() => handleEventPress(event.id)}
                  activeOpacity={0.8}
                >
                  <Image source={event.image} style={styles.verticalEventImage} />
                  <View style={styles.verticalEventContent}>
                    <View style={styles.verticalEventHeader}>
                      <Text style={styles.verticalEventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={[styles.verticalCategoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                        <Text style={styles.verticalCategoryText}>{event.category}</Text>
                      </View>
                    </View>
                    <View style={styles.verticalEventDetails}>
                      <View style={styles.verticalDetailRow}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.verticalDetailText} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.verticalDetailRow}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={styles.verticalDetailText}>
                          {event.date}
                        </Text>
                      </View>
                      <View style={styles.verticalDetailRow}>
                        <Text style={styles.detailIcon}>👥</Text>
                        <Text style={styles.verticalDetailText}>
                          {event.participants} participantes
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noEventsText}>Nenhum evento adicional encontrado</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  centerLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  body: {
    flex: 1,
    paddingTop: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  badgeContainer: {
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  carouselSection: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingLeft: 20,
  },
  eventCard: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  participantsContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  participantsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 24,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  paginationDotActive: {
    backgroundColor: '#667eea',
    width: 24,
    borderRadius: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  // Estilos para a seção de outros eventos
  otherEventsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  otherEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  verticalEventsList: {
    gap: 12,
  },
  verticalEventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verticalEventImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  verticalEventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  verticalEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  verticalEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  verticalCategoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  verticalCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  verticalEventDetails: {
    gap: 4,
  },
  verticalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalDetailText: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});