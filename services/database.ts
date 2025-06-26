import * as SQLite from 'expo-sqlite';

// A importação padrão é a correta para esta abordagem.

export interface LocalTicket {
  ticketId: number;
  qrCodeId: string;
  eventName: string;
  eventLocation: string;
  eventDateTime: string;
  userName: string;
  ticketType: string;
  price: number;
  status: string;
  purchasedAt: string;
  userId: number;
}

// Abre o banco de dados de forma síncrona. A instância é criada imediatamente.
const db = SQLite.openDatabaseSync('apae-eventos.db');

// Função síncrona para inicializar o banco.
const initDatabase = () => {
  // execSync é a versão síncrona de execAsync.
  db.execSync(`
    PRAGMA journal_mode = WAL;
    DROP TABLE IF EXISTS tickets;
    CREATE TABLE tickets (
      ticketId INTEGER PRIMARY KEY NOT NULL,
      qrCodeId TEXT NOT NULL UNIQUE,
      eventName TEXT NOT NULL,
      eventLocation TEXT NOT NULL,
      eventDateTime TEXT NOT NULL,
      userName TEXT NOT NULL,
      ticketType TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL,
      purchasedAt TEXT NOT NULL,
      associateId INTEGER NOT NULL
    );
  `);
};

// Função síncrona para salvar os ingressos.
const saveTickets = (tickets: LocalTicket[]) => {
  // withTransactionSync garante a atomicidade da operação.
  db.withTransactionSync(() => {
    for (const ticket of tickets) {
      // runSync é a versão síncrona para INSERT, UPDATE, DELETE.
      db.runSync(
        `INSERT OR REPLACE INTO tickets (
          ticketId,
          qrCodeId,
          eventName,
          eventLocation,
          eventDateTime,
          userName,
          ticketType,
          price,
          status,
          purchasedAt,
          associateId
        ) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          ticket.ticketId,
          ticket.qrCodeId,
          ticket.eventName,
          ticket.eventLocation,
          ticket.eventDateTime,
          ticket.userName,
          ticket.ticketType,
          ticket.price,
          ticket.status,
          ticket.purchasedAt,
          ticket.userId,
        ]
      );
    }
  });
};

// Função síncrona para buscar os ingressos. Retorna o array diretamente.
const getLocalTickets = (associateId: number): LocalTicket[] => {
  // getAllSync é a versão síncrona para SELECTs.
  const allRows = db.getAllSync<LocalTicket>(
    'SELECT * FROM tickets WHERE associateId = ? ORDER BY eventDateTime DESC;',
    [associateId]
  );
  return allRows;
};

export const database = {
  initDatabase,
  saveTickets,
  getLocalTickets,
};
