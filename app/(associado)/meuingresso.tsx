import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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

import { Buffer } from 'buffer'; // Manter esta linha

// Importar expo-file-system
import * as FileSystem from 'expo-file-system'; // <-- Adicione esta linha

import CustomHeader from '../../components/CustomHeaderLogin';
import { TicketPdfModal } from '../../components/TicketPdfModal';

const { width } = Dimensions.get('window');

export default function MyTicketsScreen() {
  const router = useRouter();
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Renomear pdfBase64 para pdfUri, pois agora armazenará uma URI de arquivo local
  const [pdfUri, setPdfUri] = useState<string | null>(null); // <-- Alterado aqui

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const loggedUserId = 3;
        const response = await api.get(`/users/${loggedUserId}/tickets`);
        setUserTickets(response.data);
      } catch (error) {
        console.error('Erro ao buscar os ingressos do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar seus ingressos. Verifique sua conexão ou tente mais tarde.');
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
    try {
      const response = await api.get(`/tickets/${ticketQrCodeId}/printTicket`);

      if (!response.data) {
        console.error('Dados do PDF vazios ou inválidos na resposta do backend.');
        Alert.alert('Erro', 'Não foi possível carregar o PDF do ingresso: dados ausentes ou inválidos.');
        return;
      }

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');

      // --- LOGS DE DEPURAÇÃO (opcionais, mas úteis para verificar o Base64) ---
      console.log('--- DEPURANDO PDF BASE64 (ANTES DE SALVAR NO ARQUIVO) ---');
      console.log('Início da string Base64 do PDF (primeiros 100 caracteres):', base64.substring(0, 100));
      console.log('Tamanho total da string Base64 do PDF:', base64.length, 'caracteres');
      console.log('--- FIM DA DEPURACAO PDF BASE64 ---');
      // --- FIM DOS LOGS DE DEPURACAO ---

      // SALVAR O PDF BASE64 EM UM ARQUIVO LOCAL
      const fileName = `ticket_${ticketQrCodeId}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(
        fileUri,
        base64,
        { encoding: FileSystem.EncodingType.Base64 } // Especifique o encoding como Base64
      );
      console.log('PDF salvo localmente em:', fileUri);

      setPdfUri(fileUri); // Define a URI do arquivo local para o estado
      setIsModalVisible(true); // Abre o modal
    } catch (error) {
      console.error('Erro ao gerar/salvar o QR Code/PDF:', error);
      Alert.alert('Erro', 'Não foi possível carregar o QR Code/PDF. Verifique sua conexão ou tente novamente mais tarde.');
    }
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
      {/* Componente Modal para exibir o PDF */}
      <TicketPdfModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        // Passar pdfUri para o modal
        pdfUri={pdfUri} // <-- Alterado aqui
      />
      <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <CustomHeader />

        <View style={styles.contentPaddingTop}>
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
  contentPaddingTop: {
    paddingTop: 65,
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