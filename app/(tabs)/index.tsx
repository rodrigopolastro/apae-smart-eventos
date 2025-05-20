import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { Button, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.mainContainer}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>Tela Inicial</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText type='subtitle'>Acesse a tela com o leitor de QR Code pelo menu</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText style={styles.acessButtons}>Acessos</ThemedText>
        <ThemedView>
          <Button title='Realizar Login' onPress={() => router.push('/login')} />
          <Button title='Criar Conta' onPress={() => router.push('/login')} />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    flexDirection: 'column',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    height: '20%',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  registerButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  acessButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
});
