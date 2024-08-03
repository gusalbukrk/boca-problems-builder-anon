import { faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import existingProblemsJson from '../assets/problems.json';
import { ExistingProblem, createProblem } from '../shared';

// fix `Types of property 'examples' are incompatible. Type 'string[][]' is not comparable to type '[string, string][]'`
const existingProblems = existingProblemsJson as unknown as ExistingProblem[];

function SelectExistingProblem({
  setSelectedProblemID,
}: {
  setSelectedProblemID: (id: string) => void;
}) {
  return (
    <>
      <h2 className="h4 mb-4">Select existing problem</h2>
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Author</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {existingProblems.map((problem, i) => (
            <tr key={i}>
              <td>{problem.name}</td>
              <td>{problem.source.author}</td>
              <td>
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setSelectedProblemID(problem.name); // using existing problem's name as ID
                  }}
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

export default SelectExistingProblem;
