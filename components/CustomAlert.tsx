import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText'; // Assumindo que ThemedText está no mesmo diretório

interface CustomAlertProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ visible, message, onClose }: CustomAlertProps) {
  return (
    <Modal
      transparent={true} // Torna o fundo do modal transparente
      animationType="fade" // Efeito de transição
      visible={visible} // Controla a visibilidade do modal
      onRequestClose={onClose} // Lida com o botão de voltar do Android
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <ThemedText style={styles.alertMessage}>{message}</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.alertButton}>
            <ThemedText style={styles.alertButtonText}>OK</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro semi-transparente
  },
  alertContainer: {
    width: '80%', // Largura do modal
    backgroundColor: '#fff', // Fundo branco do modal
    borderRadius: 10, // Cantos arredondados
    padding: 20, // Espaçamento interno
    alignItems: 'center', // Centraliza o conteúdo
    // Sombra para o modal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Para Android
  },
  alertMessage: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center', // Centraliza o texto da mensagem
  },
  alertButton: {
    backgroundColor: '#0066cc', // Cor de fundo do botão "OK"
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  alertButtonText: {
    color: '#fff', // Cor do texto do botão "OK"
    fontSize: 16,
    fontWeight: 'bold',
  },
});
