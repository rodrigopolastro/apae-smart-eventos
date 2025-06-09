import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api';
import formatDate from '../../helpers/formatDate';

// Importe o novo componente de cabeçalho
import CustomHeader from '../../components/CustomHeaderLogin'; // Ajuste o caminho conforme sua estrutura de pastas
import { TicketPdfModal } from '../../components/TicketPdfModal';

const { width } = Dimensions.get('window');

export default function MyTicketsScreen() {
  const router = useRouter();
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>('');

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const loggedUserId = 3;
        const response = await api.get(`/users/${loggedUserId}/tickets`);
        setUserTickets(response.data);
      } catch (error) {
        console.error('Erro ao buscar os ingressos do usuário:', error);
      }
    };
    fetchUserTickets();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleViewEvent = (eventId: string) => {
    router.push({ pathname: '/eventdescriptionlogado', params: { eventId } });
  };

  const handleViewQRCode = async (ticketQrCodeId: string) => {
    const response = await api.get(`/tickets/${ticketQrCodeId}/printTicket`);

    // AQUIIIIIII -- TALITAAA
    const buffer = Buffer.from(response.data);
    const base64 = ''; //????;
    setPdfBase64(base64);
    setIsModalVisible(true);
  };

  const getTicketTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      VIP: '#FF9500',
      Normal: '#007AFF',
      Meia: '#34C759',
    };
    return colors[type] || '#007AFF';
  };

  const totalValue = userTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  return (
    <View style={styles.container}>
      <TicketPdfModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        pdfBase64={pdfBase64}
      />
      <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />

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
                key={index}
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

                  {/* Badge do tipo de ingresso */}
                  <View style={styles.ticketTypeBadge}>
                    <Text
                      style={[
                        styles.ticketTypeText,
                        { backgroundColor: getTicketTypeColor(ticket.ticketTypeId) },
                      ]}
                    >
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
                      <Text style={styles.detailText}>{formatDate(ticket.eventDateTime)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>💰</Text>
                      <Text style={styles.detailText}>
                        {ticket.price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>🛒</Text>
                      <Text style={styles.detailText}>
                        Comprado em {formatDate(ticket.purchasedAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Botão QR Code */}
                  <TouchableOpacity
                    style={styles.qrCodeButton}
                    onPress={() => handleViewQRCode(ticket.qrCodeId)}
                  >
                    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.qrCodeGradient}>
                      <Ionicons name='qr-code' size={20} color='#fff' />
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
