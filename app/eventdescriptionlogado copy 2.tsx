import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView, // Importado para usar com o CustomHeaderIn
} from 'react-native';

import api from '../api';
import CustomHeaderIn from '../components/CustomHeaderIn'; // Header para usuário logado
import formatDate from '../helpers/formatDate';
import { useAuthStore } from '../hooks/useAuthStore';
import { ThemedText } from '@/components/ThemedText';

interface EventType {
  id: number;
  name: string;
  description: string;
  date_time: string;
  location: string;
  image_url?: string;
}

interface TicketType {
  id: number;
  name: string;
  price: number;
}

export default function EventDescriptionLogado() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  // Remova qualquer useEffect com router.setOptions daqui.
  // A configuração headerShown: false deve ser feita no _layout.tsx
  // que gerencia esta rota. Ex: (associado)/_layout.tsx ou app/_layout.tsx

  useEffect(() => {
    if (eventId && typeof eventId === 'string') {
      const fetchAllData = async () => {
        setLoadingEvent(true);
        try {
          const [detailsResponse, imageUrlResponse, ticketTypesResponse] = await Promise.all([
            api.get(`/events/${eventId}`),
            api.get(`/events/${eventId}/imageUrl`),
            api.get(`/events/${eventId}/ticketTypes`),
          ]);
          const combinedEventData: EventType = { ...detailsResponse.data, image_url: imageUrlResponse.data.imageUrl };
          setEvent(combinedEventData);
          const fetchedTicketTypes = ticketTypesResponse.data;
          setTicketTypes(fetchedTicketTypes);
          const initialQuantities = fetchedTicketTypes.reduce((acc: any, type: TicketType) => {
            acc[type.id] = 0;
            return acc;
          }, {});
          setQuantities(initialQuantities);
        } catch (error) {
          console.error('Erro ao buscar dados do evento:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
        } finally {
          setLoadingEvent(false);
        }
      };
      fetchAllData();
    } else {
      setLoadingEvent(false);
    }
  }, [eventId]);

  const handleQuantityChange = (ticketTypeId: number, change: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[ticketTypeId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [ticketTypeId]: newQuantity };
    });
  };

  const handlePurchaseTicket = async () => {
    if (!user || !user.id) {
      Alert.alert('Erro de Autenticação', 'Você precisa estar logado para adquirir um ingresso.');
      return;
    }
    const ticketsToPurchase = Object.entries(quantities).flatMap(([ticketTypeId, quantity]) =>
      Array(quantity).fill({ ticketTypeId: Number(ticketTypeId) })
    );
    if (ticketsToPurchase.length === 0) {
      Alert.alert("Atenção", "Por favor, selecione pelo menos um ingresso.");
      return;
    }
    setLoadingPurchase(true);
    try {
      const response = await api.post('/tickets/purchase', { associateId: user.id, tickets: ticketsToPurchase });
      if (response.status === 201) {
        Alert.alert('Sucesso!', 'Ingressos adquiridos com sucesso!', [{ text: 'OK', onPress: () => router.push('/(associado)/meuingresso') }]);
      } else {
        Alert.alert('Sucesso', `Operação concluída com status ${response.status}.`);
      }
    } catch (error) {
      let errorMessage = 'Não foi possível concluir a compra. Tente novamente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      Alert.alert('Erro na Compra', errorMessage);
    } finally {
      setLoadingPurchase(false);
    }
  };

  const calculateTotal = () => {
    if (!ticketTypes.length) return 0;
    return ticketTypes.reduce((total, type) => {
      const quantity = quantities[type.id] || 0;
      return total + (quantity * type.price);
    }, 0);
  };

  const totalValue = calculateTotal();

  if (loadingEvent) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#667eea" /></View>;
  }

  if (!event) {
    // Manter o CustomHeaderIn aqui para o estado de erro, dentro da SafeAreaView
    return (
      <View style={styles.loadingContainer}>
        <SafeAreaView style={styles.safeAreaForHeader}>
          <CustomHeaderIn />
        </SafeAreaView>
        <ThemedText style={styles.errorText}>Evento não encontrado.</ThemedText>
      </View>
    );
  }

  return (
    // Container principal que vai ter o ScrollView e o Footer fixo
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* O CustomHeaderIn é o primeiro elemento rolável, dentro da SafeAreaView */}
        <SafeAreaView style={styles.safeAreaForHeader}>
          <CustomHeaderIn />
        </SafeAreaView>

        {/* Imagem do evento com borderRadius e centralização */}
        <Image
          source={{ uri: event?.image_url }}
          style={styles.eventImage}
          resizeMode="cover"
        />

        {/* Gradiente para sobrepor a parte inferior da imagem */}
        {/* <LinearGradient
          colors={['transparent', 'rgba(244,244,248,0.8)', '#f4f4f8']}
          style={styles.gradient}
        /> */}

        {/* Conteúdo do evento (nome, data, localização, descrição) */}
        <View style={styles.contentContainer}>
          <ThemedText style={styles.eventName}>{event?.name}</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#667eea" /> {/* Ajustado a cor do ícone */}
            <ThemedText style={styles.infoText}>{formatDate(event?.date_time)}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#667eea" /> {/* Ajustado a cor do ícone */}
            <ThemedText style={styles.infoText}>{event?.location}</ThemedText>
          </View>
          <ThemedText style={styles.eventDescription}>{event?.description}</ThemedText>

          <View style={styles.ticketsSection}>
            <ThemedText style={styles.sectionTitle}>Ingressos</ThemedText>
            {ticketTypes.map((type) => (
              <View key={type.id} style={styles.ticketTypeRow}>
                <View style={styles.ticketDetails}>
                  <ThemedText style={styles.ticketTypeName}>{type.name}</ThemedText>
                  <ThemedText style={styles.ticketTypePrice}>R$ {type.price.toFixed(2).replace('.', ',')}</ThemedText>
                </View>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity onPress={() => handleQuantityChange(type.id, -1)} style={styles.quantityButton} disabled={!quantities[type.id] || quantities[type.id] === 0}>
                    <ThemedText style={styles.quantityButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.quantityText}>{quantities[type.id] || 0}</ThemedText>
                  <TouchableOpacity onPress={() => handleQuantityChange(type.id, 1)} style={styles.quantityButton}>
                    <ThemedText style={styles.quantityButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Fixo na parte inferior */}
      <View style={styles.footer}>
        <View style={styles.totalPriceContainer}>
          <ThemedText style={styles.totalPriceLabel}>Total:</ThemedText>
          <ThemedText style={styles.totalPriceValue}>R$ {totalValue.toFixed(2).replace('.', ',')}</ThemedText>
        </View>
        <TouchableOpacity style={[styles.buyButton, (loadingPurchase || totalValue === 0) && styles.disabledButton]} onPress={handlePurchaseTicket} disabled={loadingPurchase || totalValue === 0}>
          {loadingPurchase ? <ActivityIndicator size="small" color="#FFFFFF" /> : <ThemedText style={styles.buyButtonText}>Adquirir Ingresso(s)</ThemedText>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f8',
  },
  errorText: {
    color: '#333',
    fontSize: 18,
    marginTop: 20,
  },
  safeAreaForHeader: {
    backgroundColor: 'transparent',
    paddingBottom: 10, // Espaçamento extra abaixo do header, se precisar
    paddingTop:30
  },
  scrollContent: {
    // O paddingBottom deve ser maior ou igual à altura do footer fixo
    // (padding 20 + paddingBottom 30 = 50). Adicione um extra para garantir.
    paddingBottom: 150, // Ajuste este valor. Um valor seguro é a altura do footer + margem.
  },
  eventImage: {
    borderRadius: 20,
    width: '95%',
    height: 350,
    backgroundColor: '#ccc',
    alignSelf: 'center', // Centraliza a imagem
    marginTop: 10, // Espaçamento do CustomHeader
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    // O 'top' do gradiente precisa ser calculado dinamicamente ou ajustado com cuidado.
    // Se a imagem tem 350 de altura e 10 de marginTop, ela termina em 360 do topo do ScrollView.
    // O gradiente deve começar um pouco antes de 360 para criar o efeito.
    top: 360 - 150, // 360 (final da imagem) - 150 (altura do gradiente) = 210
    height: 150,
    zIndex: 1, // Garante que o gradiente fique acima da imagem, mas abaixo do texto se o contentContainer tiver zIndex maior
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#f4f4f8',
    // marginTop negativo para sobrepor a parte inferior do gradiente.
    marginTop: -70, // Ajuste conforme a visibilidade desejada do gradiente e do nome do evento.
    zIndex: 2, // Garante que o conteúdo textual apareça acima do gradiente
  },
  eventName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  eventDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginTop: 20,
  },
  ticketsSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  ticketTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  ticketDetails: {
    flex: 1,
  },
  ticketTypeName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  ticketTypePrice: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#e8e8e8',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute', // Torna o footer fixo na tela
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // Adiciona padding para o "safe area" inferior em iPhones mais novos
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10, // Sombra para Android
    zIndex: 3, // Garante que o footer fique acima de todo o resto
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalPriceLabel: {
    fontSize: 18,
    color: '#555',
    fontWeight: '500',
  },
  totalPriceValue: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
});