import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Certifique-se de que está importado, embora não usado diretamente aqui

// Importe o novo componente de cabeçalho
import CustomHeader from '../../components/CustomHeaderLogin'; // Ajuste o caminho conforme sua estrutura de pastas

const { width } = Dimensions.get('window');

// Dados mockados dos ingressos do usuário
const userTickets = [
  {
    id: 't1',
    eventId: '1',
    eventName: 'Expo Ecomm Circuito 2025',
    eventDate: '14/10/2025 • 13h',
    eventLocation: 'Goiânia - GO',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'VIP',
    price: 250.00,
    qrCode: 'https://example.com/qrcode1.pdf',
    purchaseDate: '10/05/2025',
    category: 'Tecnologia'
  },
  {
    id: 't2',
    eventId: '1',
    eventName: 'Expo Ecomm Circuito 2025',
    eventDate: '14/10/2025 • 13h',
    eventLocation: 'Goiânia - GO',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'Normal',
    price: 120.00,
    qrCode: 'https://example.com/qrcode2.pdf',
    purchaseDate: '10/05/2025',
    category: 'Tecnologia'
  },
  {
    id: 't3',
    eventId: '3',
    eventName: 'Festa Junina APAE',
    eventDate: '14/06/2025 • 13h',
    eventLocation: 'APAE Local',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'Meia',
    price: 60.00,
    qrCode: 'https://example.com/qrcode3.pdf',
    purchaseDate: '20/05/2025',
    category: 'Cultural'
  },
  {
    id: 't4',
    eventId: '5',
    eventName: 'Conferência de IA',
    eventDate: '20/11/2025 • 10h',
    eventLocation: 'Rio de Janeiro - RJ',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'Normal',
    price: 120.00,
    qrCode: 'https://example.com/qrcode4.pdf',
    purchaseDate: '01/06/2025',
    category: 'Tech'
  }
];

export default function MyTicketsScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleViewEvent = (eventId: string) => {
    router.push({ pathname: '/eventdescription', params: { eventId } });
  };

  const handleViewQRCode = (ticketId: string) => {
    const ticket = userTickets.find(t => t.id === ticketId);
    alert(`Abrindo QRCode para ingresso ${ticketId}\nEvento: ${ticket?.eventName}\nURL: ${ticket?.qrCode}`);
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

  const getTicketTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'VIP': '#FF9500',
      'Normal': '#007AFF',
      'Meia': '#34C759'
    };
    return colors[type] || '#007AFF';
  };

  const totalValue = userTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Adicione o CustomHeader aqui */}
        <CustomHeader />

        {/* Padding superior para garantir que o conteúdo não fique escondido atrás do cabeçalho */}
        <View style={styles.contentPaddingTop}>
          {/* Badge de status */}
          <View style={styles.sectionHeader}>
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.badge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.badgeText}>✅ Ingressos Ativos</Text>
              </LinearGradient>
            </View>
            <Text style={styles.sectionSubtitle}>Toque para ver detalhes ou QR Code</Text>
          </View>

          {/* Lista de Ingressos - estilo similar aos eventos */}
          <View style={styles.ticketsSection}>
            {userTickets.map((ticket, index) => (
              <TouchableOpacity 
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => handleViewEvent(ticket.eventId)}
                activeOpacity={0.8}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={ticket.eventImage} style={styles.ticketImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                  />
                  
                  {/* Badge da categoria */}
                  <View style={styles.categoryBadge}>
                    <Text style={[styles.categoryText, { backgroundColor: getCategoryColor(ticket.category) }]}>
                      {ticket.category}
                    </Text>
                  </View>
                  
                  {/* Badge do tipo de ingresso */}
                  <View style={styles.ticketTypeBadge}>
                    <Text style={[styles.ticketTypeText, { backgroundColor: getTicketTypeColor(ticket.type) }]}>
                      {ticket.type}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {ticket.eventName}
                  </Text>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText} numberOfLines={1}>
                        {ticket.eventLocation}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailText}>
                        {ticket.eventDate}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>💰</Text>
                      <Text style={styles.detailText}>
                        {ticket.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>🛒</Text>
                      <Text style={styles.detailText}>
                        Comprado em {ticket.purchaseDate}
                      </Text>
                    </View>
                  </View>

                  {/* Botão QR Code */}
                  <TouchableOpacity 
                    style={styles.qrCodeButton}
                    onPress={() => handleViewQRCode(ticket.id)}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.qrCodeGradient}
                    >
                      <Ionicons name="qr-code" size={20} color="#fff" />
                      <Text style={styles.qrCodeButtonText}>Ver QR Code</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 50,
  },
  body: {
    flex: 1,
  },
  // Adicionado padding superior para o conteúdo abaixo do cabeçalho
  contentPaddingTop: {
    paddingTop: 65, // Ajuste este valor se o cabeçalho cobrir o conteúdo. Este valor empurra o conteúdo para baixo.
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
  ticketsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 180,
  },
  ticketImage: {
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
  ticketTypeBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  ticketTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
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
    marginBottom: 16,
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
  qrCodeButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrCodeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  qrCodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});