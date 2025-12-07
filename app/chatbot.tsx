import { ThemedText } from '@/components/ThemedText';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    ListRenderItemInfo,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';
import api from '../api';
import CustomHeader from '../components/CustomHeader';

interface ChatMessage {
  id: string;
  from: 'user' | 'bot' | 'bot-ui';
  text?: string;
}

export default function AdminScreen(): any {

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', from: 'bot', text: 'Olá! Como posso ajudar com os insights dos eventos?' },
  ]);

  const [input, setInput] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);

  /* ---------------------- FETCH SUGGESTIONS ON MOUNT ---------------------- */
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/chatbot/getQuestionSuggestions');

        const { suggestion1, suggestion2, suggestion3 } = res.data;
        console.log(JSON.stringify(res))

        setSuggestions([suggestion1, suggestion2, suggestion3]);
      } catch (err) {
        if (Platform.OS === 'android')
          ToastAndroid.show("Erro ao carregar sugestões", ToastAndroid.SHORT);
        else
          Alert.alert("Erro", "Erro ao carregar sugestões");
      }
    };

    fetchSuggestions();
  }, []);

  /* ---------------------- SEND QUESTION + BOT RESPONSE ---------------------- */
  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    setShowSuggestions(false);

    const question = input.trim();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: question
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Add temporary "typing" message
    const typingId = (Date.now() + 1).toString();
    const typingMessage: ChatMessage = {
      id: typingId,
      from: 'bot-ui',
      text: 'Digitando...'
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const res = await api.post('/chatbot/askQuestion', { question });

      const botAnswer = res.data.answer;

      // Remove typing message & add real bot answer
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: (Date.now() + 2).toString(), from: 'bot', text: botAnswer }
      ]);

    } catch (error) {
      // Remove typing message
      setMessages(prev => prev.filter(m => m.id !== typingId));

      if (Platform.OS === 'android')
        ToastAndroid.show("Erro ao enviar pergunta", ToastAndroid.SHORT);
      else
        Alert.alert("Erro", "Erro ao enviar pergunta");
    }

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  };

  /* ---------------------- SUGGESTION CLICK ---------------------- */
  const handleSuggestion = (text: string): void => {
    setInput(text);
    setShowSuggestions(false);
  };

  /* ---------------------- RENDER MESSAGE BUBBLES ---------------------- */
  const renderMessage = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    const isUser = item.from === 'user';
    const isTyping = item.from === 'bot-ui';

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
          isTyping && { opacity: 0.6 }
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  /* ---------------------- UI ---------------------- */
  return (
    <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 10}
    >
        <SafeAreaView style={styles.safeArea}>

            {/* Header */}
            <CustomHeader />

            {/* Title */}
            <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>Chat de Insights dos Eventos</ThemedText>
            </View>

            {/* CHAT LIST – this must be the ONLY scrollable container */}
            <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            style={styles.chatList}
            keyboardShouldPersistTaps="handled"
            />

            {/* Suggestions */}
            <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() => setShowSuggestions(prev => !prev)}
            >
                <Text style={styles.dropdownToggleText}>
                Sugestões {showSuggestions ? '▼' : '▲'}
                </Text>
            </TouchableOpacity>

            {showSuggestions && (
                <View style={styles.suggestionDropdown}>
                {suggestions.map((s, idx) => (
                    <TouchableOpacity
                    key={idx}
                    onPress={() => handleSuggestion(s)}
                    style={styles.suggestionButton}
                    >
                    <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                ))}
                </View>
            )}
            </View>

            {/* Input */}
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
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 20, paddingTop: 20 },
  titleContainer: { paddingHorizontal: 20, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'black', width: '100%', textAlign: 'center' },
  chatContainer: { paddingHorizontal: 20, marginBottom: 10, height: 350 },
  messageList: { paddingBottom: 20 },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
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

  dropdownContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 5,
  },
  dropdownToggle: { paddingVertical: 8 },
  dropdownToggleText: { color: '#1E40AF', fontWeight: 'bold', fontSize: 16 },
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
