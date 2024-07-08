import Dexie, { type EntityTable } from 'dexie';

import { problem } from './shared';

const db = new Dexie('Database') as Dexie & {
  problems: EntityTable<
    problem,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  problems:
    'id, baseName, fullName, author, timeLimit, description, input, output', // primary key "id" (for the runtime!)
});

export default db;
