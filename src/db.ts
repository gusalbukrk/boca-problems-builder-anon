import Dexie, { type EntityTable } from 'dexie';

import { problem } from './shared';

const db = new Dexie('Database') as Dexie & {
  problems: EntityTable<
    problem,
    'id' // primary key "id" (for the typings only)
  >;
  miscellaneous: EntityTable<{ name: string; value: unknown }, 'name'>;
};

// Schema declaration:
db.version(1).stores({
  problems: 'id, baseName, fullName, author, timeLimit, description, samples', // primary key "id" (for the runtime!)
  miscellaneous: 'name',
});

if ((await db.miscellaneous.get({ name: 'problemsOrder' })) === undefined) {
  await db.miscellaneous.add({
    name: 'problemsOrder',
    value: [],
  });
}

export default db;
