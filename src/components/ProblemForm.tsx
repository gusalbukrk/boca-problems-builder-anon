import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';

import db from '../db';
import { problem } from '../shared';

function ProblemForm({ selectedProblemID }: { selectedProblemID?: string }) {
  const [baseName, setBaseName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const baseNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (selectedProblemID !== undefined) {
        const problem = await db.problems.get(selectedProblemID);
        if (problem !== undefined) {
          setBaseName(problem.baseName);
          setFullName(problem.fullName);
          setAuthor(problem.author);
          setTimeLimit(problem.timeLimit);
          setDescription(problem.description);
          setInput(problem.input);
          setOutput(problem.output);
        }
      }
    })();
  }, [selectedProblemID]);

  const createProblem = async (problem: Omit<problem, 'id'>) => {
    await db.problems.add({
      id: nanoid(),
      ...problem,
    });

    setBaseName('');
    setFullName('');
    setAuthor('');
    setTimeLimit(1);
    setDescription('');
    setInput('');
    setOutput('');
  };

  const updateProblem = async (problem: Omit<problem, 'id'>) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await db.problems.update(selectedProblemID!, problem);

    baseNameInputRef.current?.focus();
    window.scroll({ top: 0 });
  };

  const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const problem = {
      baseName,
      fullName,
      author,
      timeLimit,
      description,
      input,
      output,
    };

    console.log('Problem:', problem);

    selectedProblemID === undefined
      ? await createProblem(problem)
      : await updateProblem(problem);

    baseNameInputRef.current?.focus();
    window.scroll({ top: 0 });
  };

  return (
    <>
      <h3 className="mb-4">
        {selectedProblemID === undefined
          ? 'Create new problem'
          : 'Update problem'}
      </h3>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleClick}
        className="container mt-4"
      >
        <div className="form-group mb-4">
          <label className="mb-2">Base Name</label>
          <input
            type="text"
            className="form-control"
            value={baseName}
            onChange={(e) => {
              setBaseName(e.target.value);
            }}
            ref={baseNameInputRef}
            // required
          />
        </div>
        <div className="form-group mb-4">
          <label className="mb-2">Full Name</label>
          <input
            type="text"
            className="form-control"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            // required
          />
        </div>
        <div className="form-group mb-4">
          <label className="mb-2">Author</label>
          <input
            type="text"
            className="form-control"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
            }}
            // required
          />
        </div>
        <div className="form-group mb-4">
          <label className="mb-2">Time Limit (in seconds)</label>
          <input
            type="number"
            className="form-control"
            value={timeLimit}
            onChange={(e) => {
              setTimeLimit(Number(e.target.value));
            }}
            min={1}
            // required
          />
        </div>
        <div className="form-group mb-4">
          <label className="mb-2">Description</label>
          <textarea
            rows={5}
            className="form-control"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            // required
          />
        </div>
        <div className="form-group mb-4">
          <label className="mb-2">Input</label>
          <textarea
            rows={3}
            className="form-control"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            // required
          />
        </div>
        <div className="form-group mb-4">
          <label className="mb-2">Output</label>
          <textarea
            rows={3}
            className="form-control"
            value={output}
            onChange={(e) => {
              setOutput(e.target.value);
            }}
            // required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {selectedProblemID === undefined ? 'Create' : 'Update'}
        </button>
      </form>
    </>
  );
}

export default ProblemForm;
