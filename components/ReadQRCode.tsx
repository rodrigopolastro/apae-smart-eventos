import { ThemedView } from '@/components/ThemedView';
import { AntDesign, Ionicons  } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import CustomHeader from '../components/CustomHeaderLogin';

export default function ReadQrCode() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  // 'validationVisible' não está sendo usada para o problema de múltiplas janelas
  const [validationVisible, setValidationVisible] = useState(false);
  const qrCodeLock = useRef(false); // Esta é a trava que vamos usar

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

  function handleQRCodeRead(data: string) {
    if (qrCodeLock.current) {
      return; // Se já está travado, sai da função para evitar múltiplas chamadas
    }
    qrCodeLock.current = true; // Trava o sistema para evitar novas leituras
    setModalIsVisible(false); // Fecha o modal da câmera
    //chama a requisicao "validateqrcode" da api e verifica se o retorno eh valido ou invalido
    Alert.alert('QR Code Lido', data, [
      {
        text: 'OK',
        onPress: () => {
          // Opcional: Você pode resetar a trava aqui se quiser que a câmera possa ser reaberta e ler outro QR Code
          // ou simplesmente permitir que ela seja resetada quando a câmera for aberta novamente
          qrCodeLock.current = false;
        },
      },
    ]);
    console.log(data);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader />
        <View style={styles.mainContentWrapper}>
          <TouchableOpacity onPress={handleOpenCamera} style={styles.qrCodeButton}>
            <LinearGradient
              colors={['#007AFF', '#5DADE2']}
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
    </ThemedView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  mainContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 75,
    paddingHorizontal: 20,
    width: '100%',
  },
  qrCodeButton: {
    width: '80%',
    borderRadius: 12,
    overflow: 'hidden',
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