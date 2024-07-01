import React, { useState } from 'react';
import { problem } from '../shared';

function ProblemForm({ addProblem }: { addProblem: (problem: problem) => void }) {
  const [baseName, setBaseName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    console.log('Form data:', problem);
    addProblem(problem);
  };

  return (
    <>
    <h3 className="mb-4">Create new problem</h3>
    <form onSubmit={handleSubmit} className="container mt-4">
      <div className="form-group mb-4">
        <label className="mb-2">Base Name</label>
        <input
          type="text"
          className="form-control"
          value={baseName}
          onChange={(e) => { setBaseName(e.target.value); }}
          // required
        />
      </div>
      <div className="form-group mb-4">
        <label className="mb-2">Full Name</label>
        <input
          type="text"
          className="form-control"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); }}
          // required
        />
      </div>
      <div className="form-group mb-4">
        <label className="mb-2">Author</label>
        <input
          type="text"
          className="form-control"
          value={author}
          onChange={(e) => { setAuthor(e.target.value); }}
          // required
        />
      </div>
      <div className="form-group mb-4">
        <label className="mb-2">Time Limit (in seconds)</label>
        <input
          type="number"
          className="form-control"
          value={timeLimit}
          onChange={(e) => { setTimeLimit(Number(e.target.value)); }}
          // required
        />
      </div>
      <div className="form-group mb-4">
        <label className="mb-2">Description</label>
        <textarea
          rows={5}
          className="form-control"
          value={description}
          onChange={(e) => { setDescription(e.target.value); }}
          // required
        />
      </div>
      <div className="form-group mb-4">
        <label className="mb-2">Input</label>
        <textarea
          rows={3}
          className="form-control"
          value={input}
          onChange={(e) => { setInput(e.target.value); }}
          // required
        />
      </div>
      <div className="form-group mb-4">
        <label className="mb-2">Output</label>
        <textarea
          rows={3}
          className="form-control"
          value={output}
          onChange={(e) => { setOutput(e.target.value); }}
          // required
        />
      </div>
      <button type="submit" className="btn btn-primary">Create</button>
    </form>
  </>
  );
}

export default ProblemForm;
