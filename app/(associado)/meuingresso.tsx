import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import QRCodeModal from '@/components/QRCodeModal';
import { useAuthStore } from '@/hooks/useAuthStore'; // 1. Importar a loja de autenticação
import api from '../../api';
import CustomHeader from '../../components/CustomHeaderLogin';
import formatDate from '../../helpers/formatDate';
import { database, LocalTicket } from '../../services/database';

export default function MyTicketsScreen() {
  const router = useRouter();
  const { user } = useAuthStore(); // 2. Obter o usuário logado da loja

  const [userTickets, setUserTickets] = useState<LocalTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [qrCodeModalVisible, setQrCodeModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<LocalTicket | null>(null);

  useEffect(() => {
    database.initDatabase();
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
      // O fetch agora depende do 'user', então o adicionamos como dependência do useEffect
    });
    return () => unsubscribe();
  }, []);

  // Adicionamos um novo useEffect para rodar o fetchTickets sempre que o usuário mudar (ex: ao logar)
  useEffect(() => {
    fetchTickets(isOffline);
  }, [user, isOffline]);

  // 3. Função fetchTickets corrigida para usar o ID do usuário dinâmico
  const fetchTickets = async (offline: boolean) => {
    setLoading(true);

    // Se não houver usuário logado, não há o que buscar.
    if (!user) {
      setUserTickets([]);
      setLoading(false);
      return;
    }

    try {
      if (offline) {
        const localTickets = await database.getLocalTickets();
        setUserTickets(localTickets);
      } else {
        const loggedUserId = user.id; // <-- USA O ID DO USUÁRIO REAL
        const response = await api.get(`/users/${loggedUserId}/tickets`);
        const apiTickets: LocalTicket[] = response.data;
        setUserTickets(apiTickets);
        database.saveTickets(apiTickets); // Salva os ingressos mais recentes no cache local
      }
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      try {
        const localTickets = await database.getLocalTickets();
        if (localTickets.length > 0) {
          setUserTickets(localTickets);
          Alert.alert("Erro de Conexão", "Não foi possível atualizar. Exibindo ingressos salvos.");
        }
      } catch (dbError) {
        console.error("Erro ao buscar ingressos do DB local:", dbError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewQRCode = (ticket: LocalTicket) => {
    setSelectedTicket(ticket);
    setQrCodeModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <CustomHeader />
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Você está offline</Text>
        </View>
      )}
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />
        ) : userTickets.length > 0 ? (
          userTickets.map((ticket) => ( // Removido o 'index' desnecessário
            <View key={ticket.ticketId} style={styles.ticketCard}>
              <View style={styles.ticketInfoContainer}>
                <Text style={styles.eventName}>{ticket.eventName}</Text>
                <Text style={styles.ticketType}>{ticket.ticketType}</Text>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color="#555" />
                    <Text style={styles.detailText}>{ticket.userName}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#555" />
                    <Text style={styles.detailText}>{ticket.eventLocation}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#555" />
                    <Text style={styles.detailText}>{formatDate(ticket.purchasedAt)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.qrCodeButton}
                onPress={() => handleViewQRCode(ticket)}
              >
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.qrCodeGradient}>
                  <Ionicons name='qr-code' size={20} color='#fff' />
                  <Text style={styles.qrCodeButtonText}>Ver QR Code</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noTicketsContainer}>
            <Text style={styles.noTicketsText}>
              {user ? "Você ainda não possui ingressos." : "Faça login para ver seus ingressos."}
            </Text>
          </View>
        )}
      </ScrollView>

      {selectedTicket && (
        <QRCodeModal
          isVisible={qrCodeModalVisible}
          onClose={() => setQrCodeModalVisible(false)}
          ticket={selectedTicket}
        />
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  offlineBanner: {
    backgroundColor: '#ffc107',
    padding: 8,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  ticketInfoContainer: {
    padding: 20,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  qrCodeButton: {},
  qrCodeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  qrCodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noTicketsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '40%',
  },
  noTicketsText: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center'
  },
});