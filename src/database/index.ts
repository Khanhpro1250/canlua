import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import Vessel from './model/Vessel';

const adapter = new SQLiteAdapter({
  schema,
  // (Optional) Database name
  dbName: 'CanLuaDB',
  // (recommended) Use JSI if available (faster)
  jsi: true,
  // (Optional) Push sync data (if using sync)
  onSetUpError: error => {
    // Database failed to load -- offer the user to reload the app or log report
    console.error('Database setup error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [Vessel],
});
