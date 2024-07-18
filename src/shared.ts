import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { nanoid } from 'nanoid';
import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Alignment, CanvasLine, Content, Margins } from 'pdfmake/interfaces'; // eslint-disable-line import/no-unresolved

import db from './db';

export interface problem {
  name: string;
  author: string;
  timeLimit: number;
  description: string;
  samples: [string, string][];
  images: string[];

  // the following properties are present only on the problems stored
  // in the indexedDB database but not in the JSON file
  id?: string;
  baseName?: string;
}

export const createProblem = async (problem: problem) => {
  const id = nanoid();

  await db.problems.add({
    id,
    ...problem,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const problemsOrder = (await db.miscellaneous.get({
    name: 'problemsOrder',
  }))!.value as string[];
  const problemsOrderUpdated = problemsOrder.concat(id);
  await db.miscellaneous.update('problemsOrder', {
    value: problemsOrderUpdated,
  });
};

export function generateProblemPDF(problem: problem, open = false) {
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

  const docDefinition = {
    pageMargins: 56,
    header: (currentPage: number) => {
      return [
        {
          columns: [
            {
              text: '1º Minimaratona de Programação do IF Goiano Catalão',
              marginLeft: 56,
              width: 'auto',
            },
            {
              text: currentPage,
              alignment: 'right' as Alignment,
              marginRight: 56,
            },
          ],
          marginTop: 18,
          color: '#101010',
          fontSize: 10,
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 56,
              y1: 9,
              x2: 540,
              y2: 9,
              lineWidth: 2,
              lineColor: '#7e7e7e',
            } as CanvasLine,
          ],
        },
      ] as Content;
    },
    content: [
      {
        text: problem.name,
        style: 'header',
        margin: [0, 0, 0, 18] as Margins,
      },
      ...problem.images.map((image) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        image: image,
        width: 250,
        margin: [0, 0, 0, 18] as Margins,
        alignment: 'center' as Alignment,
        //
        // couldn't make it work by storing image files in `src/assets/` or `public/`
        // it may be that converting it to base64 (as it is being done right now) is the only way
        // https://stackoverflow.com/a/68010094
        // image: '../assets/problem-image.png',
      })),
      ...problem.description
        .split('\n')
        .map((p) => ({ text: p, margin: [0, 0, 0, 12] as Margins }))
        .map((obj) =>
          ['Entrada', 'Saída'].includes(obj.text)
            ? { ...obj, style: 'subheader' }
            : obj,
        ),
      {
        text: 'Exemplos',
        style: 'subheader',
        margin: [0, 0, 0, 12] as Margins,
      },
      {
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 0,

          // keep together on the same page
          dontBreakRows: true,

          // widths: ['*', 'auto', 100, '*'],
          widths: [20, '*', '*'],

          body: [
            [
              { text: '#', alignment: 'center' },
              { text: 'Input', bold: true },
              { text: 'Output', bold: true },
            ],
            // deep copying samples because they're for some unknown reason being mutated when used here
            // `["10","100"]` => `[ { "text": "10", ... } ] }, { "text": "100", ...} ] } ]`
            ...(
              JSON.parse(JSON.stringify(problem.samples)) as [string, string][]
            ).map(([input, output], index) => [
              {
                text: index + 1,
                alignment: 'center',
                color: '#696969',
                bold: true,
              },
              input,
              output,
            ]),
          ],
        },
      },
    ],

    defaultStyle: {
      // fontSize: 12, // default
      alignment: 'justify' as Alignment,
    },
    styles: {
      header: {
        alignment: 'center' as Alignment,
        fontSize: 18,
        bold: true,
      },
      subheader: {
        bold: true,
      },
    },
  };

  const pdf = pdfMake.createPdf(docDefinition, undefined, fonts);

  if (open) {
    pdf.open();
  } else {
    return new Promise<Buffer>((res) => {
      pdfMake.createPdf(docDefinition, undefined, fonts).getBuffer((buffer) => {
        res(buffer);
      });
    });
  }
}

export async function generateProblemZip(
  problem: Required<problem>,
  download = false,
) {
  const response = await fetch('/problemtemplate.zip', {
    method: 'GET',
  });
  const data = response.arrayBuffer();

  const zip = await JSZip.loadAsync(data);

  // read existing file
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const problemInfo = await zip
  //   .file('description/problem.info')!
  //   .async('string');
  // console.log(problemInfo);

  const descfile = `${problem.baseName}.pdf`;

  // replace existing file contents
  zip.file(
    'description/problem.info',
    // 'basename=ProblemaA\nfullname=Nome do Problema\ndescfile=ProblemaA.pdf\n',
    `basename=${problem.baseName}\nfullname=${problem.name}\ndescfile=${descfile}\n`,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  zip.file(`description/${descfile}`, (await generateProblemPDF(problem))!);

  problem.samples.forEach(([input, output], index) => {
    const filename = `X_${(index + 1).toString()}`;

    zip.file(`input/${filename}`, input.endsWith('\n') ? input : `${input}\n`);
    zip.file(
      `output/${filename}`,
      output.endsWith('\n') ? output : `${output}\n`,
    );
  });

  const content = await zip.generateAsync({ type: 'blob' });
  if (download) saveAs(content, `${problem.baseName}.zip`);
  return content;
}

export async function generateAllProblemsZip(problems: Required<problem>[]) {
  const zip = new JSZip();

  for (const problem of problems) {
    const problemZip = await generateProblemZip(problem);
    zip.file(`${problem.baseName}.zip`, problemZip);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'problems.zip');
}
