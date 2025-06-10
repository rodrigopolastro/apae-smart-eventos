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

// Importe o CustomHeader (mantenha se você usa)
import CustomHeader from '../../components/CustomHeaderLogin'; // Ajuste este caminho

// Importe o novo componente de scanner

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
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '', // Corresponde a date_time no backend. Ex: "2025-10-14T13:00:00"
    location: '',
  });
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [validationVisible, setValidationVisible] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'success' | 'fail' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrCodeLock = useRef(false);

  // Função para buscar eventos do backend
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) {
        throw new Error(`Erro ao carregar eventos: ${response.status}`);
      }
      // Omitimos 'status' e 'imageUrl' da tipagem inicial da resposta JSON,
      // pois eles serão adicionados no frontend.
      const data: Omit<Event, 'status' | 'imageUrl'>[] = await response.json();

      // Para cada evento, buscar a URL da imagem de capa e adicionar status de frontend
      const eventsWithImages = await Promise.all(
        data.map(async (event) => {
          let imageUrl;
          // Verifica se existem informações de bucket e path para tentar buscar a imagem
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
                // Fallback para imagem local se a URL assinada não for obtida
                imageUrl = undefined;
              }
            } catch (imgError) {
              console.error(`Erro ao buscar imagem para o evento ${event.id}:`, imgError);
              imageUrl = undefined; // Garante que a URL seja undefined em caso de erro
            }
          }
          // Por padrão, todos os eventos do backend são considerados 'ativos' para fins de listagem aqui
          // O 'as' é um type assertion para garantir que o TypeScript reconheça 'ativo' como o literal 'ativo'
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
      return;
    }
    qrCodeLock.current = true;
    setModalIsVisible(false);
    const response = await api.get(`/tickets/${data}/validateTicket`);
    const isTicketValid = response.data.isTicketValid;

    let alertTitle, alertMessage;
    if (isTicketValid) {
      alertTitle = 'Ingresso Aprovado';
      alertMessage = 'Seja muito-bem vindo!';
    } else {
      alertTitle = 'Ingresso Inválido';
      alertMessage = 'Ingresso inválido ou já utilizado.';
    }

    Alert.alert(alertTitle, alertMessage, [
      {
        text: 'OK',
        onPress: () => {
          qrCodeLock.current = false;
        },
      },
    ]);
  }

  const handleSubmit = async () => {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.location) {
      Alert.alert('Erro', 'Preencha todos os campos para criar um evento.');
      return;
    }

    // Preparar os dados para o backend
    const newEventForBackend = {
      name: eventData.title,
      description: eventData.description,
      // Adapte a data para o formato DATETIME do MySQL.
      // É crucial que o formato da entrada seja reconhecido por `new Date()`.
      // Recomenda-se ISO 8601 (e.g., "YYYY-MM-DDTHH:MM:SS").
      date_time: new Date(eventData.date).toISOString(),
      location: eventData.location,
      // cover_image_bucket e cover_image_path seriam definidos aqui se você tivesse upload de imagem real.
      // Por enquanto, use placeholders que o backend aceite.
      cover_image_bucket: 'event-covers-apaecuritiba', // Substitua pelo seu bucket real do S3
      cover_image_path: 'placeholder.jpg', // Substitua por um path padrão válido no S3
      duration_minutes: 60, // Exemplo: Adicione ao formulário se precisar ser variável
      event_type: 'public', // Exemplo: Adicione ao formulário se precisar ser variável
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
      fetchEvents(); // Recarrega a lista de eventos após a criação
    } catch (e: any) {
      console.error('Erro ao criar evento:', e);
      Alert.alert('Erro', e.message || 'Não foi possível criar o evento. Tente novamente.');
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: 'ativo' | 'inativo') => {
    // ATENÇÃO: Esta função é atualmente APENAS VISUAL no frontend.
    // Seu backend não tem uma rota direta para mudar o status de um evento (ativo/inativo).
    // Se você quiser que essa funcionalidade afete o backend, você precisará:
    // 1. Criar uma nova coluna (ex: `is_active` BOOLEAN) na sua tabela `events`.
    // 2. Criar uma rota PUT/PATCH no backend (ex: `/events/:id/status`) para atualizar essa coluna.
    // 3. Modificar esta função para chamar essa rota do backend.
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
              fetchEvents(); // Recarrega a lista de eventos
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

  // Função auxiliar para formatar a data/hora para exibição
  const formatDateTimeForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      // O `Intl.DateTimeFormatOptions` permite formatar a data de forma localizada.
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', // Dia da semana por extenso (ex: "terça-feira")
        day: '2-digit', // Dia do mês (ex: "14")
        month: 'short', // Mês abreviado (ex: "Out.")
        hour: '2-digit', // Hora (ex: "13")
        minute: '2-digit', // Minuto (ex: "00")
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
          {/* Adicione o CustomHeader aqui (se estiver usando) */}
          <CustomHeader />

          <View style={styles.adminContentWrapper}>
            <Text style={styles.sectionTitle}>Gerenciamento de Eventos</Text>

            {/* Botão de Criar Evento */}
            <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
              <Ionicons name='add-circle' size={24} color='white' />
              <Text style={styles.createButtonText}>Criar Novo Evento</Text>
            </TouchableOpacity>

            {/* BOTÃO: Ler QR Code (que agora abre o componente local) */}
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
            {/* <TouchableOpacity
              style={styles.qrCodeButton}
              onPress={() => setIsScannerVisible(true)} // Apenas define a visibilidade
            >
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qrCodeButtonGradient}
              >
                <Ionicons name='qr-code-outline' size={24} color='white' />
                <Text style={styles.qrCodeButtonText}>Ler QR Code 3</Text>
              </LinearGradient>
            </TouchableOpacity> */}

            {/* Lista de Eventos */}
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
                    {/* Exibe a imagem carregada do S3 ou uma imagem local de fallback */}
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
                          e.stopPropagation(); // Evita que o clique na ação ative o onPress do Card
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
                          e.stopPropagation(); // Evita que o clique na ação ative o onPress do Card
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

        {/* Modal de validação de QR Code */}
        <Modal visible={modalIsVisible} style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing='back'
            onBarcodeScanned={({ data }) => {
              // Apenas chame handleQRCodeRead se a trava não estiver ativada
              if (data && !qrCodeLock.current) {
                handleQRCodeRead(data);
              }
            }}
          />

          <View style={styles.footer}>
            <Button title='Cancelar' onPress={() => setModalIsVisible(false)} />
          </View>
        </Modal>

        {/* O Componente Scanner de QR Code */}
        {/* <ReadQRCode
          isVisible={isScannerVisible}
          onClose={() => setIsScannerVisible(false)}
          onQRCodeRead={handleQrCodeRead}
        /> */}
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
  // ESTILOS PARA O MODAL DE VALIDAÇÃO
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
