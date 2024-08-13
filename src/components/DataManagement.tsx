import {
  faFileArrowUp,
  faFileArrowDown,
  faFileZipper,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLiveQuery } from 'dexie-react-hooks';
import 'dexie-export-import';
import { saveAs } from 'file-saver';

import db from '../db';
import {
  UserProblem,
  generateProblemZip,
  generateAllProblemsZip,
  numberToLetter,
  getCurrentDateTime,
} from '../shared';

function DataManagement() {
  const problems = useLiveQuery(() => db.problems.toArray()) ?? [];
  const problemsOrder = (
    useLiveQuery(() => db.miscellaneous.get({ name: 'problemsOrder' })) ?? {
      value: [],
    }
  ).value as string[];
  const orderedProblems =
    problems.length === 0
      ? []
      : (problemsOrder.map((id) =>
          problems.find((problem) => problem.id === id),
        ) as UserProblem[]);

  return (
    <>
      <h2 className="h4 mb-4dot5">Gerenciamento de dados</h2>
      <div className="mb-4dot5">
        <h4 className="h5">Backup no formato JSON</h4>
        <p className="mb-2 text-secondary fw-medium">
          Para salvar cópia permanente ou continuar em outro computador
        </p>
        <div className="ps-4">
          <label htmlFor="upload" className="btn btn-link fw-medium">
            <FontAwesomeIcon
              icon={faFileArrowUp}
              className="me-3"
              style={{ fontSize: '1.25rem' }}
            />
            Importar
          </label>
          <input
            id="upload"
            type="file"
            accept="application/json"
            className="form-control form-control-sm"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={async (e) => {
              const json = e.target.files?.[0];

              if (json !== undefined) {
                await db.import(json, { overwriteValues: true });
              }
            }}
            hidden
          />
          <div>
            <button
              className="btn btn-link fw-medium"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={async () => {
                const blob = await db.export();
                saveAs(blob, `backup-${getCurrentDateTime()}.json`);
              }}
              disabled={problems.length === 0}
            >
              <FontAwesomeIcon
                icon={faFileArrowDown}
                className="me-3"
                style={{ fontSize: '1.25rem' }}
              />
              Exportar
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4 dot5">
        <h4 className="h5">Gerar os pacotes de problemas</h4>
        <p className="mb-2 text-secondary fw-medium">
          Pacotes de problemas prontos para serem usados no BOCA
        </p>
        <div className="ps-4">
          <p className="mb-1">
            <button
              className="btn btn-link fw-medium"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={async () => {
                await generateAllProblemsZip(orderedProblems);
              }}
              disabled={problems.length === 0}
            >
              <FontAwesomeIcon
                icon={faFileZipper}
                className="me-3"
                style={{ fontSize: '1.25rem' }}
              />
              Baixar todos
            </button>
            ou baixar cada problema individualmente
          </p>
          <ul className="ps-0" style={{ listStyle: 'none' }}>
            {orderedProblems.map((problem, index) => (
              <li key={problem.id}>
                <button
                  className="btn btn-link fw-medium"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={async () => {
                    await generateProblemZip(problem, index, true);
                  }}
                >
                  {numberToLetter(index)} – {problem.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        className="btn btn-link fw-medium"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          await db.delete();
          location.reload();
        }}
      >
        <FontAwesomeIcon
          icon={faTrashCan}
          className="me-3"
          style={{ fontSize: '1.25rem' }}
        />
        Deletar todos os dados
      </button>
    </>
  );
}

export default DataManagement;
