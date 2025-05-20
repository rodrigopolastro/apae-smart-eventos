import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>Tela Inicial</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText type='subtitle'>Acesse a tela com o leitor de QR Code pelo menu</ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
