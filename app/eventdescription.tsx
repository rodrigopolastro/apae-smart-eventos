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
  SafeAreaView, // Importado para usar com o CustomHeader
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import api from '../api';
import CustomHeader from '../components/CustomHeader'; // Header para usuário não logado
import formatDate from '../helpers/formatDate';

interface EventType {
  id: number;
  name: string;
  description: string;
  date_time: string;
  location: string;
  image_url?: string;
}

export default function EventDescription() {
  const router = useRouter(); // Mantenha o useRouter para as ações de navegação (push, etc.)
  const params = useLocalSearchParams();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  // Remova ESTE useEffect:
  // useEffect(() => {
  //   router.setOptions({
  //     headerShown: false,
  //   });
  // }, [router]);


  useEffect(() => {
    if (eventId && typeof eventId === 'string') {
      const fetchEventData = async () => {
        setLoading(true);
        try {
          const [detailsResponse, imageUrlResponse] = await Promise.all([
            api.get(`/events/${eventId}`),
            api.get(`/events/${eventId}/imageUrl`),
          ]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <SafeAreaView style={styles.safeAreaForHeader}>
            <CustomHeader />
        </SafeAreaView>
        <ThemedText style={styles.errorText}>Evento não encontrado.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeAreaForHeader}>
            <CustomHeader />
        </SafeAreaView>

        <Image
          source={{ uri: event?.image_url }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        {/* <LinearGradient
          colors={['transparent', 'rgba(244,244,248,0.8)', '#f4f4f8']}
          style={styles.gradient}
        /> */}
        <View style={styles.contentContainer}>
          <ThemedText style={styles.eventName}>{event?.name}</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#667eea" />
            <ThemedText style={styles.infoText}>{formatDate(event?.date_time)}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#667eea" />
            <ThemedText style={styles.infoText}>{event?.location}</ThemedText>
          </View>
          <ThemedText style={styles.eventDescription}>{event?.description}</ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push('/login')}
        >
          <ThemedText style={styles.buyButtonText}>Faça Login para Adquirir</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    paddingBottom: 10,
    paddingTop:30
  },
  scrollContent: {
    paddingBottom: 100,
  },
  eventImage: {
    borderRadius: 20,
    width: '95%',
    height: 350,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: 10,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 360 - 150,
    height: 150,
    zIndex: 1,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#f4f4f8',
    marginTop: -70,
    zIndex: 2,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
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
    elevation: 10,
    zIndex: 3,
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