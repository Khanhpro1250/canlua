import * as SQLite from 'expo-sqlite';

const dbName = 'canlua.db';

export interface Vessel {
  id: number;
  name: string;
  phone: string;
  weight: number;
  count: number;
  dateStr: string;
}

export interface Farmer {
  id: number;
  vesselId: number;
  name: string;
  goodsName: string;
  price: number;
  weight: number;
  count: number;
  deposit: number;
  paid: number;
  dateStr: string;
}

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS vessels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      weight REAL DEFAULT 0,
      count INTEGER DEFAULT 0,
      dateStr TEXT
    );
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vesselId INTEGER,
      name TEXT NOT NULL,
      goodsName TEXT,
      price REAL DEFAULT 0,
      weight REAL DEFAULT 0,
      count INTEGER DEFAULT 0,
      deposit REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      dateStr TEXT,
      FOREIGN KEY (vesselId) REFERENCES vessels (id) ON DELETE CASCADE
    );
  `);

  return db;
};

export const getVessels = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<Vessel>('SELECT * FROM vessels ORDER BY id DESC');
};

export const addVessel = async (name: string, phone: string) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const result = await db.runAsync(
    'INSERT INTO vessels (name, phone, weight, count, dateStr) VALUES (?, ?, ?, ?, ?)',
    [name, phone, 0, 0, '23/05']
  );
  return result.lastInsertRowId;
};

export const updateVessel = async (id: number, name: string, phone: string) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync(
    'UPDATE vessels SET name = ?, phone = ? WHERE id = ?',
    [name, phone, id]
  );
};

export const deleteVessel = async (id: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync('DELETE FROM vessels WHERE id = ?', [id]);
};

// Farmer related functions
export const getFarmersByVessel = async (vesselId: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<Farmer>('SELECT * FROM farmers WHERE vesselId = ? ORDER BY id DESC', [vesselId]);
};

export const deleteFarmer = async (farmer: Farmer) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync('DELETE FROM farmers WHERE id = ?', [farmer.id]);

  // Update vessel totals after deletion
  await updateVesselTotals(farmer.vesselId);
};

export const addFarmer = async (farmer: Omit<Farmer, 'id'>) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const result = await db.runAsync(
    'INSERT INTO farmers (vesselId, name, goodsName, price, weight, count, deposit, paid, dateStr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [farmer.vesselId, farmer.name, farmer.goodsName, farmer.price, farmer.weight, farmer.count, farmer.deposit, farmer.paid, farmer.dateStr]
  );

  // Update vessel totals
  await updateVesselTotals(farmer.vesselId);

  return result.lastInsertRowId;
};

export const updateVesselTotals = async (vesselId: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const totals = await db.getFirstAsync<{totalWeight: number, totalCount: number}>(
    'SELECT SUM(weight) as totalWeight, SUM(count) as totalCount FROM farmers WHERE vesselId = ?',
    [vesselId]
  );

  if (totals) {
    await db.runAsync(
      'UPDATE vessels SET weight = ?, count = ? WHERE id = ?',
      [totals.totalWeight || 0, totals.totalCount || 0, vesselId]
    );
  }
};
