import { faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import existingProblems from '../assets/problems.json';
import { createProblem } from '../shared';

function SelectExistingProblem({
  setSelectedProblemID,
}: {
  setSelectedProblemID: (id: string) => void;
}) {
  return (
    <>
      <h2 className="h4 mb-4">Select existing problem</h2>
      <table className="table table-hover">
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
              <td>{problem.author}</td>
              <td>
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setSelectedProblemID(problem.name);
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
                    const newProblem = {
                      baseName: problem.name.replace(/ /g, '-'),
                      fullName: problem.name,
                      author: problem.author,
                      timeLimit: problem.timeLimit,
                      description: problem.description,
                      samples: problem.samples as [string, string][],
                    };
                    await createProblem(newProblem);
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
