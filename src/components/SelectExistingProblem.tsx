import existingProblems from '../assets/problems.json';

function SelectExistingProblem() {
  return (
    <>
      <h3 className="mb-4">Select existing problem</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Base Name</th>
            <th>Full Name</th>
            <th>Author</th>
            <th>Time Limit</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {existingProblems.map((problem, i) => (
            <tr key={i}>
              <td>{problem.baseName}</td>
              <td>{problem.fullName}</td>
              <td>{problem.author}</td>
              <td>{problem.timeLimit}</td>
              <td>{problem.description.substring(0, 25)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default SelectExistingProblem;
