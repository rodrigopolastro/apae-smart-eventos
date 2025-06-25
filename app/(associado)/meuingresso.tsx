import TicketCard from '@/components/TicketCard';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QRCodeModal from '@/components/QRCodeModal';
import { useAuthStore } from '@/hooks/useAuthStore';
import api from '../../api';
import CustomHeader from '../../components/CustomHeaderLogin';
import { database, LocalTicket } from '../../services/database';

export default function MyTicketsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [userTickets, setUserTickets] = useState<LocalTicket[]>([]);
  const [userUsedTickets, setUserUsedTickets] = useState<LocalTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [qrCodeModalVisible, setQrCodeModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<LocalTicket | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    database.initDatabase();
    const unsubscribe = NetInfo.addEventListener((state) => {
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
        const usedTickets = [];
        const unusedTickets = [];
        for (const ticket of apiTickets) {
          if (ticket.status === 'Utilizado') {
            usedTickets.push(ticket);
          } else {
            unusedTickets.push(ticket);
          }
        }
        setUserUsedTickets(usedTickets);
        setUserTickets(unusedTickets);
        // setUserTickets(apiTickets);
        database.saveTickets(apiTickets); // Salva os ingressos mais recentes no cache local
      }
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      try {
        const localTickets = await database.getLocalTickets();
        if (localTickets.length > 0) {
          setUserTickets(localTickets);
          Alert.alert('Erro de Conexão', 'Não foi possível atualizar. Exibindo ingressos salvos.');
        }
      } catch (dbError) {
        console.error('Erro ao buscar ingressos do DB local:', dbError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewQRCode = (ticket: LocalTicket) => {
    setSelectedTicket(ticket);
    setQrCodeModalVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets(isOffline);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <CustomHeader />
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Você está offline</Text>
        </View>
      )}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 20 }}>Ingressos Disponíveis</Text>
        <View>
          {loading ? (
            <ActivityIndicator size='large' color='#667eea' style={{ marginTop: 50 }} />
          ) : userTickets.length > 0 ? (
            userTickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                ticketStatus={'Não utilizado'}
                handleViewQRCode={() => handleViewQRCode(ticket)} // Passa a função para o cartão
              />
            ))
          ) : (
            <Text style={styles.noTicketsText}>
              {user ? 'Nenhum ingresso disponível.' : 'Faça login para ver seus ingressos.'}
            </Text>
          )}
        </View>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 20 }}>
            Ingressos Já Utilizados
          </Text>
          {loading ? (
            <ActivityIndicator size='large' color='#667eea' style={{ marginTop: 50 }} />
          ) : userUsedTickets.length > 0 ? (
            userUsedTickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                ticketStatus={'Utilizado'}
                handleViewQRCode={() => handleViewQRCode(ticket)} // Passa a função para o cartão
              />
            ))
          ) : (
            <Text style={styles.noTicketsText}>
              {user
                ? 'Você ainda não utilizou nenhum ingresso'
                : 'Faça login para ver seus ingressos.'}
            </Text>
          )}
        </View>
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
    textAlign: 'center',
    paddingBottom: 20,
  },
});
