// components/QrCodeScannerComponent.tsx

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Para o header do modal se quiser estilizar

interface QrCodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onQRCodeRead: (data: string) => void;
  // Opcional: para exibir a validação aqui ou deixar para a tela pai
  showValidation?: (isValid: boolean) => void;
}

export default function QrCodeScannerComponent({ isVisible, onClose, onQRCodeRead }: QrCodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const qrCodeLock = useRef(false); // Para evitar múltiplas leituras rapidamente

  // Efeito para solicitar permissão quando o modal se torna visível
  useEffect(() => {
    if (isVisible) {
      (async () => {
        try {
          const { granted } = await requestPermission();
          if (!granted) {
            Alert.alert('Câmera', 'Habilite o uso da câmera para ler o QR Code.', [
              { text: 'OK', onPress: onClose } // Fecha o modal se a permissão for negada
            ]);
          }
          qrCodeLock.current = false; // Resetar o lock ao abrir
        } catch (error) {
          console.error("Erro ao solicitar permissão da câmera:", error);
          onClose(); // Fechar em caso de erro
        }
      })();
    }
  }, [isVisible, requestPermission, onClose]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (data && !qrCodeLock.current) {
      qrCodeLock.current = true; // Bloqueia novas leituras
      onQRCodeRead(data); // Envia os dados para a função passada por prop
      onClose(); // Fecha o modal após a leitura
      // Opcional: Se quiser que a validação seja exibida aqui dentro do componente,
      // você precisaria de um estado local e lógica para o modal de validação.
      // Mas geralmente é melhor que a tela pai lide com a validação.
    }
  };

  if (!permission) {
    // Permissões de câmera estão carregando
    return (
      <Modal visible={isVisible} animationType="slide" transparent={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Verificando permissões da câmera...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    // Permissão não concedida, mas o alerta já foi mostrado pelo useEffect
    return null; // Não renderiza nada ou pode renderizar uma mensagem alternativa
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#007AFF', '#5DADE2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.modalHeader}
      >
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.modalHeaderText}>Escanear QR Code</Text>
      </LinearGradient>

      <CameraView
        style={styles.camera}
        facing='back'
        onBarcodeScanned={handleBarcodeScanned}
      >
        {/* Você pode adicionar um overlay ou um guia visual aqui se quiser */}
        <View style={styles.overlay}>
          <View style={styles.qrCodeFrame} />
        </View>
      </CameraView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // Fundo escuro para destacar o frame
  },
  qrCodeFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white', // Cor da moldura
    borderRadius: 10,
    backgroundColor: 'transparent',
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
});