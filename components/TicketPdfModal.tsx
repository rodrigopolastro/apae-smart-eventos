import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '@/components/ThemedText';
type TicketPdfModalProps = {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  fileUri: string | null;
};

export const TicketPdfModal = ({
  isModalVisible,
  setIsModalVisible,
  fileUri,
}: TicketPdfModalProps) => {
  // const [pdfUri, setPdfUri] = React.useState<string | null>(null);
  // const reader = new FileReader();

  if (!fileUri || fileUri === '') {
    return null;
  }

  return (
    <Modal animationType='slide' transparent={true} visible={isModalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ThemedText style={styles.modalText}>{fileUri}</ThemedText>
          <WebView source={{ uri: fileUri }} />
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={() => setIsModalVisible(false)}
          >
            <ThemedText style={styles.textStyle}>Hide Modal</ThemedText>
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
  },
  modalView: {
    margin: 20,
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
