import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// Dados mockados dos ingressos do usuário
const userTickets = [
  {
    id: 't1',
    eventId: '1',
    eventName: 'Expo Ecomm Circuito 2025',
    eventDate: '14/10/2025 • 13h',
    eventLocation: 'Goiânia - GO',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'VIP',
    price: 250.00,
    qrCode: 'https://example.com/qrcode1.pdf',
    purchaseDate: '10/05/2025'
  },
  {
    id: 't2',
    eventId: '1',
    eventName: 'Expo Ecomm Circuito 2025',
    eventDate: '14/10/2025 • 13h',
    eventLocation: 'Goiânia - GO',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'Normal',
    price: 120.00,
    qrCode: 'https://example.com/qrcode2.pdf',
    purchaseDate: '10/05/2025'
  },
  {
    id: 't3',
    eventId: '3',
    eventName: 'Festa Junina APAE',
    eventDate: '14/06/2025 • 13h',
    eventLocation: 'APAE Local',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'Meia',
    price: 60.00,
    qrCode: 'https://example.com/qrcode3.pdf',
    purchaseDate: '20/05/2025'
  },
  {
    id: 't4',
    eventId: '5',
    eventName: 'Conferência de IA',
    eventDate: '20/11/2025 • 10h',
    eventLocation: 'Rio de Janeiro - RJ',
    eventImage: require('../../assets/images/festajunina.jpg'),
    type: 'Normal',
    price: 120.00,
    qrCode: 'https://example.com/qrcode4.pdf',
    purchaseDate: '01/06/2025'
  }
];

export default function MyTicketsScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleViewEvent = (eventId: string) => {
    router.push({ pathname: '/eventdescription', params: { eventId } });
  };

  const handleViewQRCode = (ticketId: string) => {
    // Em uma implementação real, isso abriria o visualizador de PDF
    const ticket = userTickets.find(t => t.id === ticketId);
    alert(`Abrindo QRCode para ingresso ${ticketId}\nEvento: ${ticket?.eventName}\nURL: ${ticket?.qrCode}`);
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar / Header */}
        <LinearGradient
          colors={['#007AFF', '#5DADE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <ThemedView style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Meus Ingressos</ThemedText>
            <View style={{ width: 24 }} />
          </ThemedView>
        </LinearGradient>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Resumo */}
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryTitle}>Você possui {userTickets.length} ingressos</ThemedText>
            <ThemedText style={styles.summarySubtitle}>Toque em um ingresso para ver detalhes</ThemedText>
          </ThemedView>

          {/* Lista de Ingressos */}
          {userTickets.map(ticket => (
            <ThemedView key={ticket.id} style={styles.ticketCard}>
              <TouchableOpacity 
                style={styles.ticketHeader}
                onPress={() => handleViewEvent(ticket.eventId)}
              >
                <Image source={ticket.eventImage} style={styles.eventImage} />
                <ThemedView style={styles.eventInfo}>
                  <ThemedText style={styles.eventName}>{ticket.eventName}</ThemedText>
                  <ThemedText style={styles.eventDetails}>{ticket.eventDate}</ThemedText>
                  <ThemedText style={styles.eventDetails}>{ticket.eventLocation}</ThemedText>
                </ThemedView>
              </TouchableOpacity>

              <ThemedView style={styles.ticketDetails}>
                <ThemedView style={styles.ticketTypeContainer}>
                  <ThemedText style={styles.ticketTypeLabel}>Tipo:</ThemedText>
                  <ThemedText style={[
                    styles.ticketTypeValue,
                    ticket.type === 'VIP' && styles.vipType,
                    ticket.type === 'Meia' && styles.meiaType
                  ]}>
                    {ticket.type}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.ticketInfoRow}>
                  <ThemedText style={styles.ticketInfoLabel}>Valor:</ThemedText>
                  <ThemedText style={styles.ticketInfoValue}>
                    {ticket.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.ticketInfoRow}>
                  <ThemedText style={styles.ticketInfoLabel}>Comprado em:</ThemedText>
                  <ThemedText style={styles.ticketInfoValue}>{ticket.purchaseDate}</ThemedText>
                </ThemedView>

                <TouchableOpacity 
                  style={styles.qrCodeButton}
                  onPress={() => handleViewQRCode(ticket.id)}
                >
                  <IconSymbol name="qrcode" size={20} color="#007AFF" />
                  <ThemedText style={styles.qrCodeButtonText}>Visualizar QRCode</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ))}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#636366',
    marginTop: 4,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#636366',
  },
  ticketDetails: {
    padding: 16,
  },
  ticketTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTypeLabel: {
    fontSize: 16,
    color: '#636366',
    marginRight: 8,
  },
  ticketTypeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E5F0FF',
  },
  vipType: {
    color: '#FF9500',
    backgroundColor: '#FFF4E5',
  },
  meiaType: {
    color: '#34C759',
    backgroundColor: '#E5F9ED',
  },
  ticketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketInfoLabel: {
    fontSize: 14,
    color: '#636366',
  },
  ticketInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  qrCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F0FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  qrCodeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});