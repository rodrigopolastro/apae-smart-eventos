import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LocalTicket } from '../services/database'; // Importe a interface
import { ThemedText } from '@/components/ThemedText';

interface QRCodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  ticket: LocalTicket;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isVisible, onClose, ticket }) => {
  if (!ticket) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ThemedText style={styles.eventName}>{ticket.eventName}</ThemedText>
          <ThemedText style={styles.userName}>{ticket.userName}</ThemedText>
          <ThemedText style={styles.ticketType}>{ticket.ticketType}</ThemedText>
          
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={ticket.qrCodeId} // O dado do QR Code
              size={220}
              backgroundColor='white'
              color='black'
            />
          </View>
          
          <ThemedText style={styles.qrCodeIdText}>{ticket.qrCodeId}</ThemedText>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <ThemedText style={styles.closeButtonText}>Fechar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  qrCodeContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  qrCodeIdText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 25,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default QRCodeModal;