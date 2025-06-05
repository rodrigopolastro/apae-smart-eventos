import { Ionicons, AntDesign  } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';

// Importe o CustomHeader (mantenha se você usa)
import CustomHeader from '../../components/CustomHeaderLogin'; // Ajuste este caminho

// Importe o novo componente de scanner
import ReadQRCode from '../../components/ReadQRCode'; // Ajuste este caminho

// Dados dos eventos (mantidos iguais)
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
  const [isScannerVisible, setIsScannerVisible] = useState(false); // Novo estado para controlar o scanner
  const [validationVisible, setValidationVisible] = useState(false); // Para o modal de validação

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

  const handleEventPress = (eventId: string) => {
    router.push({ 
      pathname: '/eventdescriptionadmin', 
      params: { eventId } 
    });
  };

  // Função para lidar com a leitura do QR Code vinda do componente
  const handleQrCodeRead = (qrCodeData: string) => {
    console.log("QR Code Lido na AdminScreen:", qrCodeData);
    setIsScannerVisible(false); // Fechar o scanner
    setValidationVisible(true); // Mostrar o modal de validação

    // Esconde a validação após 3 segundos
    setTimeout(() => {
      setValidationVisible(false);
    }, 3000);

    // Aqui você pode adicionar sua lógica para validar o ingresso com qrCodeData
    // Por exemplo, fazer uma requisição API.
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Adicione o CustomHeader aqui (se estiver usando) */}
          <CustomHeader /> 

          <View style={styles.adminContentWrapper}>
            <Text style={styles.sectionTitle}>Gerenciamento de Eventos</Text>
            
            {/* Botão de Criar Evento */}
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.createButtonText}>Criar Novo Evento</Text>
            </TouchableOpacity>

            {/* BOTÃO: Ler QR Code (que agora abre o componente local) */}
            <TouchableOpacity 
              style={styles.qrCodeButton} 
              onPress={() => setIsScannerVisible(true)} // Apenas define a visibilidade
            >
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qrCodeButtonGradient}
              >
                <Ionicons name="qr-code-outline" size={24} color="white" />
                <Text style={styles.qrCodeButtonText}>Ler QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>

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
          </View>
        </ScrollView>

        {/* Modal do Formulário (mantido igual) */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.safeArea}>
            <LinearGradient
              colors={['#007AFF', '#5DADE2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Criar Novo Evento</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.formContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título do Evento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Evento"
                  value={eventData.title}
                  onChangeText={(text) => handleInputChange('title', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detalhes completos do evento"
                  multiline
                  value={eventData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Data e Hora</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 14 Out. • 13h"
                  value={eventData.date}
                  onChangeText={(text) => handleInputChange('date', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Localização</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Goiânia - GO"
                  value={eventData.location}
                  onChangeText={(text) => handleInputChange('location', text)}
                />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Cadastrar Evento</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Modal de validação (AGORA NA ADMINSCREEN, USANDO ANTDESIGN) */}
        <Modal
            visible={validationVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setValidationVisible(false)}
        >
            <View style={styles.validationContainer}>
                <View style={styles.validationContent}>
                    <AntDesign name="checkcircle" size={80} color="#4CAF50" />
                    <Text style={styles.validationText}>Ingresso validado</Text>
                </View>
            </View>
        </Modal>

        {/* O Componente Scanner de QR Code */}
        <ReadQRCode
            isVisible={isScannerVisible}
            onClose={() => setIsScannerVisible(false)}
            onQRCodeRead={handleQrCodeRead}
        />

      </SafeAreaView>
    </View>
  );
}

// Estilos (mantidos e adicionados os novos)
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  adminContentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 35,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign:"center"
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    gap: 10,
    marginBottom: 15,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // ESTILOS PARA O BOTÃO QR CODE
  qrCodeButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  qrCodeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  qrCodeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // CONTINUAÇÃO DOS ESTILOS
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
  modalHeader: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    flexDirection: 'row',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    left: 20,
    top: 35,
    zIndex: 1,
  },
  modalHeaderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // ESTILOS PARA O MODAL DE VALIDAÇÃO (MOVIDOS PARA ADMINSCREEN)
  validationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  validationContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  validationText: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});