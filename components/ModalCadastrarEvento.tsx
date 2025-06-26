import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Tipagem do objeto de evento
interface EventData {
  title: string;
  description: string;
  date: string;
  location: string;
  priceStandard: string;
  pricePlus: string;
  priceVip: string;
}

// Props do componente
interface ModalCadastrarEventoProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  eventData: EventData;
  handleInputChange: (field: keyof EventData, value: string) => void;
  handleSubmit: () => void;
  styles: Styles;
}

export default function ModalCadastrarEvento({
  modalVisible,
  setModalVisible,
  eventData,
  handleInputChange,
  handleSubmit,
  styles,
}: ModalCadastrarEventoProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      handleInputChange('date', selectedDate.toISOString());
    }
    setShowDatePicker(Platform.OS === 'ios');
  };

  return (
    <Modal
      animationType='slide'
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#007AFF', '#5DADE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.modalHeader}
        >
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
            <Ionicons name='close' size={28} color='white' />
          </TouchableOpacity>
          <Text style={styles.modalHeaderText}>Criar Novo Evento</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Título do Evento</Text>
            <TextInput
              style={styles.input}
              placeholder='Nome do Evento'
              value={eventData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Detalhes completos do evento'
              multiline
              value={eventData.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Data e Hora</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>
                {eventData.date
                  ? new Date(eventData.date).toLocaleString()
                  : 'Selecionar Data e Hora'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={eventData.date ? new Date(eventData.date) : new Date()}
                mode='datetime'
                display='default'
                onChange={onDateChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Localização</Text>
            <TextInput
              style={styles.input}
              placeholder='Ex: Goiânia - GO'
              value={eventData.location}
              onChangeText={(text) => handleInputChange('location', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preço Padrão (R$)</Text>
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              placeholder='Ex: 50.00'
              value={eventData.priceStandard}
              onChangeText={(text) => handleInputChange('priceStandard', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preço Plus (R$)</Text>
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              placeholder='Ex: 80.00'
              value={eventData.pricePlus}
              onChangeText={(text) => handleInputChange('pricePlus', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preço VIP (R$)</Text>
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              placeholder='Ex: 120.00'
              value={eventData.priceVip}
              onChangeText={(text) => handleInputChange('priceVip', text)}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Cadastrar Evento</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  formContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
