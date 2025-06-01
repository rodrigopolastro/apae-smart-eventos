import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useState } from 'react';
import CustomHeader from '@/components/CustomHeaderIn'; // Importa o novo componente de cabeçalho

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

  // Dados mockados para os eventos do carrossel e lista
  const events = [
    {
      id: '1',
      image: require('../../assets/images/festajunina.jpg'), // Imagem para o primeiro card (O Jardim do Inimigo)
      title: 'O Jardim do Inimigo 25 anos',
      location: 'Fortaleza',
      date: '12 Set. a 13 Set.',
      description: 'Uma peça teatral emocionante e aclamada, celebrando 25 anos de sucesso. Uma experiência única para os amantes da arte e do teatro. Não perca!',
    },
    {
      id: '2',
      image: require('../../assets/images/festajunina.jpg'), // Imagem de exemplo do ExpoEcomm
      title: 'ExpoEcomm 2025',
      location: 'São Paulo - SP',
      date: '15 Ago. a 16 Ago.',
      description: 'A maior feira de e-commerce e marketing digital do Brasil. Networking, palestras com especialistas e as últimas tendências do mercado.',
    },
    {
      id: '3',
      image: require('../../assets/images/festajunina.jpg'), // Imagem de exemplo do Submarino (Conferência de IA)
      title: 'Conferência de IA',
      location: 'Rio de Janeiro - RJ',
      date: 'Quarta-feira, 20 Nov. • 10h',
      description: 'Explore o futuro da inteligência artificial com líderes e inovadores da indústria. Palestras, workshops e demonstrações de tecnologias emergentes.',
    },
    {
      id: '4',
      image: require('../../assets/images/festajunina.jpg'), // Mantendo festajunina se existir
      title: 'Festa Junina APAE',
      location: 'APAE Local',
      date: 'Terça-feira, 14 Jun. • 13h',
      description: 'Celebre a tradicional Festa Junina da APAE com muita música, dança e comidas típicas. Um evento para toda a família e para apoiar uma causa nobre.',
    },
    {
      id: '5',
      image: require('../../assets/images/festajunina.jpg'), // Mantendo placeholder se existir
      title: 'Conferência de Dados',
      location: 'Belo Horizonte - MG',
      date: 'Terça-feira, 03 Dez. • 14h',
      description: 'Imersão no mundo dos dados, analytics e big data. Aprenda com os melhores profissionais e descubra como a análise de dados pode transformar negócios.',
    },
  ];

  const handleIngressoPress = () => {
    router.push('/meuingresso');
  };

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: '/eventdescription', params: { eventId: eventId } });
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
      const maxScrollX = (events.length * (cardWidth + cardSpacing)) - width + cardSpacing;
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
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {events.slice(0, 3).map((event, index) => ( // Mostra apenas os 3 primeiros eventos
                  <TouchableOpacity key={event.id} style={[styles.eventCard, { marginRight: cardSpacing }]} onPress={() => handleEventPress(event.id)}>
                    <Image source={event.image} style={styles.eventImage} />
                    <ThemedText style={styles.eventCardTitle}>{event.title}</ThemedText>
                    <ThemedText style={styles.eventCardLocation}>{event.location}</ThemedText>
                    <ThemedText style={styles.eventCardDate}>{event.date}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>

            {/* Pontos de Paginação */}
            <ThemedView style={styles.paginationDotsContainer}>
              {events.slice(0, 3).map((_, index) => ( // Pontos apenas para os 3 primeiros eventos
                <ThemedView
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </ThemedView>

            {/* Lista de Todos os Eventos (vertical) */}
            <ThemedView style={styles.allEventsListContainer}>
              <ThemedText style={styles.allEventsListTitle}>Todos os Eventos</ThemedText>
              {events.map(event => (
                <TouchableOpacity key={event.id + '-list'} style={styles.listItemCard} onPress={() => handleEventPress(event.id)}>
                  <Image source={event.image} style={styles.listItemImage} />
                  <ThemedView style={styles.listItemTextContent}>
                    <ThemedText style={styles.listItemTitle}>{event.title}</ThemedText>
                    <ThemedText style={styles.listItemLocation}>{event.location}</ThemedText>
                    <ThemedText style={styles.listItemDate}>{event.date}</ThemedText>
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
    backgroundColor: '#fff'
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
    borderRadius:30,
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
    height:300,
   // paddingTop:25,
   // backgroundColor: '#48a3a7',
   //backgroundColor: 'rgb(233, 252, 250)',
   backgroundColor: 'transparent'
   
    // shadowColor: '#000', // Cor da sombra preta
    // shadowOffset: { width: 0, height: 5 }, // Deslocamento maior para baixo
    // shadowOpacity: 1, // Opacidade aumentada para 40%
    // shadowRadius: 10, // Raio de desfoque maior
    // elevation: 10, // Propriedade específica para Android, aumentada
    
  },
  carouselScrollView: {
    flex: 1,
    paddingHorizontal: (width - (width * 0.85)) / 2,
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
    borderRadius:20,
    padding:5,
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
