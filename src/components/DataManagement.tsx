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
      <h2 className="h4 mb-4dot5">Data management</h2>
      <div className="mb-4dot5">
        <h4 className="h5">Backup in JSON format</h4>
        <p className="mb-2 text-secondary fw-medium">
          For later editing or continuing on another computer
        </p>
        <div className="ps-4">
          <label htmlFor="upload" className="btn btn-link fw-medium">
            <FontAwesomeIcon
              icon={faFileArrowUp}
              className="me-3"
              style={{ fontSize: '1.25rem' }}
            />
            Upload
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
              Download
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4 dot5">
        <h4 className="h5">Export as BOCA-compatible ZIP files</h4>
        <p className="mb-2 text-secondary fw-medium">
          Problems packages ready to be used in programming competitions
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
              Download All
            </button>
            or download each problem individually
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
        Erase all data
      </button>
    </>
  );
}

export default DataManagement;
