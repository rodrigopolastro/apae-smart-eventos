import TicketCard from '@/components/TicketCard';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import QRCodeModal from '@/components/QRCodeModal';
import { ThemedText } from '@/components/ThemedText';
import { useAuthStore } from '@/hooks/useAuthStore';
import api from '../../api';
import CustomHeader from '../../components/CustomHeader';
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
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchTickets(isOffline);
  }, [user, isOffline]);

  const fetchTickets = async (offline: boolean) => {
    setLoading(true);

    if (!user) {
      setUserTickets([]);
      setUserUsedTickets([]); // Limpa também os ingressos utilizados se não houver usuário
      setLoading(false);
      return;
    }

    try {
      if (offline) {
        const localTickets = await database.getLocalTickets();
        const usedTickets = [];
        const unusedTickets = [];
        for (const ticket of localTickets) {
          if (ticket.status === 'Utilizado') {
            usedTickets.push(ticket);
          } else {
            unusedTickets.push(ticket);
          }
        }
        setUserUsedTickets(usedTickets);
        setUserTickets(unusedTickets);
      } else {
        const loggedUserId = user.id;
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
        database.saveTickets(apiTickets);
      }
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível atualizar. Exibindo ingressos salvos (se houver).'
      );
      try {
        const localTickets = await database.getLocalTickets();
        if (localTickets.length > 0) {
          const usedTickets = [];
          const unusedTickets = [];
          for (const ticket of localTickets) {
            if (ticket.status === 'Utilizado') {
              usedTickets.push(ticket);
            } else {
              unusedTickets.push(ticket);
            }
          }
          setUserUsedTickets(usedTickets);
          setUserTickets(unusedTickets);
        } else {
          setUserTickets([]);
          setUserUsedTickets([]);
        }
      } catch (dbError) {
        console.error('Erro ao buscar ingressos do DB local:', dbError);
        setUserTickets([]); // Garante que as listas estejam vazias em caso de erro no DB local
        setUserUsedTickets([]);
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
    // O View principal pode ser substituído por SafeAreaView se preferir que o conteúdo
    // comece abaixo da barra de status, mas role.
    <View style={styles.container}>
      {/* O CustomHeader foi movido para DENTRO do ScrollView */}
      <ScrollView
        style={styles.scrollViewContent} // Adicionado um estilo para o ScrollView
        contentContainerStyle={styles.scrollContentContainer} // Para o conteúdo interno do ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Adiciona SafeAreaView aqui se quiser o padding seguro para o header rolável */}
        <SafeAreaView style={styles.safeAreaContent}>
          <CustomHeader />
        </SafeAreaView>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <ThemedText style={styles.offlineBannerText}>Você está offline</ThemedText>
          </View>
        )}

        {/* Conteúdo dos Ingressos Disponíveis */}
        <ThemedText style={styles.sectionTitle}>Ingressos Disponíveis</ThemedText>
        <View style={styles.ticketSection}>
          {loading ? (
            <ActivityIndicator size='large' color='#667eea' style={styles.activityIndicator} />
          ) : userTickets.length > 0 ? (
            userTickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                ticketStatus={'Não utilizado'}
                handleViewQRCode={() => handleViewQRCode(ticket)}
              />
            ))
          ) : (
            <ThemedText style={styles.noTicketsText}>
              {user ? 'Nenhum ingresso disponível.' : 'Faça login para ver seus ingressos.'}
            </ThemedText>
          )}
        </View>

        {/* Conteúdo dos Ingressos Já Utilizados */}
        <ThemedText style={styles.sectionTitle}>Ingressos Já Utilizados</ThemedText>
        <View style={styles.ticketSection}>
          {loading ? (
            <ActivityIndicator size='large' color='#667eea' style={styles.activityIndicator} />
          ) : userUsedTickets.length > 0 ? (
            userUsedTickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                ticketStatus={'Utilizado'}
                handleViewQRCode={() => handleViewQRCode(ticket)}
              />
            ))
          ) : (
            <ThemedText style={styles.noTicketsText}>
              {user
                ? 'Você ainda não utilizou nenhum ingresso'
                : 'Faça login para ver seus ingressos.'}
            </ThemedText>
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
  scrollViewContent: {
    flex: 1, // O ScrollView deve ocupar o espaço total
  },
  scrollContentContainer: {
    paddingBottom: 20, // Padding no final do conteúdo rolável
    paddingTop: 30,
  },
  safeAreaContent: {
    // Estilos para a SafeAreaView DENTRO do ScrollView,
    // para garantir que o header comece no lugar certo
    backgroundColor: 'transparent',
  },
  offlineBanner: {
    backgroundColor: '#ffc107',
    padding: 8,
    alignItems: 'center',
    marginBottom: 10, // Adiciona um pequeno espaçamento abaixo do banner
  },
  offlineBannerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20, // Mantido o margin para o título
    marginTop: 20, // Adicionado marginTop para espaçar do item anterior (banner ou header)
    marginBottom: 10, // Espaçamento entre o título e a lista de cards
    color: '#333', // Cor do texto para ser mais legível
  },
  ticketSection: {
    paddingHorizontal: 10, // Padding para os cards de ticket
  },
  activityIndicator: {
    marginTop: 50,
  },
  noTicketsText: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 20, // Adicionado para espaçar se não houver tickets
  },
});
