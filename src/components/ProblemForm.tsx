import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';

import existingProblems from '../assets/problems.json';
import db from '../db';
import { problem, createProblem } from '../shared';

function calcTextareaRows(str: string) {
  return (str.match(/\n/g) ?? []).length + 1;
}

function ProblemForm({
  selectedProblemID,
  readonly = false,
}: {
  selectedProblemID?: string;
  readonly?: boolean;
}) {
  const [baseName, setBaseName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [samples, setSamples] = useState<[string, string][]>([['', '']]);
  const baseNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (selectedProblemID !== undefined) {
        const problem =
          (await db.problems.get(selectedProblemID)) ??
          existingProblems.find(
            (problem) => problem.name === selectedProblemID,
          );

        if (problem !== undefined) {
          if ('baseName' in problem) setBaseName(problem.baseName);
          setFullName('fullName' in problem ? problem.fullName : problem.name);
          setAuthor(problem.author);
          setTimeLimit(problem.timeLimit);
          setDescription(problem.description);
          setSamples(problem.samples as [string, string][]);
        }
      }
    })();
  }, [selectedProblemID]);

  const updateProblem = async (problem: Omit<problem, 'id'>) => {
    // @ts-expect-error Argument of type 'Omit<problem, "id">' is not assignable to parameter of type ...
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await db.problems.update(selectedProblemID!, problem); // @ts
    // await db.problems.put({ id: selectedProblemID, ...problem });

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
      samples,
    };

    console.log('Problem:', problem);

    if (selectedProblemID === undefined) {
      await createProblem(problem);

      setBaseName('');
      setFullName('');
      setAuthor('');
      setTimeLimit(1);
      setDescription('');
      setSamples([['', '']]);
    } else {
      await updateProblem(problem);
    }

    baseNameInputRef.current?.focus();
    window.scroll({ top: 0 });
  };

  return (
    <>
      <h2 className="h4 mb-4">
        {selectedProblemID === undefined
          ? 'Create new problem'
          : readonly
            ? 'View problem'
            : 'Update problem'}
      </h2>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleClick}
        className="container mt-4"
      >
        <div className="mb-4">
          <label htmlFor="baseName" className="mb-1 fw-medium">
            Base Name
          </label>
          <input
            id="baseName"
            type="text"
            className="form-control"
            value={baseName}
            onChange={(e) => {
              setBaseName(e.target.value);
            }}
            ref={baseNameInputRef}
            readOnly={readonly}
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="fullName" className="mb-1 fw-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="form-control"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            readOnly={readonly}
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="author" className="mb-1 fw-medium">
            Author
          </label>
          <input
            id="author"
            type="text"
            className="form-control"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
            }}
            readOnly={readonly}
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="timeLimit" className="mb-1 fw-medium">
            Time Limit (in seconds)
          </label>
          <input
            id="timeLimit"
            type="number"
            className="form-control"
            value={timeLimit}
            onChange={(e) => {
              setTimeLimit(Number(e.target.value));
            }}
            min={1}
            readOnly={readonly}
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="mb-1 fw-medium">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            className="form-control"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            readOnly={readonly}
            // required
          />
        </div>
        <p className="mb-3 fw-medium">Samples</p>
        <div className="mb-4">
          {samples.map(([input, output], index) => (
            <div key={index} className="mb-3 row">
              <p className="col-1 mb-0 text-secondary fw-bold mt-1">
                {index + 1}
              </p>
              <div className="col">
                <textarea
                  rows={calcTextareaRows(input)}
                  className="form-control"
                  style={{ resize: 'none' }}
                  value={input}
                  onChange={(e) => {
                    const newSamples = [...samples];
                    newSamples[index][0] = e.target.value;
                    setSamples(newSamples);
                  }}
                  readOnly={readonly}
                  // required
                />
              </div>
              <div className="col">
                <textarea
                  rows={calcTextareaRows(output)}
                  className="form-control"
                  style={{ resize: 'none' }}
                  value={output}
                  onChange={(e) => {
                    const newSamples = [...samples];
                    newSamples[index][1] = e.target.value;
                    setSamples(newSamples);
                  }}
                  readOnly={readonly}
                  // required
                />
              </div>
              {!readonly && (
                <div className="col-1 text-center">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => {
                      const newSamples = samples.filter((_, i) => i !== index);
                      setSamples(newSamples);
                    }}
                    disabled={samples.length === 1}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!readonly && (
          <>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm mb-4"
              onClick={() => {
                setSamples([...samples, ['', '']]);
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add sample
            </button>
            <br />
            <button type="submit" className="btn btn-primary fw-medium">
              {selectedProblemID === undefined ? 'Create' : 'Update'}
            </button>
          </>
        )}
      </form>
    </>
  );
}

export default ProblemForm;
