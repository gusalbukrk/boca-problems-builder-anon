import {
  faPlus,
  faClone,
  faDownload,
  faBars,
  faPenToSquare,
  faTrashCan,
  faTriangleExclamation,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLiveQuery } from 'dexie-react-hooks';
import { List, arrayMove, arrayRemove } from 'react-movable';

import db from '../db';

import type { problem } from '../shared';

function Menu({
  setSelectedComponent,
  setSelectedProblemID,
}: {
  setSelectedComponent: (component: string) => void;
  setSelectedProblemID: (id: string) => void;
}) {
  return (
    <aside className="flex-shrink-0 p-4">
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
      <hr className="my-4" />
      <Problems
        setSelectedComponent={setSelectedComponent}
        setSelectedProblemID={setSelectedProblemID}
      />
      <hr className="my-4" />
      <h3 className="h6 fw-bold">Actions</h3>
      <div className="ps-4">
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0"
          style={{ textDecoration: 'none', fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('create');
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create new problem
        </button>
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0"
          style={{ textDecoration: 'none', fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('select');
          }}
        >
          <FontAwesomeIcon icon={faClone} />
          Select existing problem
        </button>
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0"
          style={{ textDecoration: 'none', fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('download');
          }}
        >
          <FontAwesomeIcon icon={faDownload} />
          Download problems
        </button>
      </div>
    </aside>
  );
}

function Problems({
  setSelectedComponent,
  setSelectedProblemID,
}: {
  setSelectedComponent: (component: string) => void;
  setSelectedProblemID: (id: string) => void;
}) {
  // `useLiveQuery` is used to observe IndexedDB data in a React component, it makes the component
  // re-render when the observed data changes; the data is not loaded immediately at the first
  // rendering, but the component will re-render when the data is loaded
  const problems = useLiveQuery(() => db.problems.toArray()) ?? [];
  const problemsOrder = (
    useLiveQuery(() => db.miscellaneous.get({ name: 'problemsOrder' })) ?? {
      value: [],
    }
  ).value as string[];
  const orderedProblems = problemsOrder.map((id) =>
    problems.find((problem) => problem.id === id),
  ) as problem[];

  return (
    <>
      <h3 className="h6 fw-bold">Problems</h3>
      {orderedProblems.length === 0 ? (
        <p className="mt-3">No problems yet.</p>
      ) : (
        <List
          values={orderedProblems}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={async ({ oldIndex, newIndex }) => {
            await db.miscellaneous.update('problemsOrder', {
              value: arrayMove(problemsOrder, oldIndex, newIndex),
            });
          }}
          renderList={({ children, props }) => (
            <ul {...props} className="ps-4">
              {children}
            </ul>
          )}
          renderItem={({ value: problem, props, isDragged }) => (
            // must not use spread to assign `key`, otherwise
            // `Warning: A props object containing a "key" prop is being spread into JSX`
            <li
              {...props}
              // eslint-disable-next-line react/prop-types
              key={props.key}
              // eslint-disable-next-line react/prop-types
              style={{ ...props.style, listStyleType: 'none' }}
              className="d-flex column-gap-3 align-items-center justify-content-between"
            >
              <span className="d-flex column-gap-3 align-items-center">
                <FontAwesomeIcon
                  icon={faBars}
                  className="text-secondary"
                  style={{ cursor: isDragged ? 'grabbing' : 'grab' }}
                  data-movable-handle
                />
                <span>
                  <strong>{problem.baseName}</strong> –{' '}
                  {problem.fullName.length <= 15
                    ? problem.fullName
                    : problem.fullName.slice(0, 15) + '...'}
                </span>
              </span>
              <span>
                <button className="btn btn-link">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    onClick={() => {
                      setSelectedComponent('view');
                      setSelectedProblemID(problem.id);
                    }}
                  />
                </button>
                <button className="btn btn-link">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    onClick={() => {
                      setSelectedComponent('update');
                      setSelectedProblemID(problem.id);
                    }}
                  />
                </button>
                <button className="btn btn-link">
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => {
                      await db.miscellaneous.update('problemsOrder', {
                        value: arrayRemove(
                          problemsOrder,
                          problemsOrder.findIndex(
                            (problemId) => problemId === problem.id,
                          ),
                        ),
                      });
                      await db.problems.delete(problem.id);
                    }}
                  />
                </button>
              </span>
            </li>
          )}
        />
      )}
    </>
  );
}

export default Menu;
