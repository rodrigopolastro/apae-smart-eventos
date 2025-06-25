import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import formatDate from '../helpers/formatDate';

export default function TicketCard({
  ticket,
  handleViewQRCode,
  ticketStatus,
}: {
  ticket: any;
  handleViewQRCode: (ticket: any) => void;
  ticketStatus: string;
}) {
  const isUsed = ticket.status === 'Utilizado';

  if (ticket.status !== ticketStatus) return null;

  return (
    <View key={ticket.ticketId} style={[styles.ticketCard]}>
      <View style={[styles.ticketInfoContainer, isUsed && styles.ticketCardUsed]}>
        <Text style={[styles.eventName, isUsed && styles.usedText]}>
          {ticket.eventName} {isUsed ? '— INGRESSO JÁ USADO' : ''}
        </Text>
        <Text style={[styles.ticketType, isUsed && styles.usedText]}>{ticket.ticketType}</Text>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailText, isUsed && styles.usedText]}>{ticket.userName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailText, isUsed && styles.usedText]}>{ticket.eventLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailText, isUsed && styles.usedText]}>
            {formatDate(ticket.purchasedAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        // style={styles.qrCodeButton}
        onPress={() => handleViewQRCode(ticket)}
        // disabled={isUsed}
      >
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.qrCodeGradient}>
          <Text style={styles.qrCodeButtonText}>
            {isUsed ? 'Visualizar Ingresso Usado' : 'Gerar QR Code'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  ticketCardUsed: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  ticketInfoContainer: {
    padding: 20,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  qrCodeButton: {},
  qrCodeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  qrCodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  usedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
});
