import { nanoid } from 'nanoid';

import db from './db';

export interface problem {
  id: string;
  baseName: string;
  fullName: string;
  author: string;
  timeLimit: number;
  description: string;
  samples: [string, string][];
}

export const createProblem = async (problem: Omit<problem, 'id'>) => {
  const id = nanoid();

  await db.problems.add({
    id,
    ...problem,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const problemsOrder = (await db.miscellaneous.get({
    name: 'problemsOrder',
  }))!.value as string[];
  const problemsOrderUpdated = problemsOrder.concat(id);
  await db.miscellaneous.update('problemsOrder', {
    value: problemsOrderUpdated,
  });
};
