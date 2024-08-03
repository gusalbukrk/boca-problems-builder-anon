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
  problems: 'id, name, description', // primary key "id" (for the runtime!)
  miscellaneous: 'name',
});

if ((await db.miscellaneous.get({ name: 'problemsOrder' })) === undefined) {
  await db.miscellaneous.add({
    name: 'problemsOrder',
    value: [],
  });
}

if ((await db.miscellaneous.get({ name: 'contestName' })) === undefined) {
  await db.miscellaneous.add({
    name: 'contestName',
    value: '',
  });
}

if ((await db.miscellaneous.get({ name: 'logo' })) === undefined) {
  await db.miscellaneous.add({
    name: 'logo',
    value: '',
  });
}

export default db;
