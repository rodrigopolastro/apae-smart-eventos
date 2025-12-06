// Updated React Native TypeScript code with dropdown suggestions
import { ThemedText } from '@/components/ThemedText';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    ListRenderItemInfo,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';

interface ChatMessage {
  id: string;
  from: 'user' | 'bot' | 'bot-ui';
  text?: string;
  type?: 'suggestions';
}

export default function AdminScreen(): any {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', from: 'bot', text: 'Olá! Como posso ajudar com os insights dos eventos?' },
  ]);

  const [input, setInput] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const suggestions: string[] = [
    'Qual foi o evento que mais arrecadou?',
    'Quantas pessoas compareceram no último evento?',
    'Mostre o ranking de vendas por tipo de ingresso.',
  ];

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);

  const sendMessage = (): void => {
    if (!input.trim()) return;

    setShowSuggestions(false); // fecha dropdown ao enviar

    const userMessage: ChatMessage = { id: Date.now().toString(), from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    const botReply: ChatMessage = {
      id: (Date.now() + 1).toString(),
      from: 'bot',
      text: 'O evento que mais arrecadou fundos foi a "Festa Junina", tendo arrecadado, até o momento, R$1975,00' +
      ' com os 35 ingressos vendidos.'
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botReply]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    }, 500);

    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleSuggestion = (text: string): void => {
    setInput(text);
    setShowSuggestions(false);
  };

  const renderMessage = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    if (item.type === 'suggestions') return null; // não renderiza aqui mais

    const isUser = item.from === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    // <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 10}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <CustomHeader />

            <View style={styles.titleContainer}>
              <ThemedText style={styles.title}>Chat de Insights dos Eventos</ThemedText>
            </View>

            <View style={styles.chatContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </ScrollView>

          {/* Dropdown de Sugestões */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownToggle}
              onPress={() => setShowSuggestions(prev => !prev)}
            >
              <Text style={styles.dropdownToggleText}>Sugestões {showSuggestions ? '▼' : '▲'}</Text>
            </TouchableOpacity>

            {showSuggestions && (
              <View style={styles.suggestionDropdown}>
                {suggestions.map((s, idx) => (
                  <TouchableOpacity key={idx} onPress={() => handleSuggestion(s)} style={styles.suggestionButton}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Caixa de entrada */}
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Digite sua pergunta..."
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    // </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 20, paddingTop: 20 },
  titleContainer: { paddingHorizontal: 20, marginBottom: 10},
  title: { fontSize: 20, fontWeight: 'bold', color: 'black', width: '100%', textAlign: 'center' },
  chatContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 350,
  },
  messageList: { paddingBottom: 20 },
  messageBubble: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#EEE',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 14, color: '#333' },

  /* Dropdown */
  dropdownContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 5,
  },
  dropdownToggle: {
    paddingVertical: 8,
  },
  dropdownToggleText: {
    color: '#1E40AF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  suggestionDropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#EFF6FF',
  },
  suggestionButton: {
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  suggestionText: { color: '#1E3A8A' },

  /* Input */
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});
