import React from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

type TicketPdfModalProps = {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  pdfUri: string | null;
};

export const TicketPdfModal = ({
  isModalVisible,
  setIsModalVisible,
  pdfUri,
}: TicketPdfModalProps) => {
  const source = pdfUri ? { uri: pdfUri, cache: true } : null;

  return (
    <Modal animationType='slide' transparent={true} visible={isModalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Ticket Details</Text>

          <View style={styles.pdfViewerContainer}>
            {source ? (
              <Pdf
                source={source}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`PDF loaded with ${numberOfPages} pages from: ${filePath}`);
                }}
                onError={(error) => {
                  console.error('PDF Viewer Error:', error);
                  // Correção aqui: Converte o erro para string de forma segura
                  const errorMessage = typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? error.message : String(error));
                  Alert.alert('Erro no PDF', `Não foi possível exibir o PDF: ${errorMessage}`);
                }}
                enablePaging={true}
                style={styles.pdf}
              />
            ) : (
              <Text>No PDF available. Please ensure the ticket is saved locally.</Text>
            )}
          </View>

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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9,
    height: height * 0.8,
  },
  pdfViewerContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});