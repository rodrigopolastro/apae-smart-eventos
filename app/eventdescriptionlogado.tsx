import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importe o CustomHeader
import CustomHeader from '../components/CustomHeaderIn'; // Ajuste este caminho conforme sua estrutura de pastas

export default function EventDescriptionScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState({
    vip: { count: 0, price: 250.00 },
    normal: { count: 0, price: 120.00 },
    meia: { count: 0, price: 60.00 }
  });

  // Dados mockados
  const mockEventsData = {
    '1': {
      id: '1',
      image: require('../assets/images/festajunina.jpg'),
      title: 'Expo Ecomm Circuito 2025',
      date: '25/05/2025',
      location: 'Goiânia - GO',
      description: 'A Expo Ecomm Circuito 2025 é o maior evento de e-commerce e marketing digital do Centro-Oeste. Prepare-se para dois dias de imersão em tendências, estratégias e inovações que estão moldando o futuro do comércio eletrônico.',
      fullDate: 'Terça-feira, 14 de Outubro de 2025 • 13h00',
      adminDetails: {
        ticketsAvailable: 500,
        ticketsSold: 320,
        attendees: 280,
        ticketPrice: 120.00,
        revenue: 38400.00
      }
    },
    // ... outros eventos com mesma estrutura
  };

  useEffect(() => {
    if (eventId) {
      setEventDetails(mockEventsData[eventId as keyof typeof mockEventsData]);
    }
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
    setTickets(prev => {
      const newCount = operation === 'increase' 
        ? prev[type].count + 1 
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
    return (tickets.vip.count * tickets.vip.price) +
           (tickets.normal.count * tickets.normal.price) +
           (tickets.meia.count * tickets.meia.price);
  };

  const handlePurchase = () => {
    alert(`Compra realizada! Total: ${formatCurrency(calculateTotal())}`);
    setShowTicketModal(false);
    setTickets({
      vip: { count: 0, price: 250.00 },
      normal: { count: 0, price: 120.00 },
      meia: { count: 0, price: 60.00 }
    });
  };

  if (!eventDetails) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando detalhes do evento...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Conteúdo Principal */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Adicione o CustomHeader aqui */}
          <CustomHeader /> 

          {/* Wrapper para o restante do conteúdo com paddingTop */}
          <View style={styles.eventContentWrapper}>
            {/* Imagem e informações básicas */}
            <Image source={eventDetails.image} style={styles.eventImage} />
            <ThemedText style={styles.eventTitle}>{eventDetails.title}</ThemedText>
            <ThemedText style={styles.eventDateLocation}>{eventDetails.fullDate}</ThemedText>
            <ThemedText style={styles.eventDateLocation}>{eventDetails.location}</ThemedText>

            <View style={styles.divider} />

            {/* Botões de Ação */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleAcquireTicket}
              >
                <ThemedText style={styles.buttonText}>Adquirir Ingresso</ThemedText>
              </TouchableOpacity>
              
      
            </View>

            {/* Conteúdo Dinâmico */}
            {showAdminDetails ? (
              <>
                {/* Cards Administrativos */}
                <View style={styles.adminCardsContainer}>
                  {/* Card Ingressos Disponíveis */}
                  <View style={styles.adminCard}>
                    <MaterialIcons name="confirmation-number" size={28} color="#007AFF" />
                    <ThemedText style={styles.adminCardTitle}>Disponíveis</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {eventDetails.adminDetails.ticketsAvailable}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Ingressos</ThemedText>
                  </View>

                  {/* Card Ingressos Vendidos */}
                  <View style={styles.adminCard}>
                    <Ionicons name="cart" size={28} color="#34C759" />
                    <ThemedText style={styles.adminCardTitle}>Vendidos</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {eventDetails.adminDetails.ticketsSold}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Ingressos</ThemedText>
                  </View>

                  {/* Card Presenças Confirmadas */}
                  <View style={styles.adminCard}>
                    <Ionicons name="people" size={28} color="#5856D6" />
                    <ThemedText style={styles.adminCardTitle}>Presentes</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {eventDetails.adminDetails.attendees}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Pessoas</ThemedText>
                  </View>

                  {/* Card Preço do Ingresso */}
                  <View style={styles.adminCard}>
                    <MaterialIcons name="attach-money" size={28} color="#FF9500" />
                    <ThemedText style={styles.adminCardTitle}>Preço Unitário</ThemedText>
                    <ThemedText style={styles.adminCardValue}>
                      {formatCurrency(eventDetails.adminDetails.ticketPrice)}
                    </ThemedText>
                    <ThemedText style={styles.adminCardSubtitle}>Por ingresso</ThemedText>
                  </View>
                </View>

                {/* Card de Arrecadação Total */}
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

        {/* Modal de Compra de Ingressos */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showTicketModal}
          onRequestClose={() => setShowTicketModal(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <SafeAreaView style={styles.safeArea}>
              {/* O header do modal pode permanecer fixo se desejar */}
              <LinearGradient
                colors={['#005452', '#48a3a7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                {/* Aqui você pode adicionar um botão de fechar ou título específico para o modal */}
              </LinearGradient>

              <ScrollView contentContainerStyle={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Ingressos disponíveis para:</ThemedText>
                <ThemedText style={styles.eventModalTitle}>{eventDetails.title}</ThemedText>
                
                {/* Card Ingresso VIP */}
                <ThemedView style={styles.ticketCard}>
                  <ThemedView style={styles.ticketInfo}>
                    <ThemedText style={styles.ticketType}>Ingresso VIP</ThemedText>
                    <ThemedText style={styles.ticketDescription}>Acesso premium + área exclusiva</ThemedText>
                    <ThemedText style={styles.ticketPrice}>{formatCurrency(tickets.vip.price)}</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.counterContainer}>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => updateTicketCount('vip', 'decrease')}
                    >
                      <Ionicons name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    <ThemedText style={styles.counterValue}>{tickets.vip.count}</ThemedText>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => updateTicketCount('vip', 'increase')}
                    >
                      <Ionicons name="add" size={20} color="#34C759" />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>

                {/* Card Ingresso Normal */}
                <ThemedView style={styles.ticketCard}>
                  <ThemedView style={styles.ticketInfo}>
                    <ThemedText style={styles.ticketType}>Ingresso Normal</ThemedText>
                    <ThemedText style={styles.ticketDescription}>Acesso geral ao evento</ThemedText>
                    <ThemedText style={styles.ticketPrice}>{formatCurrency(tickets.normal.price)}</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.counterContainer}>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => updateTicketCount('normal', 'decrease')}
                    >
                      <Ionicons name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    <ThemedText style={styles.counterValue}>{tickets.normal.count}</ThemedText>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => updateTicketCount('normal', 'increase')}
                    >
                      <Ionicons name="add" size={20} color="#34C759" />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>

                {/* Card Ingresso Meia */}
                <ThemedView style={styles.ticketCard}>
                  <ThemedView style={styles.ticketInfo}>
                    <ThemedText style={styles.ticketType}>Ingresso Meia</ThemedText>
                    <ThemedText style={styles.ticketDescription}>Estudantes, idosos e pessoas com deficiência</ThemedText>
                    <ThemedText style={styles.ticketPrice}>{formatCurrency(tickets.meia.price)}</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.counterContainer}>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => updateTicketCount('meia', 'decrease')}
                    >
                      <Ionicons name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    <ThemedText style={styles.counterValue}>{tickets.meia.count}</ThemedText>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => updateTicketCount('meia', 'increase')}
                    >
                      <Ionicons name="add" size={20} color="#34C759" />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>

                {/* Resumo da Compra */}
                <ThemedView style={styles.summaryCard}>
                  <ThemedText style={styles.summaryTitle}>Resumo da Compra</ThemedText>
                  
                  {tickets.vip.count > 0 && (
                    <ThemedView style={styles.summaryItem}>
                      <ThemedText style={styles.summaryText}>{tickets.vip.count}x Ingresso VIP</ThemedText>
                      <ThemedText style={styles.summaryText}>
                        {formatCurrency(tickets.vip.count * tickets.vip.price)}
                      </ThemedText>
                    </ThemedView>
                  )}
                  
                  {tickets.normal.count > 0 && (
                    <ThemedView style={styles.summaryItem}>
                      <ThemedText style={styles.summaryText}>{tickets.normal.count}x Ingresso Normal</ThemedText>
                      <ThemedText style={styles.summaryText}>
                        {formatCurrency(tickets.normal.count * tickets.normal.price)}
                      </ThemedText>
                    </ThemedView>
                  )}
                  
                  {tickets.meia.count > 0 && (
                    <ThemedView style={styles.summaryItem}>
                      <ThemedText style={styles.summaryText}>{tickets.meia.count}x Ingresso Meia</ThemedText>
                      <ThemedText style={styles.summaryText}>
                        {formatCurrency(tickets.meia.count * tickets.meia.price)}
                      </ThemedText>
                    </ThemedView>
                  )}
                  
                  <ThemedView style={styles.totalContainer}>
                    <ThemedText style={styles.totalText}>Total:</ThemedText>
                    <ThemedText style={styles.totalValue}>{formatCurrency(calculateTotal())}</ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* Botão de Finalizar Compra */}
                <TouchableOpacity 
                  style={[
                    styles.purchaseButton,
                    calculateTotal() === 0 && styles.disabledButton
                  ]}
                  onPress={handlePurchase}
                  disabled={calculateTotal() === 0}
                >
                  <ThemedText style={styles.purchaseButtonText}>
                    Finalizar Compra
                  </ThemedText>
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
  // Estilos base
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
    // Remova o padding geral aqui, pois o padding será aplicado no eventContentWrapper
    // paddingTop: 20, // Removido
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
    borderRadius:12,
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
    borderRadius:12,
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
    borderRadius:12,
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