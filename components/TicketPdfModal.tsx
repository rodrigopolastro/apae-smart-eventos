import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

type TicketPdfModalProps = {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  pdfBase64: string | null;
};

export const TicketPdfModal = ({
  isModalVisible,
  setIsModalVisible,
  pdfBase64,
}: TicketPdfModalProps) => {
  // const [pdfUri, setPdfUri] = React.useState<string | null>(null);
  // const reader = new FileReader();

  return (
    <Modal animationType='slide' transparent={true} visible={isModalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Hello World! testes</Text>
          (pdfBase64 ? <WebView source={{ uri: pdfBase64 }} /> : <Text>No PDF available</Text>)
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.textStyle}>Hide Modal</Text>
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
