import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- ATENÇÃO: CONFIGURAÇÃO DA BASE_URL ---
// Substitua 'SEU_ENDERECO_IP_OU_DOMINIO' pelo endereço correto.
//
// Regras gerais:
// 1. Backend rodando localmente na sua máquina (ex: via `npm start`):
//    - No emulador Android: 'http://10.0.2.2:3000' (10.0.2.2 é o alias do localhost para emuladores Android)
//    - No simulador iOS ou Web: 'http://localhost:3000'
//    - Em um dispositivo físico: 'http://SEU_IP_NA_REDE_LOCAL:3000' (Ex: http://192.168.1.5:3000)
//      Para descobrir seu IP local no Windows, abra o CMD e digite `ipconfig`.
//      No macOS/Linux, abra o terminal e digite `ifconfig` ou `ip a`.
// 2. A porta '3000' é a porta que seu backend Node.js está ouvindo. Se for diferente, ajuste aqui.
// 3. Para produção: Será o domínio do seu servidor (ex: 'https://api.seusmarteventos.com').

const api = axios.create({
  baseURL: 'http://34.151.200.231:3000',
  timeout: 10000, // Tempo limite da requisição (10 segundos)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opcional: Adicionar um interceptor para enviar o token JWT em todas as requisições


api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;