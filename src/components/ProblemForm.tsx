import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import {
  faPlus,
  faTrashCan,
  faImages,
  faPenToSquare,
  faFilePdf,
  // faSquarePlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import existingProblems from '../assets/problems.json';
import db from '../db';
import { problem, createProblem, generateProblemPDF } from '../shared';

function ProblemForm({
  selectedProblemID,
  readonly = false,
}: {
  selectedProblemID?: string;
  readonly?: boolean;
}) {
  const [name, setName] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [examples, setExamples] = useState<[string, string][]>([['', '']]);
  const [images, setImages] = useState([] as string[]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (selectedProblemID !== undefined) {
        const problem =
          (await db.problems.get(selectedProblemID)) ??
          (existingProblems.find(
            (problem) => problem.name === selectedProblemID,
          ) as problem | undefined);

        if (problem !== undefined) {
          setName(problem.name);
          setAuthor(problem.source.author ?? '');
          setDescription(problem.description);
          setImages(problem.images ?? []);
          setExamples(problem.examples);
        }
      }
    })();
  }, [selectedProblemID]);

  const updateProblem = async (problem: problem) => {
    // @ts-expect-error Argument of type 'problem' is not assignable to parameter of type ...
    await db.problems.update(selectedProblemID, problem);
    // await db.problems.put({ id: selectedProblemID, ...problem });
  };

  const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const problem = {
      name,
      source: {
        author,
      },
      description,
      images,
      examples,
    };

    console.log('Problem:', problem);

    if (selectedProblemID === undefined) {
      await createProblem(problem);

      setName('');
      setAuthor('');
      setDescription('');
      setImages([]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      imagesInputRef.current!.value = '';
      setExamples([['', '']]);
    } else {
      await updateProblem(problem);
    }

    nameInputRef.current?.focus();
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
          <label htmlFor="name" className="form-label fw-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="form-control"
            ref={nameInputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            readOnly={readonly}
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="author" className="form-label fw-medium">
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
          <label htmlFor="description" className="form-label fw-medium">
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
        <div className="mb-4">
          <label htmlFor="images" className="form-label fw-medium d-block">
            Images
          </label>
          {/* https://stackoverflow.com/a/17949302 */}
          {!readonly && (
            <label htmlFor="images" className="btn btn-outline-primary btn-sm">
              <FontAwesomeIcon icon={faImages} className="me-2" />
              Choose images
            </label>
          )}
          <input
            id="images"
            type="file"
            ref={imagesInputRef}
            accept="image/*"
            className="form-control form-control-sm"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={async (e) => {
              const images = await Promise.all(
                [...(e.target.files ?? [])].map((file) => {
                  return new Promise((res, rej) => {
                    const reader = new FileReader();

                    reader.onload = () => {
                      res(reader.result);
                    };

                    reader.onerror = () => {
                      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                      rej(reader.error);
                    };

                    reader.readAsDataURL(file);
                  });
                }),
              );
              setImages(images as string[]);
            }}
            multiple
            hidden
            disabled={readonly}
            // required
          />
          <div className="d-flex column-gap-3 mt-3 align-items-center">
            {images.length === 0 ? (
              <p>No images yet.</p>
            ) : (
              images.map((image, index) => {
                return <img key={index} width="150" src={image} />;
              })
            )}
          </div>
        </div>
        <label htmlFor="example-input-1" className="form-label mb-3 fw-medium">
          Examples
        </label>
        <div className="mb-4">
          {examples.map(([input, output], index) => (
            <div key={index} className="mb-3 row">
              <p className="col-1 mb-0 text-secondary fw-bold mt-1">
                {index + 1}
              </p>
              <div className="col">
                <TextareaAutosize
                  id={index === 0 ? 'example-input-1' : undefined}
                  className="form-control"
                  style={{ resize: 'none' }}
                  value={input}
                  onChange={(e) => {
                    const newExamples = [...examples];
                    newExamples[index][0] = e.target.value;
                    setExamples(newExamples);
                  }}
                  readOnly={readonly}
                  // required
                />
              </div>
              <div className="col">
                <TextareaAutosize
                  className="form-control"
                  style={{ resize: 'none' }}
                  value={output}
                  onChange={(e) => {
                    const newExamples = [...examples];
                    newExamples[index][1] = e.target.value;
                    setExamples(newExamples);
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
                      const newExamples = examples.filter(
                        (_, i) => i !== index,
                      );
                      setExamples(newExamples);
                    }}
                    disabled={examples.length === 1}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {readonly ? (
          <button
            type="button"
            className="btn btn-primary fw-medium"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async () => {
              const problem = {
                name,
                source: {
                  author,
                },
                description,
                images,
                examples,
              };

              await generateProblemPDF(problem, undefined, true);
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            View PDF
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm mb-4"
              onClick={() => {
                setExamples([...examples, ['', '']]);
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add example
            </button>
            <br />
            <button type="submit" className="btn btn-primary fw-medium">
              <FontAwesomeIcon
                icon={
                  selectedProblemID === undefined ? faSquarePlus : faPenToSquare
                }
                className="me-2"
              />
              {selectedProblemID === undefined ? 'Create' : 'Update'}
            </button>
          </>
        )}
      </form>
    </>
  );
}

export default ProblemForm;
