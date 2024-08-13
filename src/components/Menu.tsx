import {
  faClone,
  faDownload,
  faBars,
  faPenToSquare,
  faTrashCan,
  faMagnifyingGlass,
  faSquarePlus,
  faGear,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLiveQuery } from 'dexie-react-hooks';
import { List, arrayMove, arrayRemove } from 'react-movable';

import db from '../db';
import { numberToLetter, UserProblem } from '../shared';

function Menu({
  setSelectedComponent,
  setSelectedProblemID,
}: {
  setSelectedComponent: (component: string) => void;
  setSelectedProblemID: (id: string) => void;
}) {
  return (
    <aside className="p-4" style={{ width: '35%' }}>
      {/* <p
        className="btn btn-link ps-0 d-flex column-gap-3 align-items-center"
        style={{ fontSize: '1.1rem' }}
        onClick={() => {
          setSelectedComponent('instructions');
        }}
      >
        <FontAwesomeIcon icon={faTriangleExclamation} />
        Instruções
      </p> */}
      <Problems
        setSelectedComponent={setSelectedComponent}
        setSelectedProblemID={setSelectedProblemID}
      />
      <hr className="my-4" />
      <h3 className="h6 fw-bold">Menu</h3>
      <div className="ps-4">
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0 mb-2"
          style={{ fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('contestSettings');
          }}
        >
          <FontAwesomeIcon icon={faGear} />
          Configurar competição
        </button>
        <p
          className="m-0 d-flex column-gap-3 align-items-center mb-2"
          style={{ fontSize: '1.1rem' }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Adicionar problema na competição
        </p>
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0"
          style={{ fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('create');
          }}
        >
          <span className="text-dark fw-bold text-secondary">└─</span>
          <FontAwesomeIcon icon={faSquarePlus} />
          Criar novo problema
        </button>
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0"
          style={{ fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('select');
          }}
        >
          <span className="text-dark fw-bold text-secondary">└─</span>
          <FontAwesomeIcon icon={faClone} />
          Selecionar problema existente
        </button>
        <button
          className="btn btn-link d-flex column-gap-3 align-items-center ps-0"
          style={{ fontSize: '1.1rem' }}
          onClick={() => {
            setSelectedComponent('dataManagement');
          }}
        >
          <FontAwesomeIcon icon={faDownload} />
          Gerenciamento de dados
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
  // ternary is needed because problems takes longer to load than problemsOrder (because it's larger)
  const orderedProblems =
    problems.length === 0
      ? []
      : (problemsOrder.map((id) =>
          problems.find((problem) => problem.id === id),
        ) as UserProblem[]);

  return (
    <>
      <h3 className="h6 fw-bold mt-3 mb-3">Problemas da competição</h3>
      {orderedProblems.length === 0 ? (
        <p className="mt-3">Nenhum problema foi adicionado.</p>
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
          renderItem={({ value: problem, props, index, isDragged }) => (
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
                <span title={problem.name}>
                  {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                  <strong>{numberToLetter(index!)}</strong> –{' '}
                  {problem.name.length <= 22
                    ? problem.name
                    : problem.name.slice(0, 22) + '...'}
                </span>
              </span>
              <span>
                <button className="btn btn-link" title="Visualizar problema">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    onClick={() => {
                      setSelectedComponent('view');
                      setSelectedProblemID(problem.id);
                    }}
                  />
                </button>
                <button className="btn btn-link" title="Editar problema">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    onClick={() => {
                      setSelectedComponent('update');
                      setSelectedProblemID(problem.id);
                    }}
                  />
                </button>
                <button className="btn btn-link" title="Deletar problema">
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
