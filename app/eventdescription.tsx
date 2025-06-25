import { Ionicons } from '@expo/vector-icons';
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
} from 'react-native';

import api from '../api';
import CustomHeader from '../components/CustomHeader'; // Header para usuário não logado
import formatDate from '../helpers/formatDate';

// 1. Interface para tipar o objeto de evento, correspondendo ao backend
interface EventType {
  id: number;
  name: string;
  description: string;
  date_time: string; // <-- Propriedade correta da data
  location: string;
  image_url?: string; // <-- Opcional, buscada separadamente
}

export default function EventDescription() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. useEffect corrigido para buscar todos os dados necessários
  useEffect(() => {
    if (eventId && typeof eventId === 'string') {
      const fetchEventData = async () => {
        setLoading(true);
        try {
          // Busca os detalhes e a URL da imagem em paralelo
          const [detailsResponse, imageUrlResponse] = await Promise.all([
            api.get(`/events/${eventId}`),
            api.get(`/events/${eventId}/imageUrl`),
          ]);

          // Combina os resultados em um único objeto
          const combinedEventData: EventType = {
            ...detailsResponse.data,
            image_url: imageUrlResponse.data.imageUrl,
          };

          setEvent(combinedEventData);
        } catch (error) {
          console.error('Erro ao buscar detalhes do evento:', error);
          Alert.alert('Erro', 'Não foi possível carregar os detalhes do evento.');
        } finally {
          setLoading(false);
        }
      };
      fetchEventData();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  // Exibe um indicador de carregamento enquanto busca os dados
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // Exibe uma mensagem se o evento não for encontrado
  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <CustomHeader />
        <Text style={styles.errorText}>Evento não encontrado.</Text>
      </View>
    );
  }

  // Renderização principal da tela
  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 3. Renderização defensiva usando optional chaining (?.) */}
        <Image source={{ uri: event?.image_url }} style={styles.eventImage} />
        <LinearGradient
          colors={['transparent', 'rgba(28,28,28,0.8)', '#1c1c1c']}
          style={styles.gradient}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.eventName}>{event?.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#ccc" />
            <Text style={styles.infoText}>{formatDate(event?.date_time)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#ccc" />
            <Text style={styles.infoText}>{event?.location}</Text>
          </View>
          <Text style={styles.eventDescription}>{event?.description}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push('/login')} // Ação do botão para não logado
        >
          <Text style={styles.buyButtonText}>Faça Login para Adquirir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  eventImage: {
    width: '100%',
    height: 350,
    backgroundColor: '#333',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 200,
    height: 150,
  },
  contentContainer: {
    padding: 20,
    marginTop: -50,
  },
  eventName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#ccc',
    marginLeft: 10,
  },
  eventDescription: {
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 24,
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(28, 28, 28, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  buyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});