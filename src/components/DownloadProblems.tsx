import {
  faFileArrowUp,
  faFileArrowDown,
  faFileZipper,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLiveQuery } from 'dexie-react-hooks';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import db from '../db';

import type { problem } from '../shared';

console.log(pdfMake);
console.log(pdfFonts);

// https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/url/
const fonts = {
  Roboto: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
};

// simple example
// const docDefinition = {
//   content: [
//     'First paragraph',
//     'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines',
//   ],
// };

// advanced example
const docDefinition = {
  content: [
    {
      text: 'This is a header, using header style',
      style: 'header',
    },
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
    {
      text: 'Subheader 1 - using subheader style',
      style: 'subheader',
    },
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo.',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    'Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo.',
    {
      text: 'Subheader 2 - using subheader style',
      style: 'subheader',
    },
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis.',
    {
      text: 'It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties',
      style: ['quote', 'small'],
    },
  ],
  styles: {
    header: {
      fontSize: 18,
      bold: true,
    },
    subheader: {
      fontSize: 15,
      bold: true,
    },
    quote: {
      italics: true,
    },
    small: {
      fontSize: 8,
    },
  },
};

// pdfMake.createPdf(docDefinition, undefined, fonts).print();
// pdfMake.createPdf(docDefinition, undefined, fonts).download('problem.pdf');

function DownloadProblems() {
  const problems = useLiveQuery(() => db.problems.toArray()) ?? [];
  const problemsOrder = (
    useLiveQuery(() => db.miscellaneous.get({ name: 'problemsOrder' })) ?? {
      value: [],
    }
  ).value as string[];
  const orderedProblems = problemsOrder.map((id) =>
    problems.find((problem) => problem.id === id),
  ) as problem[];

  return (
    <>
      <h2 className="h4 mb-4dot5">Download problems</h2>
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
                  {problem.fullName}
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
