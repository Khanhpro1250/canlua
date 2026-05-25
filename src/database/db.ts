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
  impurity: number;
  tareMode: number;
  bagsPerKg: number;
  kgPerBag: number;
  paidInFull: boolean;
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
      impurity REAL DEFAULT 0,
      tareMode INTEGER DEFAULT 0, -- 0: bags per kg, 1: kg per bag
      bagsPerKg INTEGER DEFAULT 8,
      kgPerBag REAL DEFAULT 0,
      paidInFull INTEGER DEFAULT 0, -- 0: false, 1: true
      dateStr TEXT,
      FOREIGN KEY (vesselId) REFERENCES vessels (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS weighing_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmerId INTEGER,
      weight REAL NOT NULL,
      recordIndex INTEGER NOT NULL,
      UNIQUE(farmerId, recordIndex),
      FOREIGN KEY (farmerId) REFERENCES farmers (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add columns if they don't exist
  try {
    await db.execAsync("ALTER TABLE farmers ADD COLUMN impurity REAL DEFAULT 0;");
  } catch (e) { /* Column already exists */ }

  try {
    await db.execAsync("ALTER TABLE farmers ADD COLUMN bagsPerKg INTEGER DEFAULT 8;");
  } catch (e) { /* Column already exists */ }

  try {
    await db.execAsync("ALTER TABLE farmers ADD COLUMN tareMode INTEGER DEFAULT 0;");
  } catch (e) { /* Column already exists */ }

  try {
    await db.execAsync("ALTER TABLE farmers ADD COLUMN kgPerBag REAL DEFAULT 0;");
  } catch (e) { /* Column already exists */ }

  try {
    await db.execAsync("ALTER TABLE farmers ADD COLUMN paidInFull INTEGER DEFAULT 0;");
  } catch (e) { /* Column already exists */ }

  // Clean up existing duplicates in weighing_records
  try {
    await db.execAsync(`
      DELETE FROM weighing_records
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM weighing_records
        GROUP BY farmerId, recordIndex
      );
    `);
  } catch (e) { console.error("Data cleanup failed", e); }

  return db;
};

export const getVessels = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<Vessel>('SELECT * FROM vessels ORDER BY id DESC');
};

const getCurrentDateStr = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
};

export const addVessel = async (name: string, phone: string) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const result = await db.runAsync(
    'INSERT INTO vessels (name, phone, weight, count, dateStr) VALUES (?, ?, ?, ?, ?)',
    [name, phone, 0, 0, getCurrentDateStr()]
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

export const updateFarmerName = async (id: number, name: string) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync('UPDATE farmers SET name = ? WHERE id = ?', [name, id]);
};

export const updateFarmerData = async (id: number, data: Partial<Farmer>) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const sets: string[] = [];
  const params: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id') {
      sets.push(`${key} = ?`);
      if (key === 'paidInFull') {
        params.push(value ? 1 : 0);
      } else {
        params.push(value);
      }
    }
  });

  if (sets.length === 0) return;

  params.push(id);
  await db.runAsync(
    `UPDATE farmers SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
};

export const addFarmer = async (farmer: Omit<Farmer, 'id'>) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const result = await db.runAsync(
    'INSERT INTO farmers (vesselId, name, goodsName, price, weight, count, deposit, paid, impurity, tareMode, bagsPerKg, kgPerBag, dateStr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      farmer.vesselId,
      farmer.name,
      farmer.goodsName,
      farmer.price,
      farmer.weight,
      farmer.count,
      farmer.deposit,
      farmer.paid,
      farmer.impurity || 0,
      farmer.tareMode || 0,
      farmer.bagsPerKg || 8,
      farmer.kgPerBag || 0,
      farmer.dateStr
    ]
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

// Weighing Records
export interface WeighingRecord {
  id: number;
  farmerId: number;
  weight: number;
  recordIndex: number;
}

export const getWeighingRecords = async (farmerId: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<WeighingRecord>(
    'SELECT * FROM weighing_records WHERE farmerId = ? ORDER BY recordIndex ASC',
    [farmerId]
  );
};

export const saveWeighingRecord = async (farmerId: number, weight: number, index: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);

  // Upsert logic: check if record at index exists
  const existing = await db.getFirstAsync<WeighingRecord>(
    'SELECT * FROM weighing_records WHERE farmerId = ? AND recordIndex = ?',
    [farmerId, index]
  );

  if (existing) {
    await db.runAsync(
      'UPDATE weighing_records SET weight = ? WHERE id = ?',
      [weight, existing.id]
    );
  } else {
    await db.runAsync(
      'INSERT INTO weighing_records (farmerId, weight, recordIndex) VALUES (?, ?, ?)',
      [farmerId, weight, index]
    );
  }

  // Update farmer totals
  await updateFarmerTotals(farmerId);
};

export const deleteWeighingRecord = async (farmerId: number, index: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync(
    'DELETE FROM weighing_records WHERE farmerId = ? AND recordIndex = ?',
    [farmerId, index]
  );
  await updateFarmerTotals(farmerId);
};

export const updateFarmerTotals = async (farmerId: number) => {
  const db = await SQLite.openDatabaseAsync(dbName);

  // 1. Get Sum and Count of individual records
  const data = await db.getFirstAsync<{totalWeight: number, totalCount: number}>(
    'SELECT SUM(weight) as totalWeight, COUNT(*) as totalCount FROM weighing_records WHERE farmerId = ?',
    [farmerId]
  );

  // 2. Get Farmer info to calculate Net Weight properly for persistence
  const farmer = await db.getFirstAsync<Farmer>(
    'SELECT impurity, bagsPerKg, kgPerBag, tareMode, vesselId FROM farmers WHERE id = ?',
    [farmerId]
  );

  if (data && farmer) {
    const grossWeight = data.totalWeight || 0;
    const count = data.totalCount || 0;
    const impurity = farmer.impurity || 0;
    const bagsPerKg = farmer.bagsPerKg || 8;
    const kgPerBag = farmer.kgPerBag || 0;
    const tareMode = farmer.tareMode || 0;

    let tare = 0;
    if (tareMode === 0) {
      tare = bagsPerKg > 0 ? count / bagsPerKg : 0;
    } else {
      tare = count * kgPerBag;
    }

    const netWeight = Math.max(0, grossWeight - tare - impurity);

    // IMPORTANT: We store the NET weight in the farmers table so the list view shows the right number
    await db.runAsync(
      'UPDATE farmers SET weight = ?, count = ? WHERE id = ?',
      [netWeight, count, farmerId]
    );

    // Update the vessel overall totals
    await updateVesselTotals(farmer.vesselId);
  }
};
