import { ThemedView } from '@/components/ThemedView';
import { AntDesign } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, View } from 'react-native';

export default function ReadQrCode() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [validationVisible, setValidationVisible] = useState(false);
  const qrCodeLock = useRef(false);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        return Alert.alert('Camera', 'Habilite o uso da camera');
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
      <Button title='Ler QRCode' onPress={handleOpenCamera} />

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

        <View style={styles.footer}>
          <Button title='Cancelar' onPress={() => setModalIsVisible(false)} />
        </View>
      </Modal>

      {/* Modal de validação */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
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