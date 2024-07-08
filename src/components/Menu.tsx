import {
  faPlus,
  faClone,
  faDownload,
  faBars,
  faPenToSquare,
  faTrashCan,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLiveQuery } from 'dexie-react-hooks';

// import type { problem } from '../shared';
import db from '../db';

function Menu({
  setSelectedComponent,
  setSelectedProblemID,
}: {
  setSelectedComponent: (component: string) => void;
  setSelectedProblemID: (id: string) => void;
}) {
  const problems = useLiveQuery(() => db.problems.toArray()) ?? [];

  return (
    <aside className="flex-shrink-0 p-4">
      <p className="fw-bold">Problems</p>
      {problems.length === 0 ? (
        <p>No problems yet.</p>
      ) : (
        <ul className="">
          {problems.map((problem) => (
            <li
              key={problem.id}
              style={{ listStyleType: 'none' }}
              className="d-flex column-gap-3 align-items-center justify-content-between"
            >
              <span className="d-flex column-gap-3 align-items-center">
                <FontAwesomeIcon icon={faBars} className="text-secondary" />
                <span>
                  <strong>{problem.baseName}</strong> –{' '}
                  {problem.fullName.length <= 15
                    ? problem.fullName
                    : problem.fullName.slice(0, 15) + '...'}
                </span>
              </span>
              <span>
                <button className="btn btn-link btn-sm">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    onClick={() => {
                      setSelectedComponent('update');
                      setSelectedProblemID(problem.id);
                    }}
                  />
                </button>
                <button className="btn btn-link btn-sm">
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => {
                      await db.problems.delete(problem.id);
                    }}
                  />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <hr className="my-4" />
      <p className="fw-bold">Actions</p>
      <button
        className="btn btn-link d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.1rem' }}
        onClick={() => {
          setSelectedComponent('create');
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
        Create new problem
      </button>
      <button
        className="btn btn-link d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.1rem' }}
        onClick={() => {
          setSelectedComponent('select');
        }}
      >
        <FontAwesomeIcon icon={faClone} />
        Select existing problem
      </button>
      <button
        className="btn btn-link d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.1rem' }}
        onClick={() => {
          setSelectedComponent('download');
        }}
      >
        <FontAwesomeIcon icon={faDownload} />
        Download problems
      </button>
      <hr className="my-4" />
      <p
        className="btn btn-link ps-0 d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.1rem' }}
        onClick={() => {
          setSelectedComponent('instructions');
        }}
      >
        <FontAwesomeIcon icon={faTriangleExclamation} />
        Instructions
      </p>
    </aside>
  );
}

export default Menu;
