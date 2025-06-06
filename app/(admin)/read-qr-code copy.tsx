import { ThemedView } from '@/components/ThemedView';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Button, Modal, StyleSheet, View } from 'react-native';

export default function ReadQrCode() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
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
    setModalIsVisible(false);
    Alert.alert('QRCode', data);
    console.log(data);
  }

  return (
    <ThemedView style={styles.container}>
      <Button title='Ler QRCode' onPress={handleOpenCamera} />

      <Modal visible={modalIsVisible} style={{ flex: 1 }}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {},
});