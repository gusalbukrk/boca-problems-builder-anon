import type { problem } from '../shared';

function Menu({
  problems,
  setSelectedComponent,
}: {
  problems: problem[];
  setSelectedComponent: (component: string) => void;
}) {
  return (
    <aside className="w-25 flex-shrink-0 p-4">
      <p className="fw-bold">Problems</p>
      {problems.length === 0 ? (
        <p>No problems yet.</p>
      ) : (
        problems.map((problem, i) => (
          <p key={i}>
            {problem.baseName} - {problem.fullName}
          </p>
        ))
      )}
      <hr />
      <p className="fw-bold">Actions</p>
      <button
        className="btn btn-link"
        style={{ textDecoration: 'none', fontSize: '1.2rem' }}
        onClick={() => {
          setSelectedComponent('create');
        }}
      >
        Create new problem
      </button>
      <button
        className="btn btn-link"
        style={{ textDecoration: 'none', fontSize: '1.2rem' }}
        onClick={() => {
          setSelectedComponent('select');
        }}
      >
        Select existing problem
      </button>
      <button
        className="btn btn-link"
        style={{ textDecoration: 'none', fontSize: '1.2rem' }}
        onClick={() => {
          setSelectedComponent('download');
        }}
      >
        Download problems
      </button>
    </aside>
  );
}

export default Menu;
