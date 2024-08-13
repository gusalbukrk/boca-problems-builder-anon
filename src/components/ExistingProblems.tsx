import { faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import existingProblemsJson from '../assets/problems.json';
import { ExistingProblem, Source, createProblem } from '../shared';

// fix `Types of property 'examples' are incompatible. Type 'string[][]' is not comparable to type '[string, string][]'`
const existingProblems = existingProblemsJson as unknown as ExistingProblem[];

function ExistingProblems({
  setSelectedProblemID,
}: {
  setSelectedProblemID: (id: string) => void;
}) {
  return (
    <>
      <div className="mb-4dot5 d-flex align-items-center column-gap-3">
        <h2 className="mb-0 h4">Selecionar problema existente</h2>
        <span
          className="text-secondary fw-bold"
          title="Número total de problemas existentes"
        >
          {/* eslint-disable-next-line no-irregular-whitespace */}(
          {` ${existingProblems.length.toString()} `})
        </span>
      </div>
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Fonte</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {existingProblems.map((problem, i) => (
            <tr key={i}>
              <td>{problem.name}</td>
              <SourceTd problemSource={problem.source} />
              <td>
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setSelectedProblemID(problem.name); // using existing problem's name as ID
                  }}
                  title="Visualizar problema"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </td>
              <td>
                <button
                  className="btn btn-link"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={async () => {
                    await createProblem(problem);
                  }}
                  title="Selecionar problema"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SourceTd({ problemSource }: { problemSource: Source }) {
  const obiLevelName = ['júnior', '1', '2', 'sênior'];
  return (
    <td className="source-td">
      {problemSource.competition === 'MP-SBC' ? (
        <>
          <span title="Maratona SBC de Programação">
            {problemSource.competition}
          </span>
          <span>{problemSource.year.toString()}</span>
          <span>fase {problemSource.phase.toString()}</span>
          {problemSource.warmup && <span>warmup</span>}
          {/* <span title="Letra do problema">{problemSource.letter}</span> */}
        </>
      ) : (
        <>
          <span title="Olimpíada Brasileira de Informática">
            {problemSource.competition}
          </span>
          <span>{problemSource.year.toString()}</span>
          <span>fase {problemSource.phase.toString()}</span>
          <span>nível {obiLevelName[problemSource.level]}</span>
        </>
      )}
    </td>
  );
}

export default ExistingProblems;
