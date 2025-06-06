import CustomHeader from '@/components/CustomHeaderIn'; // Importa o novo componente de cabeçalho
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';

const { width } = Dimensions.get('window');

// A altura fixa do cabeçalho não é mais usada para padding, pois ele rola com o conteúdo.
// A constante pode ser removida se não for usada em outro lugar.
// const FIXED_HEADER_HEIGHT = 160 + 20 + 75;

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardWidth = width * 0.85;
  const cardSpacing = 10;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('events/');
        setEvents(response.data);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };
    fetchEvents();
  }, []);

  const getEventCoverImage = (eventId: string): any => {
    // TODO: usar rota de imagem na nuvem. por enquanto, retorna uma imagem padrão
    // const imageUrl = await api.get(`events/${eventId}/imageUrl`);
    // move isso para um hook de imagem para conseguir reaproveitar em outros lugares

    return require('../../assets/images/festajunina.jpg');
  };

  const handleIngressoPress = () => {
    router.push('/meuingresso');
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: '/eventdescriptionlogado', params: { eventId: eventId } });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (cardWidth + cardSpacing));
    setActiveIndex(newIndex);
    setCurrentScrollX(contentOffsetX);
  };

  const scrollLeft = () => {
    if (scrollViewRef.current) {
      const newX = Math.max(0, currentScrollX - (cardWidth + cardSpacing));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  const scrollRight = () => {
    if (scrollViewRef.current) {
      const maxScrollX = events.length * (cardWidth + cardSpacing) - width + cardSpacing;
      const newX = Math.min(maxScrollX, currentScrollX + (cardWidth + cardSpacing));
      scrollViewRef.current.scrollTo({ x: newX, animated: true });
    }
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* ScrollView para todo o conteúdo, incluindo o cabeçalho */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* O novo componente de cabeçalho, agora rolável */}
          <CustomHeader onPress={handleIngressoPress} />

          {/* Corpo principal com azul mais claro - Agora dentro do ScrollView */}
          {/* Este ThemedView atua como o 'bodyContainer' do fluxo anterior,
              mas agora ele começa logo após o CustomHeader */}
          <ThemedView style={styles.bodyContentWrapper}>
            {/* Texto "Eventos APAE" com fundo amarelo */}
            <ThemedView style={styles.eventsApaeContainer}>
              <ThemedText style={styles.eventsApaeText}>Principais Eventos do Mês</ThemedText>
            </ThemedView>

            {/* Carrossel de Eventos (apenas os 3 primeiros) */}
            <ThemedView style={styles.carouselContainer}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsCarousel}
                snapToInterval={cardWidth + cardSpacing}
                decelerationRate='fast'
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {events.slice(0, 3).map(
                  (
                    event,
                    index // Mostra apenas os 3 primeiros eventos
                  ) => (
                    <TouchableOpacity
                      key={event.id}
                      style={[styles.eventCard, { marginRight: cardSpacing }]}
                      onPress={() => handleEventPress(event.id)}
                    >
                      <Image source={getEventCoverImage(event.id)} style={styles.eventImage} />
                      <ThemedText style={styles.eventCardTitle}>{event.name}</ThemedText>
                      <ThemedText style={styles.eventCardLocation}>{event.location}</ThemedText>
                      <ThemedText style={styles.eventCardDate}>{event.date_time}</ThemedText>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </ThemedView>

            {/* Pontos de Paginação */}
            <ThemedView style={styles.paginationDotsContainer}>
              {events.slice(0, 3).map(
                (
                  _,
                  index // Pontos apenas para os 3 primeiros eventos
                ) => (
                  <ThemedView
                    key={index}
                    style={[
                      styles.paginationDot,
                      activeIndex === index && styles.paginationDotActive,
                    ]}
                  />
                )
              )}
            </ThemedView>

            {/* Lista de Todos os Eventos (vertical) */}
            <ThemedView style={styles.allEventsListContainer}>
              <ThemedText style={styles.allEventsListTitle}>Todos os Eventos</ThemedText>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id + '-list'}
                  style={styles.listItemCard}
                  onPress={() => handleEventPress(event.id)}
                >
                  {/* <Image source={undefined} style={styles.listItemImage} /> */}
                  <ThemedView style={styles.listItemTextContent}>
                    <ThemedText style={styles.listItemTitle}>{event.name}</ThemedText>
                    <ThemedText style={styles.listItemLocation}>{event.location}</ThemedText>
                    <ThemedText style={styles.listItemDate}>{event.date_time}</ThemedText>
                    <ThemedText style={styles.listItemDescription}>{event.description}</ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    //backgroundColor:'#ADD8E6', // Cor de fundo principal
    backgroundColor: '#fff',
  },

  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Estilo para o ScrollView que conterá todo o conteúdo rolável
  scrollContent: {
    flex: 1,
    backgroundColor: 'transparent', // O fundo será o bodyContentWrapper
  },
  // Estilo para o contentContainerStyle do ScrollView
  scrollContentContainer: {
    // Removido paddingTop, pois o CustomHeader agora está dentro do fluxo e ocupa seu próprio espaço
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    paddingBottom: 40, // Adiciona um padding no final do scroll
    backgroundColor: 'transparent',
  },
  // Este wrapper agora contém o conteúdo que antes estava no bodyContainer
  bodyContentWrapper: {
    width: '100%', // Ocupa a largura total do ScrollView
    //alignItems: 'center',
    // backgroundColor: '#A0c8c3', // Cor de fundo do corpo
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderRadius: 30,
    // Removido position: 'absolute' e zIndex daqui, pois ele está no fluxo do ScrollView
    // Removido paddingTop, pois o CustomHeader já gerencia seu próprio espaço
    backgroundColor: 'transparent',
  },

  eventsApaeContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 3,
    marginTop: 10, // Espaçamento abaixo da área da logo
  },

  eventsApaeText: {
    // fontSize:22,
    // //fontWeight: 'bold',
    // color:'black',
    // textShadowColor: '#000', // Cor da sombra do texto (preto)
    // textShadowOffset: { width: 0, height: 0 }, // Deslocamento da sombra (2px para direita e 2px para baixo)
    // textShadowRadius: 2, // Raio de desfoque da sombra
    fontSize: 22,
    fontWeight: 'bold',
    //marginBottom: 15,
    color: '#333',
    textAlign: 'left',
  },

  carouselContainer: {
    //marginBottom: 20,
    width: '100%',
    //borderRadius:20,
    padding: 10,
    height: 300,
    // paddingTop:25,
    // backgroundColor: '#48a3a7',
    //backgroundColor: 'rgb(233, 252, 250)',
    backgroundColor: 'transparent',
  },

  carouselScrollView: {
    flex: 1,
    paddingHorizontal: (width - width * 0.85) / 2,
  },

  eventsCarousel: {
    paddingBottom: 20,
  },

  eventCard: {
    width: width * 0.85, // Largura do card principal
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    // borderWidth: 1,
    //borderColor: 'yellow',
    shadowColor: 'yellow', // Cor da sombra preta
    shadowOffset: { width: 0, height: 5 }, // Deslocamento maior para baixo
    shadowOpacity: 1, // Opacidade aumentada para 40%
    shadowRadius: 8, // Raio de desfoque maior
    elevation: 6, // Propriedade específica para Android, aumentada
  },

  eventImage: {
    width: '100%',
    height: 150, // Aumentado para dar mais destaque à imagem
    resizeMode: 'cover',
  },

  eventCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 10,
    color: '#333',
  },

  eventCardLocation: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    marginTop: 5,
  },

  eventCardDate: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginTop: 5,
  },

  paginationDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 20,
    padding: 5,
    backgroundColor: 'transparent',
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'yellow',
    marginHorizontal: 4,
  },

  paginationDotActive: {
    backgroundColor: '#006db2',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Estilos para a lista de todos os eventos
  allEventsListContainer: {
    width: '100%', // Largura da lista
    marginTop: 30, // Espaçamento acima da lista
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },

  allEventsListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'left',
  },

  listItemCard: {
    flexDirection: 'row', // Imagem ao lado do texto
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15, // Espaçamento entre os itens da lista
  },

  listItemImage: {
    width: 100, // Largura da imagem na lista
    height: 100, // Altura da imagem na lista
    resizeMode: 'cover',
    borderRadius: 8, // Cantos arredondados para a imagem
    margin: 10, // Margem interna
  },

  listItemTextContent: {
    flex: 1, // Ocupa o restante do espaço
    padding: 10,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  listItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  listItemLocation: {
    fontSize: 13,
    color: '#666',
  },

  listItemDate: {
    fontSize: 13,
    color: '#666',
  },

  listItemDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
