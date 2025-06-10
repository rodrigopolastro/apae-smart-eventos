import React from 'react';
import { Platform, View, Text, StyleSheet, ViewStyle } from 'react-native';

// Importar o componente Pdf de 'react-native-pdf' condicionalmente
// para evitar que o Metro Bundler tente empacotar módulos nativos para a web.
// Explicitamente tipamos como 'any' para lidar com a importação condicional e o require()
let PdfComponent: React.ComponentType<any> | null = null; // Mais específico do que apenas 'any'

if (Platform.OS !== 'web') {
  try {
    PdfComponent = require('react-native-pdf').default;
  } catch (e) {
    console.warn('react-native-pdf: Erro ao importar em plataforma nativa (isso não deveria acontecer, exceto em ambiente de build/testes).', e);
  }
}

interface PDFViewerProps {
  source: { uri: string };
  style?: ViewStyle;
  onError?: (error: any) => void;
  onLoadComplete?: (numberOfPages: number, filePath: string) => void;
  onPageChanged?: (page: number, numberOfPages: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ source, style, onError, onLoadComplete, onPageChanged }) => {
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={source.uri}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ddd',
          borderRadius: 5,
        }}
        title="Visualizador de PDF"
      >
        Seu navegador não suporta a visualização de PDFs.
        <a href={source.uri} download="document.pdf">Baixar PDF</a>
      </iframe>
    );
  }

  if (PdfComponent) {
    return (
      <PdfComponent
        source={source}
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        onError={onError}
        style={style}
      />
    );
  } else {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>Não foi possível carregar o visualizador de PDF.</Text>
        <Text style={styles.fallbackTextSmall}>Verifique a instalação de react-native-pdf e seu ambiente Expo.</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  fallbackText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  fallbackTextSmall: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PDFViewer;