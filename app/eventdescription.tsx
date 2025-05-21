import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Importa useLocalSearchParams
import { StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react'; // Importa useEffect
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width } = Dimensions.get('window');

export default function EventDescriptionScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams(); // Obtém o eventId dos parâmetros da rota
  const [eventDetails, setEventDetails] = useState<any>(null); // Estado para armazenar os detalhes do evento

  // Dados mockados de eventos com mais detalhes
  // Em um cenário real, você faria uma chamada de API para buscar os detalhes do evento
  const mockEventsData = {
    '1': {
      id: '1',
      image: require('../assets/images/festajunina.jpg'),
      title: 'Expo Ecomm Circuito 2025',
      date: '25/05/2025',
      location: 'Goiânia - GO',
      description: 'A Expo Ecomm Circuito 2025 é o maior evento de e-commerce e marketing digital do Centro-Oeste. Prepare-se para dois dias de imersão em tendências, estratégias e inovações que estão moldando o futuro do comércio eletrônico. Contaremos com palestrantes renomados, workshops práticos e uma feira de negócios com as principais soluções do mercado. Não perca a oportunidade de fazer networking e impulsionar o seu negócio!',
      fullDate: 'Terça-feira, 14 de Outubro de 2025 • 13h00',
    },
    '2': {
      id: '2',
      image: require('../assets/images/festajunina.jpg'),
      title: 'Ceará Trap Music Festival',
      date: '28/09/2025',
      location: 'Fortaleza - CE',
      description: 'O Ceará Trap Music Festival traz os maiores nomes do trap nacional e internacional para uma noite inesquecível em Fortaleza. Com uma produção de tirar o fôlego, este festival promete ser o ponto alto do ano para os amantes do gênero. Prepare-se para muita batida, rimas e energia contagiante. Garanta já seu ingresso e venha fazer parte dessa história!',
      fullDate: 'Sábado, 28 de Setembro de 2025 • 19h00',
    },
    '3': {
      id: '3',
      image: require('../assets/images/festajunina.jpg'),
      title: 'Festa Junina APAE 2025',
      date: '14/06/2025',
      location: 'APAE Local',
      description: 'Venha celebrar a tradicional Festa Junina da APAE! Um evento beneficente repleto de alegria, comidas típicas, brincadeiras para toda a família e muita música. Ajude a APAE e divirta-se em um ambiente acolhedor e festivo. Sua presença faz a diferença!',
      fullDate: 'Terça-feira, 14 de Junho de 2025 • 13h00',
    },
    '4': {
      id: '4',
      image: require('../assets/images/festajunina.jpg'),
      title: 'Mega Encontro Tech',
      date: '05/12/2025',
      location: 'São Paulo - SP',
      description: 'O Mega Encontro Tech é o evento ideal para desenvolvedores, engenheiros de software e entusiastas de tecnologia. Serão palestras, workshops e hackathons com foco nas últimas inovações em inteligência artificial, blockchain e desenvolvimento mobile. Uma oportunidade única para aprender e se conectar com os líderes da indústria.',
      fullDate: 'Sexta-feira, 05 de Dezembro de 2025 • 09h00',
    },
    '5': {
      id: '5',
      image: require('../assets/images/festajunina.jpg'),
      title: 'Conferência de IA',
      date: '20/11/2025',
      location: 'Rio de Janeiro - RJ',
      description: 'Participe da Conferência Internacional de Inteligência Artificial, onde especialistas de todo o mundo compartilharão suas pesquisas e descobertas mais recentes. Explore o impacto da IA em diversas indústrias, desde a saúde até a automação. Ideal para pesquisadores, estudantes e profissionais que buscam se aprofundar no universo da inteligência artificial.',
      fullDate: 'Quarta-feira, 20 de Novembro de 2025 • 10h00',
    },
  };

  useEffect(() => {
    if (eventId) {
      // Em um cenário real, você faria uma chamada de API aqui:
      // fetchEventDetails(eventId).then(data => setEventDetails(data));
      setEventDetails(mockEventsData[eventId as keyof typeof mockEventsData]);
    }
  }, [eventId]);

  if (!eventDetails) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando detalhes do evento...</ThemedText>
      </ThemedView>
    );
  }

  const handleGoBack = () => {
    router.back(); // Volta para a tela anterior
  };

  const handleAcquireTicket = () => {
    // Lógica para adquirir ingresso
    alert('Funcionalidade de adquirir ingresso em desenvolvimento!');
    // Em um app real, você navegaria para uma tela de compra ou processaria a aquisição
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar / Header */}
        <LinearGradient
          colors={['#007AFF', '#5DADE2']} // Cores de gradiente azul
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <ThemedView style={styles.headerContent}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <IconSymbol size={30} name='chevron.left' color='#fff' />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Detalhes do Evento</ThemedText>
            <ThemedView style={{ width: 30 }} /> {/* Espaçador para alinhar o título */}
          </ThemedView>
        </LinearGradient>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={eventDetails.image} style={styles.eventImage} />
          <ThemedText style={styles.eventTitle}>{eventDetails.title}</ThemedText>
          <ThemedText style={styles.eventDateLocation}>{eventDetails.fullDate}</ThemedText>
          <ThemedText style={styles.eventDateLocation}>{eventDetails.location}</ThemedText>

          <ThemedView style={styles.divider} />

          <ThemedText style={styles.sectionTitle}>Sobre o Evento</ThemedText>
          <ThemedText style={styles.eventDescription}>{eventDetails.description}</ThemedText>

          <TouchableOpacity style={styles.acquireTicketButton} onPress={handleAcquireTicket}>
            <ThemedText style={styles.acquireTicketButtonText}>Adquirir Ingresso</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
  },
  eventImage: {
    width: '100%',
    height: 250, // Altura maior para a imagem principal
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  eventDateLocation: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    alignSelf: 'flex-start', // Alinha o título da seção à esquerda
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
    marginBottom: 30,
  },
  acquireTicketButton: {
    backgroundColor: '#007AFF', // Azul vibrante para o botão
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  acquireTicketButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});