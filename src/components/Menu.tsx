import {
  faPlus,
  faClone,
  faDownload,
  faBars,
  faMagnifyingGlass,
  faPenToSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { problem } from '../shared';

function Menu({
  problems,
  setSelectedComponent,
}: {
  problems: problem[];
  setSelectedComponent: (component: string) => void;
}) {
  return (
    <aside className="flex-shrink-0 p-4">
      <p className="fw-bold">Problems</p>
      {problems.length === 0 ? (
        <p>No problems yet.</p>
      ) : (
        <ul className="">
          {problems.map((problem, i) => (
            <li
              key={i}
              style={{ listStyleType: 'none' }}
              className="d-flex column-gap-3 align-items-center justify-content-between"
            >
              <span className="d-flex column-gap-3 align-items-center">
                <FontAwesomeIcon
                  icon={faBars}
                  // style={{ fontSize: '.9rem' }}
                  className="text-secondary"
                />
                <span>
                  <strong>{problem.baseName}</strong> – {problem.fullName}
                </span>
              </span>
              <span>
                <button className="btn btn-link btn-sm">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    // style={{ fontSize: '.9rem' }}
                  />
                </button>
                <button className="btn btn-link btn-sm">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    // style={{ fontSize: '.9rem' }}
                  />
                </button>
                <button className="btn btn-link btn-sm">
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    // style={{ fontSize: '.9rem' }}
                  />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <hr />
      <p className="fw-bold">Actions</p>
      <button
        className="btn btn-link d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.2rem' }}
        onClick={() => {
          setSelectedComponent('create');
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
        Create new problem
      </button>
      <button
        className="btn btn-link d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.2rem' }}
        onClick={() => {
          setSelectedComponent('select');
        }}
      >
        <FontAwesomeIcon icon={faClone} />
        Select existing problem
      </button>
      <button
        className="btn btn-link d-flex column-gap-3 align-items-center"
        style={{ textDecoration: 'none', fontSize: '1.2rem' }}
        onClick={() => {
          setSelectedComponent('download');
        }}
      >
        <FontAwesomeIcon icon={faDownload} />
        Download problems
      </button>
    </aside>
  );
}

export default Menu;
