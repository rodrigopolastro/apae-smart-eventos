import { useRouter } from 'expo-router';
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
import api from '../../api';
import CustomHeaderIn from '../../components/CustomHeaderIn';

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  image_url: string;
}

export default function HomeLogado() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        const eventsWithImages = await Promise.all(
          response.data.map(async (event: Event) => {
            try {
              const imageUrlResponse = await api.get(`/events/${event.id}/imageUrl`);
              return { ...event, image_url: imageUrlResponse.data.imageUrl };
            } catch (imageError) {
              console.error(`Erro ao buscar imagem para o evento ${event.id}:`, imageError);
              return { ...event, image_url: null };
            }
          })
        );
        setEvents(eventsWithImages);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os eventos.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: '/eventdescriptionlogado',
      params: { eventId: eventId },
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeaderIn />
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />
        ) : (
          events.map((evento) => (
            <TouchableOpacity key={evento.id} style={styles.card} onPress={() => handleEventPress(evento.id)}>
              <Image source={{ uri: evento.image_url }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.title}>{evento.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {evento.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ATUALIZADOS PARA TEMA CLARO ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8', // Fundo da tela alterado para cinza claro
  },
  card: {
    backgroundColor: '#fff', // Fundo do card alterado para branco
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0', // Fundo para a imagem caso ela não carregue
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Cor do texto alterada para escura
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666', // Cor do texto alterada para cinza escuro
  },
});