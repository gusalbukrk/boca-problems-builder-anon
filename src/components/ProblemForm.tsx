import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import {
  faPlus,
  faTrashCan,
  faImages,
  faPenToSquare,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import existingProblems from '../assets/problems.json';
import db from '../db';
import {
  UserProblem,
  ExistingProblem,
  Source,
  createProblem,
  generateProblemPDF,
  generateImagesUrlsArray,
  generateArchiveUrl,
} from '../shared';

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
  const [source, setSource] = useState<Source | null>(null);
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
          ) as ExistingProblem | undefined);

        if (problem !== undefined) {
          setName(problem.name);
          setAuthor(problem.source.author ?? '');
          setDescription(problem.description);
          setExamples(problem.examples);

          if ('images' in problem)
            setImages(problem.images); // problem is of type UserProblem
          else if (problem.imagesQuant !== 0) {
            // problem is of type ExistingProblem
            setImages(
              generateImagesUrlsArray(problem.imagesQuant, problem.source),
            );
          }

          // both existing problems and user problems created from existing problems have a source with multiple properties
          // user problems created from scratch, only have the author property
          if (Object.keys(problem.source).length > 1) {
            setSource(problem.source as Source);
          }
        }
      }
    })();
  }, [selectedProblemID]);

  const updateProblem = async (problem: Omit<UserProblem, 'id'>) => {
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
      <h2 className="h4 mb-4dot5">
        {selectedProblemID === undefined
          ? 'Criar novo problema'
          : readonly
            ? 'Visualizar problema'
            : 'Editar problema'}
      </h2>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleClick}
        className="container mt-4"
      >
        <div className="mb-4dot5">
          <label htmlFor="name" className="form-label fw-medium">
            Nome
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
            required
          />
        </div>
        <div className="mb-4dot5">
          <label htmlFor="author" className="form-label fw-medium">
            Autor
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
          />
        </div>
        <div className="mb-4dot5">
          <label htmlFor="description" className="form-label fw-medium">
            Descrição
          </label>
          <textarea
            id="description"
            rows={10}
            className="form-control"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            readOnly={readonly}
            required
          />
        </div>
        <div className="mb-4dot5">
          <label htmlFor="images" className="form-label fw-medium d-block">
            Imagens
            {
              <span className="text-secondary ms-2">
                {/* eslint-disable-next-line no-irregular-whitespace */}(
                {` ${images.length.toString()} `})
              </span>
            }
          </label>
          {/* https://stackoverflow.com/a/17949302 */}
          {!readonly && (
            <label
              htmlFor="images"
              className="btn btn-outline-primary btn-sm mt-2"
            >
              <FontAwesomeIcon icon={faImages} className="me-2" />
              Escolher imagens
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
          />
          <div className="d-flex column-gap-3 mt-3 align-items-center overflow-x-auto pb-2">
            {images.length === 0 ? (
              <p>Nenhuma imagem adicionada.</p>
            ) : (
              images.map((image, index) => {
                return (
                  <>
                    <img key={index} src={image} style={{ height: '150px' }} />
                    {index !== images.length - 1 && (
                      <div
                        className="bg-dark-subtle align-self-stretch"
                        style={{
                          // width: '2px', // not working
                          border: '2px solid lightgray',
                        }}
                      ></div>
                    )}
                  </>
                );
              })
            )}
          </div>
        </div>
        <div className="mb-4dot5">
          <label
            htmlFor="example-input-1"
            className="form-label mb-3 fw-medium"
          >
            Exemplos de entrada e saída
            <span className="text-secondary ms-2">
              {/* eslint-disable-next-line no-irregular-whitespace */}(
              {` ${examples.length.toString()} `})
            </span>
          </label>
          <div className="mb-4dot5">
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
                    required
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
                    required
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
          {!readonly && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setExamples([...examples, ['', '']]);
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar exemplo
            </button>
          )}
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
            Gerar PDF
          </button>
        ) : (
          <>
            <button type="submit" className="btn btn-primary fw-medium">
              <FontAwesomeIcon
                icon={
                  selectedProblemID === undefined ? faSquarePlus : faPenToSquare
                }
                className="me-2"
              />
              {selectedProblemID === undefined
                ? 'Criar problema'
                : 'Salvar problema'}
            </button>
          </>
        )}
        {source !== null && (
          <a
            className=" fw-medium ms-4"
            href={generateArchiveUrl(
              source,
              source.competition === 'MP-SBC'
                ? `${source.letter}.pdf`
                : `f${source.phase.toString()}p${source.level.toString()}_${source.codename}.pdf`,
            )}
            target="_blank"
            rel="noreferrer"
            title="Visualizar o PDF do qual o problema foi extraído"
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            Visualizar PDF original
          </a>
        )}
      </form>
    </>
  );
}

export default ProblemForm;
