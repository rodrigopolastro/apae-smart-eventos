import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dados dos eventos
const initialEvents = [
  {
    id: '1',
    image: require('../../assets/images/festajunina.jpg'),
    title: 'Expo Ecomm Circuito 2025',
    details: 'Goiânia 2025 | Terça-feira, 14 Out. • 13h',
    status: 'ativo'
  },
  {
    id: '2',
    image: require('../../assets/images/festajunina.jpg'),
    title: 'Ceará Trap Music Festival',
    details: 'Fortaleza - CE | Sábado, 28 Set. • 19h',
    status: 'ativo'
  },
  {
    id: '3',
    image: require('../../assets/images/festajunina.jpg'),
    title: 'Festa Junina',
    details: 'APAE 2025 | Terça-feira, 14 Out. • 13h',
    status: 'ativo'
  },
  {
    id: '4',
    image: require('../../assets/images/festajunina.jpg'),
    title: 'Mega Encontro Tech',
    details: 'São Paulo - SP | Sexta-feira, 05 Dez. • 09h',
    status: 'ativo'
  },
  {
    id: '5',
    image: require('../../assets/images/festajunina.jpg'),
    title: 'Conferência de IA',
    details: 'Rio de Janeiro - RJ | Quarta-feira, 20 Nov. • 10h',
    status: 'ativo'
  }
];

export default function AdminScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });

  const handleInputChange = (name: string, value: string) => {
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    const newEvent = {
      id: String(events.length + 1),
      title: eventData.title,
      details: `${eventData.location} | ${eventData.date}`,
      image: require('../../assets/images/festajunina.jpg'),
      status: 'ativo'
    };
    
    setEvents([...events, newEvent]);
    setModalVisible(false);
    setEventData({
      title: '',
      description: '',
      date: '',
      location: '',
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const toggleEventStatus = (id: string) => {
    setEvents(events.map(event => 
      event.id === id 
        ? { ...event, status: event.status === 'ativo' ? 'inativo' : 'ativo' } 
        : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  // Função para navegar para a tela de descrição do evento
  const handleEventPress = (eventId: string) => {
    router.push({ 
      pathname: '/eventdescription', 
      params: { eventId } 
    });
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar / Header */}
        <LinearGradient
          colors={['#007AFF', '#5DADE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Painel Admin</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Gerenciamento de Eventos</Text>
          
          {/* Lista de Eventos */}
          <Text style={styles.eventsTitle}>Eventos Cadastrados</Text>
          
          {events.map(event => (
            <TouchableOpacity 
              key={event.id} 
              onPress={() => handleEventPress(event.id)}
            >
              <View style={[
                styles.eventCard,
                event.status === 'inativo' && styles.inactiveEvent
              ]}>
                <Image source={event.image} style={styles.eventImage} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventDetail}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.eventText}>{event.details}</Text>
                  </View>
                  <View style={styles.eventStatusContainer}>
                    <View style={[
                      styles.eventStatus,
                      event.status === 'ativo' ? styles.activeStatus : styles.inactiveStatus
                    ]}>
                      <Text style={styles.eventStatusText}>
                        {event.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleEventStatus(event.id);
                    }}
                  >
                    <Ionicons 
                      name={event.status === 'ativo' ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#007AFF" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteEvent(event.id);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Modal do Formulário (mantido igual) */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          {/* ... (código do modal permanece igual) ... */}
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// Estilos (mantidos iguais)
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
    flexDirection: 'row',
    height: 140,
  },
  inactiveEvent: {
    opacity: 0.7,
  },
  eventImage: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  eventStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeStatus: {
    backgroundColor: '#D5F5E3',
  },
  inactiveStatus: {
    backgroundColor: '#FADBD8',
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventActions: {
    width: 50,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    padding: 5,
  },
});