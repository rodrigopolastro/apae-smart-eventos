import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api'; // Importe a instância do Axios configurada

import CustomHeader from '../../components/CustomHeaderLogin'; // Ajuste este caminho

// Defina a URL base da sua API.
// SUBSTITUA 'http://YOUR_API_BASE_URL' PELA URL REAL DO SEU BACKEND!
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface Event {
  id: string;
  name: string; // Mapeia para 'title' no frontend original
  description: string;
  location: string;
  date_time: string; // Mapeia para 'date' no frontend original
  cover_image_bucket?: string;
  cover_image_path?: string;
  imageUrl?: string; // Para a URL assinada
  status?: 'ativo' | 'inativo'; // Adicionado para o status de frontend
}

export default function AdminScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // Modal para criar evento
  const [events, setEvents] = useState<Event[]>([]);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '', // Corresponde a date_time no backend. Ex: "2025-10-14T13:00:00"
    location: '',
  });
  const [isScannerVisible, setIsScannerVisible] = useState(false); // Agora não é usado diretamente, use modalIsVisible
  const [modalIsVisible, setModalIsVisible] = useState(false); // Modal da câmera/scanner
  const [validationVisible, setValidationVisible] = useState(false); // Novo modal para feedback de validação
  const [validationStatus, setValidationStatus] = useState<'success' | 'fail' | null>(null); // Status da validação
  const [validationMessage, setValidationMessage] = useState<string>(''); // Mensagem para o modal de validação
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrCodeLock = useRef(false); // Trava para evitar múltiplas leituras rápidas

  // Função para buscar eventos do backend
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) {
        throw new Error(`Erro ao carregar eventos: ${response.status}`);
      }
      const data: Omit<Event, 'status' | 'imageUrl'>[] = await response.json();

      const eventsWithImages = await Promise.all(
        data.map(async (event) => {
          let imageUrl;
          if (event.cover_image_bucket && event.cover_image_path) {
            try {
              const imageResponse = await fetch(`${API_BASE_URL}/events/${event.id}/imageUrl`);
              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                imageUrl = imageData.imageUrl;
              } else {
                console.warn(
                  `Não foi possível obter a imagem para o evento ${event.id}:`,
                  imageResponse.status,
                  await imageResponse.text()
                );
                imageUrl = undefined;
              }
            } catch (imgError) {
              console.error(`Erro ao buscar imagem para o evento ${event.id}:`, imgError);
              imageUrl = undefined;
            }
          }
          return { ...event, imageUrl, status: 'ativo' as 'ativo' | 'inativo' };
        })
      );
      setEvents(eventsWithImages);
    } catch (e: any) {
      console.error('Falha ao buscar eventos:', e);
      setError(e.message || 'Erro ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  async function handleQRCodeRead(data: string) {
    if (qrCodeLock.current) {
      return; // Se a trava estiver ativa, ignora leituras subsequentes
    }
    qrCodeLock.current = true; // Ativa a trava
    setModalIsVisible(false); // Fecha o modal do scanner imediatamente
    setValidationVisible(true); // Abre o modal de validação para feedback

    let currentValidationStatus: 'success' | 'fail' = 'fail';
    let currentValidationMessage: string = 'Erro desconhecido.';

    try {
      // 1. Primeiro, valida o ticket
      const validationResponse = await api.get(`/tickets/${data}/validateTicket`);
      const isTicketValid = validationResponse.data.isTicketValid;

      if (isTicketValid) {
        // 2. Se o ticket é válido, tenta usá-lo (invalidá-lo)
        try {
          const useTicketResponse = await api.post(`/tickets/${data}/useTicket`);
          // Se a requisição POST for bem-sucedida (status 2xx), o ticket foi usado.
          currentValidationStatus = 'success';
          currentValidationMessage = 'Ingresso Aprovado! Seja muito bem-vindo!';
        } catch (useError: any) {
          // Captura erros específicos da rota useTicket (ex: 409 Conflict - já usado)
          if (useError.response && useError.response.status === 409) {
            currentValidationStatus = 'fail';
            currentValidationMessage = 'Este ingresso já foi utilizado anteriormente.';
          } else if (useError.response && useError.response.data && useError.response.data.message) {
            currentValidationStatus = 'fail';
            currentValidationMessage = `Erro ao usar ingresso: ${useError.response.data.message}`;
          } else {
            currentValidationStatus = 'fail';
            currentValidationMessage = 'Ocorreu um erro inesperado ao usar o ingresso.';
          }
          console.error('Erro ao usar ticket (POST):', useError);
        }
      } else {
        // Se a validação inicial falhou (ticket inválido ou não encontrado)
        currentValidationStatus = 'fail';
        currentValidationMessage = 'Ingresso inválido ou não encontrado.';
      }
    } catch (error: any) {
      // Captura erros gerais da validação (ex: erro de rede, erro 500 do servidor)
      console.error('Erro na validação do ticket (GET):', error);
      currentValidationStatus = 'fail';
      currentValidationMessage = 'Não foi possível verificar o ingresso. Verifique sua conexão ou tente novamente.';
      if (error.response && error.response.data && error.response.data.message) {
         currentValidationMessage = error.response.data.message; // Usa a mensagem de erro do backend se disponível
      }
    } finally {
      // Define os estados para exibir o resultado no modal de validação
      setValidationStatus(currentValidationStatus);
      setValidationMessage(currentValidationMessage);

      // Fecha o modal de validação após um tempo e libera a trava
      setTimeout(() => {
        setValidationVisible(false);
        qrCodeLock.current = false; // Libera a trava após o feedback
      }, 3000); // Exibe o status por 3 segundos
    }
  }

  const handleSubmit = async () => {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.location) {
      Alert.alert('Erro', 'Preencha todos os campos para criar um evento.');
      return;
    }

    const newEventForBackend = {
      name: eventData.title,
      description: eventData.description,
      date_time: new Date(eventData.date).toISOString(),
      location: eventData.location,
      cover_image_bucket: 'event-covers-apaecuritiba', // Substitua pelo seu bucket real do S3
      cover_image_path: 'placeholder.jpg', // Substitua por um path padrão válido no S3
      duration_minutes: 60,
      event_type: 'public',
    };

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEventForBackend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar evento.');
      }

      Alert.alert('Sucesso', 'Evento criado com sucesso!');
      setModalVisible(false);
      setEventData({
        title: '',
        description: '',
        date: '',
        location: '',
      });
      fetchEvents();
    } catch (e: any) {
      console.error('Erro ao criar evento:', e);
      Alert.alert('Erro', e.message || 'Não foi possível criar o evento. Tente novamente.');
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: 'ativo' | 'inativo') => {
    Alert.alert(
      'Atenção',
      'A funcionalidade de ativar/desativar eventos é apenas visual neste momento. Não está conectada ao backend para alteração de status de evento.',
      [{ text: 'OK' }]
    );
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? { ...event, status: currentStatus === 'ativo' ? 'inativo' : 'ativo' }
          : event
      )
    );
  };

  const deleteEvent = async (eventId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este evento? Esta ação é irreversível.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir evento.');
              }

              Alert.alert('Sucesso', 'Evento excluído com sucesso!');
              fetchEvents();
            } catch (e: any) {
              console.error('Erro ao excluir evento:', e);
              Alert.alert(
                'Erro',
                e.message || 'Não foi possível excluir o evento. Tente novamente.'
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/eventdescriptionadmin',
      params: { eventId },
    });
  };

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        Alert.alert('Câmera', 'Habilite o uso da câmera para ler o QR Code.');
        return;
      }
      setModalIsVisible(true);
      qrCodeLock.current = false; // Resetar a trava ao abrir a câmera
    } catch (error) {
      console.log(error);
    }
  }

  const formatDateTimeForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      };
      return `${date.toLocaleDateString('pt-BR', options)} • ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch (e) {
      console.error('Erro ao formatar data:', dateString, e);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#006db2' />
        <Text style={styles.loadingText}>Carregando eventos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar eventos: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomHeader />

          <View style={styles.adminContentWrapper}>
            <Text style={styles.sectionTitle}>Gerenciamento de Eventos</Text>

            <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
              <Ionicons name='add-circle' size={24} color='white' />
              <Text style={styles.createButtonText}>Criar Novo Evento</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleOpenCamera} style={styles.qrCodeButton}>
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qrCodeButtonGradient}
              >
                <Ionicons name='scan' size={24} color='white' />
                <Text style={styles.qrCodeButtonText}>Ler QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.eventsTitle}>Eventos Cadastrados</Text>

            {events.length === 0 ? (
              <Text style={styles.noEventsText}>
                Nenhum evento encontrado. Crie um novo evento!
              </Text>
            ) : (
              events.map((event) => (
                <TouchableOpacity key={event.id} onPress={() => handleEventPress(event.id)}>
                  <View
                    style={[styles.eventCard, event.status === 'inativo' && styles.inactiveEvent]}
                  >
                    <Image
                      source={
                        event.imageUrl
                          ? { uri: event.imageUrl }
                          : require('../../assets/images/festajunina.jpg')
                      }
                      style={styles.eventImage}
                    />
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.name}</Text>
                      <View style={styles.eventDetail}>
                        <Ionicons name='calendar' size={16} color='#666' />
                        <Text style={styles.eventText}>
                          {event.location} | {formatDateTimeForDisplay(event.date_time)}
                        </Text>
                      </View>
                      <View style={styles.eventStatusContainer}>
                        <View
                          style={[
                            styles.eventStatus,
                            event.status === 'ativo' ? styles.activeStatus : styles.inactiveStatus,
                          ]}
                        >
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
                          toggleEventStatus(event.id, event.status || 'ativo');
                        }}
                      >
                        <Ionicons
                          name={event.status === 'ativo' ? 'eye-off' : 'eye'}
                          size={20}
                          color='#007AFF'
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                      >
                        <Ionicons name='trash' size={20} color='#FF3B30' />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Modal do Formulário para Criar Evento */}
        <Modal
          animationType='slide'
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
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name='close' size={28} color='white' />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Criar Novo Evento</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.formContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título do Evento</Text>
                <TextInput
                  style={styles.input}
                  placeholder='Nome do Evento'
                  value={eventData.title}
                  onChangeText={(text) => handleInputChange('title', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder='Detalhes completos do evento'
                  multiline
                  value={eventData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Data e Hora</Text>
                <TextInput
                  style={styles.input}
                  placeholder='Ex: 2025-10-14T13:00:00 (Formato ISO)'
                  value={eventData.date}
                  onChangeText={(text) => handleInputChange('date', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Localização</Text>
                <TextInput
                  style={styles.input}
                  placeholder='Ex: Goiânia - GO'
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

        {/* Modal de Câmera para validação de QR Code */}
        <Modal visible={modalIsVisible} style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing='back'
            onBarcodeScanned={({ data }) => {
              if (data && !qrCodeLock.current) {
                handleQRCodeRead(data);
              }
            }}
          />
          <View style={styles.footer}>
            <Button title='Cancelar' onPress={() => setModalIsVisible(false)} />
          </View>
        </Modal>

        {/* Novo Modal de Feedback de Validação (sucesso/falha) */}
        <Modal
          animationType='fade'
          transparent={true}
          visible={validationVisible}
          onRequestClose={() => setValidationVisible(false)}
        >
          <View style={styles.validationContainer}>
            <View style={[
              styles.validationContent,
              validationStatus === 'success' ? styles.validationSuccess : styles.validationFail
            ]}>
              <Ionicons
                name={validationStatus === 'success' ? 'checkmark-circle' : 'close-circle'}
                size={80}
                color={validationStatus === 'success' ? '#28A745' : '#DC3545'}
              />
              <Text style={styles.validationText}>{validationMessage}</Text>
            </View>
          </View>
        </Modal>

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
    textAlign: 'center',
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
  // ESTILOS PARA O MODAL DE VALIDAÇÃO
  validationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Fundo escurecido
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
    width: '80%', // Ocupa 80% da largura
  },
  validationSuccess: {
    borderWidth: 2,
    borderColor: '#28A745',
  },
  validationFail: {
    borderWidth: 2,
    borderColor: '#DC3545',
  },
  validationText: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#006db2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    alignItems: 'center',
  },
});