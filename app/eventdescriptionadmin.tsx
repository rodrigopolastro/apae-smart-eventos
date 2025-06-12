import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api'; // Sua instância do Axios
import CustomHeader from '../components/CustomHeaderLogin';

// --- Interfaces para os dados da API e dados processados ---

interface EventDetails {
  id: string;
  name: string;
  description: string;
  date_time: string;
  location: string;
  image_url?: string;
}

// Representa um tipo de ingresso vindo da rota /:id/ticketTypes
interface ApiTicketType {
  id: number;
  name: string;
  price: number;
  total_quantity: number; // Assumindo que esta coluna exista na sua tabela event_ticket_types
}

// Representa um ingresso individual vendido da rota /:id/tickets
interface ApiSoldTicket {
  id: number;
  ticket_type_id: number;
  // ...outros campos do ingresso individual
}

// Estrutura para armazenar os detalhes calculados por tipo de ingresso
interface ProcessedTicketDetails extends ApiTicketType {
  sold_quantity: number;
  available_quantity: number;
  revenue: number;
}

// Estrutura para armazenar os totais calculados
interface CalculatedTotals {
  totalSold: number;
  totalAvailable: number;
  totalRevenue: number;
  attendees: number;
}


export default function EventDescriptionAdminScreen() {
  const { eventId } = useLocalSearchParams();

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [processedTickets, setProcessedTickets] = useState<ProcessedTicketDetails[]>([]);
  const [totals, setTotals] = useState<CalculatedTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminDetails, setShowAdminDetails] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchAllDataAndProcess();
    }
  }, [eventId]);

  const fetchAllDataAndProcess = async () => {
    if (!eventId || typeof eventId !== 'string') return;
    setLoading(true);
    try {
      // 1. Busca todos os dados necessários do backend em paralelo
      const [
        detailsRes,
        imageUrlRes,
        ticketTypesRes, // Tipos de ingresso (preço, quantidade total)
        soldTicketsRes, // Todos os ingressos vendidos individualmente
      ] = await Promise.all([
        api.get<EventDetails>(`/events/${eventId}`),
        api.get<{ imageUrl: string }>(`/events/${eventId}/imageUrl`),
        api.get<ApiTicketType[]>(`/events/${eventId}/ticketTypes`),
        api.get<ApiSoldTicket[]>(`/events/${eventId}/tickets`),
      ]);

      // Combina os detalhes do evento com a imagem
      setEventDetails({ ...detailsRes.data, image_url: imageUrlRes.data.imageUrl });

      // 2. Processa os dados no frontend para fazer os cálculos
      processAndCalculateStats(ticketTypesRes.data, soldTicketsRes.data);

    } catch (error) {
      console.error('Erro ao buscar ou processar dados do evento:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes administrativos.');
    } finally {
      setLoading(false);
    }
  };

  const processAndCalculateStats = (ticketTypes: ApiTicketType[], soldTickets: ApiSoldTicket[]) => {
    // Conta quantos ingressos de cada tipo foram vendidos
    const soldCountMap = new Map<number, number>();
    for (const ticket of soldTickets) {
      soldCountMap.set(ticket.ticket_type_id, (soldCountMap.get(ticket.ticket_type_id) || 0) + 1);
    }

    // Calcula os detalhes para cada tipo de ingresso
    const processedDetails: ProcessedTicketDetails[] = ticketTypes.map(type => {
      const sold_quantity = soldCountMap.get(type.id) || 0;
      return {
        ...type,
        sold_quantity: sold_quantity,
        available_quantity: (type.total_quantity || 0) - sold_quantity,
        revenue: sold_quantity * type.price,
      };
    });
    setProcessedTickets(processedDetails);

    // Calcula os totais gerais
    const grandTotals = processedDetails.reduce((acc, ticket) => {
        acc.totalSold += ticket.sold_quantity;
        acc.totalAvailable += ticket.available_quantity;
        acc.totalRevenue += ticket.revenue;
        return acc;
    }, { totalSold: 0, totalAvailable: 0, totalRevenue: 0 });

    setTotals({
        ...grandTotals,
        attendees: Math.floor(grandTotals.totalSold * 0.95) // Simulação de presentes
    });
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (!eventDetails || !totals) {
    return (
        <ThemedView style={styles.loadingContainer}>
            <CustomHeader />
            <ThemedText>Não foi possível carregar os dados do evento.</ThemedText>
        </ThemedView>
    );
  }

  const toggleAdminDetails = () => setShowAdminDetails(!showAdminDetails);
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <CustomHeader />
            <View style={styles.eventContentWrapper}>
                <Image source={{ uri: eventDetails.image_url }} style={styles.eventImage} />
                <ThemedText style={styles.eventTitle}>{eventDetails.name}</ThemedText>
                <ThemedText style={styles.eventDateLocation}>{formatDate(eventDetails.date_time)}</ThemedText>
                <ThemedText style={styles.eventDateLocation}>{eventDetails.location}</ThemedText>
                <View style={styles.divider} />
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={toggleAdminDetails}>
                        <ThemedText style={styles.buttonText}>{showAdminDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Admin'}</ThemedText>
                    </TouchableOpacity>
                </View>

                {showAdminDetails ? (
                    <>
                        <ThemedText style={styles.sectionTitle}>Resumo Geral</ThemedText>
                        <View style={styles.adminCardsContainer}>
                            <View style={styles.adminCard}><ThemedText style={styles.adminCardTitle}>Disponíveis</ThemedText><ThemedText style={styles.adminCardValue}>{totals.totalAvailable}</ThemedText></View>
                            <View style={styles.adminCard}><ThemedText style={styles.adminCardTitle}>Vendidos</ThemedText><ThemedText style={styles.adminCardValue}>{totals.totalSold}</ThemedText></View>
                            <View style={styles.adminCard}><ThemedText style={styles.adminCardTitle}>Presentes</ThemedText><ThemedText style={styles.adminCardValue}>{totals.attendees}</ThemedText></View>
                        </View>

                        <ThemedText style={styles.sectionTitle}>Análise por Ingresso</ThemedText>
                        {processedTickets.map(ticket => (
                            <View key={ticket.id} style={styles.ticketDetailCard}>
                                <ThemedText style={styles.ticketDetailTitle}>{ticket.name}</ThemedText>
                                <ThemedText style={styles.ticketDetailInfo}>{ticket.sold_quantity} / {ticket.total_quantity || 'N/A'} vendidos ({formatCurrency(ticket.price)})</ThemedText>
                                <ThemedText style={styles.ticketDetailRevenue}>Receita: {formatCurrency(ticket.revenue)}</ThemedText>
                            </View>
                        ))}

                        <View style={styles.revenueCard}>
                            <ThemedText style={styles.revenueTitle}>Arrecadação Total</ThemedText>
                            <ThemedText style={styles.revenueValue}>{formatCurrency(totals.totalRevenue)}</ThemedText>
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
      </SafeAreaView>
    </ThemedView>
  );
}

// Estilos (o mesmo da resposta anterior, sem alterações)
const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#fff' },
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    scrollContent: { paddingBottom: 40 },
    eventContentWrapper: { paddingHorizontal: 20, paddingTop: 20 },
    eventImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
    eventTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1C1C1E', marginBottom: 8 },
    eventDateLocation: { fontSize: 16, color: '#636366', textAlign: 'center', marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 20 },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
    actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    secondaryButton: { backgroundColor: '#34C759' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16, marginTop: 10 },
    eventDescription: { fontSize: 16, lineHeight: 24, color: '#48484A', textAlign: 'justify' },
    adminCardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: 10 },
    adminCard: { width: '48%', backgroundColor: '#F7F7F7', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E5E5EA' },
    adminCardTitle: { fontSize: 14, color: '#636366', textAlign: 'center', marginBottom: 5 },
    adminCardValue: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
    ticketDetailCard: { backgroundColor: '#F7F7F7', borderRadius: 8, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#E5E5EA' },
    ticketDetailTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    ticketDetailInfo: { fontSize: 14, color: '#636366', marginVertical: 4 },
    ticketDetailRevenue: { fontSize: 14, color: '#34C759', fontWeight: '500' },
    revenueCard: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 20, borderLeftWidth: 6, borderLeftColor: '#4CAF50', marginTop: 20, alignItems: 'center' },
    revenueTitle: { fontSize: 18, fontWeight: '600', color: '#1B5E20' },
    revenueValue: { fontSize: 32, fontWeight: 'bold', color: '#1B5E20', marginVertical: 8 },
});