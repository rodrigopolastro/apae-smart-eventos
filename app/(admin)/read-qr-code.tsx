import { ThemedView } from '@/components/ThemedView';
import { AntDesign, Ionicons  } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Importar LinearGradient para o botão

// Importe o CustomHeader
import CustomHeader from '../../components/CustomHeaderLogin'; // Ajuste este caminho conforme sua estrutura de pastas

export default function ReadQrCode() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [validationVisible, setValidationVisible] = useState(false);
  const qrCodeLock = useRef(false);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        // Usar um modal personalizado ou um componente de mensagem em vez de Alert
        // para consistência com as instruções de desenvolvimento.
        // Por enquanto, mantendo Alert para demonstração, mas idealmente seria um modal.
        return Alert.alert('Câmera', 'Habilite o uso da câmera para ler o QR Code.');
      }
      setModalIsVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.log(error);
    }
  }

  function handleQRCodeRead(data: string) {
    qrCodeLock.current = true;
    setModalIsVisible(false);
    setValidationVisible(true);
    
    // Esconde a validação após 3 segundos
    setTimeout(() => {
      setValidationVisible(false);
      qrCodeLock.current = false;
    }, 3000);
    
    console.log(data);
  }

  return (
    <ThemedView style={styles.container}>
      {/* O ScrollView encapsula o cabeçalho e o conteúdo principal que rola */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Adicione o CustomHeader aqui */}
        <CustomHeader />

        {/* Wrapper para o conteúdo principal com padding para não ser coberto pelo cabeçalho */}
        <View style={styles.mainContentWrapper}>
          {/* Botão "Ler QRCode" com novo estilo */}
          <TouchableOpacity onPress={handleOpenCamera} style={styles.qrCodeButton}>
            <LinearGradient
              colors={['#007AFF', '#5DADE2']} // Cores do gradiente
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.qrCodeButtonGradient}
            >
              <Ionicons name="scan" size={24} color="white" />
              <Text style={styles.qrCodeButtonText}>Ler QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal da Câmera (fora do ScrollView para ser tela cheia) */}
      <Modal visible={modalIsVisible} transparent={false} animationType="slide">
        <CameraView
          style={{ flex: 1 }}
          facing='back'
          onBarcodeScanned={({ data }) => {
            if (data && !qrCodeLock.current) {
              setTimeout(() => handleQRCodeRead(data), 500);
            }
          }}
        />
        <View style={styles.cameraFooter}>
          <Button title='Cancelar' onPress={() => setModalIsVisible(false)} />
        </View>
      </Modal>

      {/* Modal de validação (fora do ScrollView para ser overlay) */}
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
    </ThemedView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Cor de fundo para o container principal
  },
  scrollContent: {
    flexGrow: 1, // Permite que o conteúdo do ScrollView cresça e centralize
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    paddingBottom: 40, // Espaço na parte inferior se houver rolagem
  },
  mainContentWrapper: {
    flex: 1, // Permite que o wrapper ocupe o espaço restante
    justifyContent: 'center', // Centraliza o botão dentro do wrapper
    alignItems: 'center',
    paddingTop: 75, // Empurra o conteúdo para baixo do cabeçalho
    paddingHorizontal: 20, // Padding lateral para o botão
    width: '100%', // Ocupa a largura total
  },
  // Novo estilo para o botão "Ler QRCode"
  qrCodeButton: {
    width: '80%', // Largura do botão
    borderRadius: 12,
    overflow: 'hidden', // Importante para o gradiente e sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  qrCodeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 12,
    gap: 10,
  },
  qrCodeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos para o footer da câmera (mantidos, mas renomeados para clareza)
  cameraFooter: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
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