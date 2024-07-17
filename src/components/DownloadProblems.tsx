import {
  faFileArrowUp,
  faFileArrowDown,
  faFileZipper,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLiveQuery } from 'dexie-react-hooks';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import existingProblems from '../assets/problems.json';
import db from '../db';
import { problem, createProblemPDF } from '../shared';

// console.log(createProblemPDF(existingProblems[0]));
// console.log(await createProblemPDF(existingProblems[0]));

// try {
//   const response = await fetch('/problemtemplate.zip', {
//     method: 'GET',
//   });
//   const data = response.arrayBuffer();

//   const zip = await JSZip.loadAsync(data);
//   // console.log(zip);

//   // read existing file
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   // const problemInfo = await zip
//   //   .file('description/problem.info')!
//   //   .async('string');
//   // console.log(problemInfo);

//   // delete file
//   zip.remove('description/desc.txt');

//   // replace existing file contents
//   zip.file(
//     'description/problem.info',
//     'basename=ProblemaA\nfullname=Nome do Problema\ndescfile=ProblemaA.pdf\n',
//   );

//   zip.file(
//     'description/ProblemaA.pdf',
//     await createProblemPDF(existingProblems[0]),
//   );

//   const content = await zip.generateAsync({ type: 'blob' });
//   saveAs(content, 'problem.zip');
// } catch (error) {
//   console.error('Error:', error);
// }

function DownloadProblems() {
  const problems = useLiveQuery(() => db.problems.toArray()) ?? [];
  const problemsOrder = (
    useLiveQuery(() => db.miscellaneous.get({ name: 'problemsOrder' })) ?? {
      value: [],
    }
  ).value as string[];
  const orderedProblems =
    problems.length === 0
      ? []
      : (problemsOrder.map((id) =>
          problems.find((problem) => problem.id === id),
        ) as Required<problem>[]);

  return (
    <>
      <h2 className="h4 mb-4dot5">Download problems</h2>
      <a href="../assets/problemtemplate.zip">zip</a>
      <div className="mb-4dot5">
        <h4 className="h5">Backup in JSON format</h4>
        <p className="mb-2 text-secondary fw-medium">
          For later editing or continuing on another computer
        </p>
        <ul className="ps-4" style={{ listStyle: 'none' }}>
          <li>
            <button className="btn btn-link text-decoration-none fw-medium">
              <FontAwesomeIcon
                icon={faFileArrowUp}
                className="me-3"
                style={{ fontSize: '1.25rem' }}
              />
              Upload
            </button>
          </li>
          <li>
            <button className="btn btn-link text-decoration-none fw-medium">
              <FontAwesomeIcon
                icon={faFileArrowDown}
                className="me-3"
                style={{ fontSize: '1.25rem' }}
              />
              Download
            </button>
          </li>
        </ul>
      </div>
      <div className="mb-4 dot5">
        <h4 className="h5">Export as BOCA-compatible ZIP files</h4>
        <p className="mb-2 text-secondary fw-medium">
          Problems packages ready to be used in programming competitions
        </p>
        <div className="ps-4">
          <p className="mb-1">
            <button
              className="btn btn-link text-decoration-none fw-medium"
              onClick={() => {
                console.log('all');
              }}
            >
              <FontAwesomeIcon
                icon={faFileZipper}
                className="me-3"
                style={{ fontSize: '1.25rem' }}
              />
              Download All
            </button>
            or download each problem individually
          </p>
          <ul
            className="ps-0 d-flex flex-wrap align-items-center list-separators"
            style={{ listStyle: 'none' }}
          >
            {orderedProblems.map((problem) => (
              <li key={problem.id}>
                <button
                  className="btn btn-link text-decoration-none fw-medium"
                  onClick={() => {
                    console.log(problem);
                  }}
                >
                  {problem.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default DownloadProblems;
