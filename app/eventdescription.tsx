import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api'; // Importe sua instância do Axios
import CustomHeader from '../components/CustomHeader';

// Definição de tipos para os dados do evento e tickets
interface EventDetails {
  id: string;
  image: string; // URL da imagem
  title: string;
  date: string;
  location: string;
  description: string;
  fullDate: string;
  adminDetails: {
    ticketsAvailable: number;
    ticketsSold: number;
    attendees: number;
    ticketPrice: number;
    revenue: number;
  };
  ticketTypes: {
    [key: string]: { // Ex: 'vip', 'normal', 'meia'
      count: number; // estoque disponível
      price: number;
    };
  };
}

// Tipo para o estado de tickets selecionados para compra
interface SelectedTickets {
  vip: { count: number; price: number };
  normal: { count: number; price: number };
  meia: { count: number; price: number };
}

export default function EventDescriptionScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTickets>({
    vip: { count: 0, price: 0 },
    normal: { count: 0, price: 0 },
    meia: { count: 0, price: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError('ID do evento não fornecido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Faz a requisição para buscar os detalhes do evento pelo ID
        const response = await api.get(`/events/${eventId}`);
        const data: EventDetails = response.data;

        // Atualiza os detalhes do evento
        setEventDetails(data);

        // Inicializa os tickets selecionados com os preços do backend, mas count em 0
        const initialSelectedTickets: SelectedTickets = {
            vip: { count: 0, price: data.ticketTypes?.vip?.price || 0 },
            normal: { count: 0, price: data.ticketTypes?.normal?.price || 0 },
            meia: { count: 0, price: data.ticketTypes?.meia?.price || 0 }
        };
        setSelectedTickets(initialSelectedTickets);

      } catch (err: any) {
        console.error('Erro ao buscar detalhes do evento:', err);
        setError(err.response?.data?.message || 'Falha ao carregar detalhes do evento.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAcquireTicket = () => {
    setShowTicketModal(true);
  };

  const toggleAdminDetails = () => {
    setShowAdminDetails(!showAdminDetails);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const updateTicketCount = (type: 'vip' | 'normal' | 'meia', operation: 'increase' | 'decrease') => {
    setSelectedTickets(prev => {
      const currentStock = eventDetails?.ticketTypes[type]?.count || 0; // Estoque disponível no backend
      const newCount = operation === 'increase'
        ? Math.min(currentStock, prev[type].count + 1) // Não pode exceder o estoque
        : Math.max(0, prev[type].count - 1);

      return {
        ...prev,
        [type]: {
          ...prev[type],
          count: newCount
        }
      };
    });
  };

  const calculateTotal = () => {
    return (selectedTickets.vip.count * selectedTickets.vip.price) +
           (selectedTickets.normal.count * selectedTickets.normal.price) +
           (selectedTickets.meia.count * selectedTickets.meia.price);
  };

  const handlePurchase = async () => {
    if (calculateTotal() === 0) {
      Alert.alert('Compra', 'Por favor, selecione pelo menos um ingresso.');
      return;
    }

    setLoading(true); // Inicia loading para a compra
    try {
      const ticketsToPurchase = {
        vip: selectedTickets.vip.count,
        normal: selectedTickets.normal.count,
        meia: selectedTickets.meia.count,
      };

      const response = await api.post(`/events/${eventId}/purchase`, { tickets: ticketsToPurchase });

      if (response.status === 201) {
        Alert.alert('Sucesso!', 'Compra de ingressos realizada com sucesso!');
        setShowTicketModal(false);
        // Opcional: recarregar detalhes do evento para atualizar estoque
        // Ou simplesmente resetar os contadores e forçar um re-fetch
        setEventDetails(null); // Força o re-fetch no próximo render do useEffect
        setSelectedTickets({
          vip: { count: 0, price: eventDetails?.ticketTypes?.vip?.price || 0 },
          normal: { count: 0, price: eventDetails?.ticketTypes?.normal?.price || 0 },
          meia: { count: 0, price: eventDetails?.ticketTypes?.meia?.price || 0 }
        });
      }
    } catch (err: any) {
      console.error('Erro ao comprar ingressos:', err);
      Alert.alert('Erro na compra', err.response?.data?.message || 'Não foi possível completar a compra.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText>Carregando detalhes do evento...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
        <TouchableOpacity style={styles.actionButton} onPress={handleGoBack}>
            <ThemedText style={styles.buttonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!eventDetails) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Evento não encontrado.</ThemedText>
        <TouchableOpacity style={styles.actionButton} onPress={handleGoBack}>
            <ThemedText style={styles.buttonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomHeader />
          <View style={styles.eventContentWrapper}>
            {/* O Image source deve ser uma URI se vier do backend */}
            <Image source={{ uri: eventDetails.image }} style={styles.eventImage} />
            <ThemedText style={styles.eventTitle}>{eventDetails.title}</ThemedText>
            <ThemedText style={styles.eventDateLocation}>{eventDetails.fullDate}</ThemedText>
            <ThemedText style={styles.eventDateLocation}>{eventDetails.location}</ThemedText>

            <View style={styles.divider} />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleAcquireTicket}
              >
                <ThemedText style={styles.buttonText}>Adquirir Ingresso</ThemedText>
              </TouchableOpacity>
              {/* Botão de detalhes administrativos visível apenas para usuários com permissão */}
              {/* Você precisaria de um estado ou contexto de usuário para controlar isso */}
              {/* Por enquanto, vou manter o toggle */}
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={toggleAdminDetails}
              >
                <ThemedText style={styles.buttonText}>
                  {showAdminDetails ? 'Ver Descrição' : 'Ver Detalhes Admin'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {showAdminDetails ? (
              <>
                <View style={styles.adminCardsContainer}>
                  <View style={styles.adminCard}>
                    <MaterialIcons name="confirmation-number" size={28} color="#007AFF" />
                    <ThemedText style={styles.adminCardTitle}>Disponíveis</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {eventDetails.adminDetails.ticketsAvailable}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Ingressos</ThemedText>
                  </View>

                  <View style={styles.adminCard}>
                    <Ionicons name="cart" size={28} color="#34C759" />
                    <ThemedText style={styles.adminCardTitle}>Vendidos</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {eventDetails.adminDetails.ticketsSold}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Ingressos</ThemedText>
                  </View>

                  <View style={styles.adminCard}>
                    <Ionicons name="people" size={28} color="#5856D6" />
                    <ThemedText style={styles.adminCardTitle}>Presentes</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {eventDetails.adminDetails.attendees}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Pessoas</ThemedText>
                  </View>

                  <View style={styles.adminCard}>
                    <MaterialIcons name="attach-money" size={28} color="#FF9500" />
                    <ThemedText style={styles.adminCardTitle}>Preço Unitário</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {formatCurrency(eventDetails.adminDetails.ticketPrice)}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Por ingresso</ThemedText>
                  </View>
                </View>

                <View style={styles.revenueCard}>
                  <View style={styles.revenueHeader}>
                    <Ionicons name="cash" size={32} color="#4CD964" />
                    <ThemedText style={styles.revenueTitle}>Arrecadação Total</ThemedText>
                  </View>
                  <ThemedText style={styles.revenueValue}>
                    {formatCurrency(eventDetails.adminDetails.revenue)}
                  </ThemedText>
                  <ThemedText style={styles.revenueSubtitle}>
                    {eventDetails.adminDetails.ticketsSold} ingressos vendidos
                  </ThemedText>
                </View>
              </>
            ) : (
              <>
                <ThemedText style={styles.sectionTitle}>Sobre o Evento</ThemedText>
                <ThemedText style={styles.eventDescription}>{eventDetails.description}</ThemedText>
              </>
            )}
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={false}
          visible={showTicketModal}
          onRequestClose={() => setShowTicketModal(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <SafeAreaView style={styles.safeArea}>
              <LinearGradient
                colors={['#005452', '#48a3a7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <TouchableOpacity onPress={() => setShowTicketModal(false)} style={styles.closeModalButton}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView contentContainerStyle={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Ingressos disponíveis para:</ThemedText>
                <ThemedText style={styles.eventModalTitle}>{eventDetails.title}</ThemedText>

                {/* Renderizar dinamicamente os tipos de ingresso */}
                {Object.entries(eventDetails.ticketTypes).map(([type, { price, count: stock }]) => (
                    <ThemedView key={type} style={styles.ticketCard}>
                        <ThemedView style={styles.ticketInfo}>
                            <ThemedText style={styles.ticketType}>Ingresso {type.charAt(0).toUpperCase() + type.slice(1)}</ThemedText>
                            <ThemedText style={styles.ticketDescription}>
                                {type === 'vip' && 'Acesso premium + área exclusiva'}
                                {type === 'normal' && 'Acesso geral ao evento'}
                                {type === 'meia' && 'Estudantes, idosos e pessoas com deficiência'}
                                {/* Adicione mais descrições conforme seus tipos de ingresso */}
                            </ThemedText>
                            <ThemedText style={styles.ticketPrice}>{formatCurrency(price)}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.counterContainer}>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => updateTicketCount(type as 'vip' | 'normal' | 'meia', 'decrease')}
                                disabled={selectedTickets[type as 'vip' | 'normal' | 'meia'].count === 0}
                            >
                                <Ionicons name="remove" size={20} color={selectedTickets[type as 'vip' | 'normal' | 'meia'].count === 0 ? '#CCC' : '#FF3B30'} />
                            </TouchableOpacity>
                            <ThemedText style={styles.counterValue}>
                                {selectedTickets[type as 'vip' | 'normal' | 'meia'].count}
                            </ThemedText>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => updateTicketCount(type as 'vip' | 'normal' | 'meia', 'increase')}
                                disabled={selectedTickets[type as 'vip' | 'normal' | 'meia'].count >= stock} // Desabilita se atingir o estoque
                            >
                                <Ionicons name="add" size={20} color={selectedTickets[type as 'vip' | 'normal' | 'meia'].count >= stock ? '#CCC' : '#34C759'} />
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>
                ))}

                <ThemedView style={styles.summaryCard}>
                  <ThemedText style={styles.summaryTitle}>Resumo da Compra</ThemedText>

                  {Object.entries(selectedTickets).map(([type, { count, price }]) => (
                    count > 0 && (
                      <ThemedView key={type} style={styles.summaryItem}>
                        <ThemedText style={styles.summaryText}>{count}x Ingresso {type.charAt(0).toUpperCase() + type.slice(1)}</ThemedText>
                        <ThemedText style={styles.summaryText}>
                          {formatCurrency(count * price)}
                        </ThemedText>
                      </ThemedView>
                    )
                  ))}

                  <ThemedView style={styles.totalContainer}>
                    <ThemedText style={styles.totalText}>Total:</ThemedText>
                    <ThemedText style={styles.totalValue}>{formatCurrency(calculateTotal())}</ThemedText>
                  </ThemedView>
                </ThemedView>

                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    calculateTotal() === 0 && styles.disabledButton
                  ]}
                  onPress={handlePurchase}
                  disabled={calculateTotal() === 0 || loading} // Desabilita durante o carregamento
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.purchaseButtonText}>
                      Finalizar Compra
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </ThemedView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // ... (seus estilos existentes, com algumas pequenas adições)

  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Ajuste para o padding do conteúdo principal após o cabeçalho
  scrollContent: {
    paddingBottom: 40,
  },
  // Novo estilo para o wrapper do conteúdo do evento
  eventContentWrapper: {
    paddingHorizontal: 20, // Adicione padding horizontal para o conteúdo
    paddingTop: 45, // Empurra o conteúdo para baixo do cabeçalho
  },
  eventImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  eventDateLocation: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 20,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#48484A',
    textAlign: 'justify',
  },

  // Estilos para a seção administrativa
  adminCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  adminCard: {
    width: '48%', // Dois cards por linha
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  adminCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636366',
    marginTop: 8,
    textAlign: 'center',
  },
  adminCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginVertical: 4,
  },
  adminCardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Card de arrecadação
  revenueCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderLeftWidth: 6,
    borderLeftColor: '#4CD964',
    marginTop: 8,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 10,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CD964',
    marginBottom: 4,
  },
  revenueSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },

  // Estilos do Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row', // Para posicionar o botão de fechar
    alignItems: 'center',
  },
  closeModalButton: {
    position: 'absolute', // Permite posicionar o botão de fechar
    top: 30, // Ajuste a posição conforme necessário
    right: 20,
    padding: 5,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 5,
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1C1C1E',
  },

  // Estilos dos Cards de Ingresso
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  ticketInfo: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  ticketType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 8,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  counterButton: {
    padding: 8,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },

  // Estilos do Resumo
  summaryCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent'

  },
  summaryText: {
    fontSize: 16,
    color: '#48484A',

  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: 'transparent'
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },

  // Botão de Compra
  purchaseButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#AEAEB2',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});