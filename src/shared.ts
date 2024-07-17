import { nanoid } from 'nanoid';
import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Alignment, CanvasLine, Content, Margins } from 'pdfmake/interfaces'; // eslint-disable-line import/no-unresolved

import problems from './assets/problems.json';
import db from './db';

export interface problem {
  id: string;
  baseName: string;
  fullName: string;
  author: string;
  timeLimit: number;
  description: string;
  samples: [string, string][];
}

export const createProblem = async (problem: Omit<problem, 'id'>) => {
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

export function createProblemPDF(p: (typeof problems)[0]): Promise<Buffer> {
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
        text: p.name,
        style: 'header',
        margin: [0, 0, 0, 18] as Margins,
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        image: p.images![0],
        width: 250,
        margin: [0, 0, 0, 18] as Margins,
        alignment: 'center' as Alignment,
        //
        // couldn't make it work by placing image in `src/assets/` or `public/`
        // it may be necessary to convert it to base64
        // https://stackoverflow.com/a/68010094
        // image: '../assets/problem-image.png',
      },
      ...p.description
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
          widths: ['*', '*'],

          body: [
            [
              { text: 'Input', bold: true },
              { text: 'Output', bold: true },
            ],
            ...p.samples,
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

  // pdfMake.createPdf(docDefinition, undefined, fonts).open();
  return new Promise((res) => {
    pdfMake.createPdf(docDefinition, undefined, fonts).getBuffer((buffer) => {
      res(buffer);
    });
  });
  // pdfMake.createPdf(docDefinition, undefined, fonts).getBuffer((buffer) => {
  //   // console.log('b:', buffer);
  // });
}
