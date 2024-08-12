import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { nanoid } from 'nanoid';
import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  Alignment,
  CanvasLine,
  Content,
  ContentOrderedList,
  ContentText,
  Margins,
  PageBreak,
} from 'pdfmake/interfaces'; // eslint-disable-line import/no-unresolved

import db from './db';

interface ObiSource {
  competition: 'OBI';
  year: number;
  phase: number;
  author: string | null;
  level: number;
  codename: string;
}

export interface MpSbcSource {
  competition: 'MP-SBC';
  year: number;
  phase: number;
  warmup: boolean;
  letter: string;
  author: string | null;
}

export type Source = ObiSource | MpSbcSource;

export interface ExistingProblem {
  name: string;
  description: string;
  source: Source;
  imagesQuant: number;
  examples: [string, string][];
}

export interface UserProblem {
  name: string;
  description: string;
  // only problems created from existing problem have source with multiple properties (otherwise, only author)
  source: { author: string | null } | Source;
  examples: [string, string][];

  id: string;
  images: string[];
}

// export interface problem {
//   name: string;
//   description: string;
//   examples: [string, string][];
//   source: {
//     competition?: string;
//     year?: number;
//     phase?: number;
//     warmup?: boolean;
//     letter?: string;
//     author?: string;
//   };

//   // the following properties are present only on the existing problems
//   imagesQuant?: number;

//   // the following properties are present only on the problems stored
//   // in the indexedDB database but not in the JSON file
//   id?: string;
//   images?: string[];
// }

export const createProblem = async (
  problem: ExistingProblem | Omit<UserProblem, 'id'>,
) => {
  const id = nanoid();

  await db.problems.add({
    id,
    name: problem.name,
    description: problem.description,
    examples: problem.examples,

    // problems created from existing problem will have all source properties
    // while user-created problems will have only author
    source: problem.source,

    images:
      'images' in problem
        ? problem.images
        : generateImagesUrlsArray(problem.imagesQuant, problem.source),
  } as UserProblem);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const problemsOrder = (await db.miscellaneous.get({
    name: 'problemsOrder',
  }))!.value as string[];
  const problemsOrderUpdated = problemsOrder.concat(id);
  await db.miscellaneous.update('problemsOrder', {
    value: problemsOrderUpdated,
  });
};

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

const docDefinitionGeneralSettings = async () => {
  const contestName = ((await db.miscellaneous.get('contestName'))?.value ??
    '') as string;

  return {
    pageMargins: [56, 70, 56, 56] as Margins,
    header: (currentPage: number) => {
      return currentPage === 1
        ? []
        : ([
            {
              columns: [
                {
                  // text: '1º Minimaratona de Programação do IF Goiano Catalão',
                  text: contestName,
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
          ] as Content);
    },
    defaultStyle: {
      // fontSize: 12, // default
      alignment: 'justify' as Alignment,
      lineHeight: 1.2,
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
};

const generateDocDefinitionCoverPageContent = async (problemsQuant: number) => {
  const generateListItem = (items: string[]) =>
    ({
      type: 'lower-alpha',
      separator: ['(', ') '],
      ol: items.map((item) => ({ text: item, margin: [0, 0, 0, 8] })),
    }) as ContentOrderedList;

  const contestName = ((await db.miscellaneous.get('contestName'))?.value ??
    '') as string;
  const logo = ((await db.miscellaneous.get('logo'))?.value ?? '') as string;

  return [
    // ternary is needed, otherwise error when logo is not set
    logo === ''
      ? ''
      : {
          image: logo,
          // width: 150,
          fit: [500, 120] as [number, number], // max height 120px
          margin: [0, 0, 0, 8] as Margins,
          alignment: 'center' as Alignment,
        },
    {
      text: contestName,
      alignment: 'center' as Alignment,
      margin: [0, 0, 0, 36] as Margins,
      fontSize: 12,
    },
    {
      text: 'Informações Gerais',
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 12] as Margins,
    },
    {
      text: `Este caderno contém ${problemsQuant.toString()} problemas. Verifique se o caderno está completo.`,
      margin: [0, 0, 0, 16] as Margins,
    },
    {
      stack: [
        { text: '1. Sobre os nomes dos programas', bold: true },
        generateListItem([
          'Para soluções em C/C++ e Python 3, o nome do arquivo-fonte não é significativo, pode ser qualquer nome desde que tenha as extensões .c, .cc, .py3.',
          'Para linguagem Java, sua solução deve ter o nome de ProblemX.java, onde X é a letra maiúscula que identifica o problema. Lembre que em Java o nome da classe principal deve ser igual ao nome do arquivo.',
        ]),
        { text: '2. Sobre a entrada', bold: true },
        generateListItem([
          'A entrada de seu programa deve ser lida da entrada padrão.',
          'A entrada é composta de um único caso de teste, descrito em um número de linhas que depende do problema.',
          'Quando uma linha da entrada contém vários valores, estes são separados por um único espaço em branco; a entrada não contém nenhum outro espaço em branco.',
          'Cada linha, incluindo a última, contém exatamente um caractere final-de-linha.',
          'O final da entrada coincide com o final do arquivo.',
        ]),
        { text: '3. Sobre a saída', bold: true },
        generateListItem([
          'A saída de seu programa deve ser escrita na saída padrão.',
          'Quando uma linha da saída contém vários valores, estes devem ser separados por um único espaço em branco; a saída não deve conter nenhum outro espaço em branco.',
          'Cada linha, incluindo a última, deve conter exatamente um caractere final-de-linha.',
        ]),
      ].map((p) => {
        const obj = typeof p === 'string' ? { text: p } : p;
        return {
          ...obj,
          // @ts-expect-error Property 'ol' does not exist on type
          margin: [obj.ol !== undefined ? 18 : 0, 0, 0, 8] as Margins,
        };
      }),
    },
    {
      text: '',
      pageBreak: 'after' as PageBreak,
    },
  ];
};

// convert image stored online to base64
const convertImageInUrlToDataUrl = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const generateDocDefinitionProblemContent = async (
  problem: ExistingProblem | UserProblem | Omit<UserProblem, 'id'>,
  index?: number,
) => {
  return [
    {
      text:
        index === undefined
          ? problem.name
          : `${numberToLetter(index)} – ${problem.name}`,
      style: 'header',
      margin: [0, 0, 0, 18] as Margins,
    },
    ...(await Promise.all(
      ('images' in problem ? problem.images : []).map(async (image) => {
        // couldn't make it work by storing image files in `src/assets/` or `public/`
        // it may be that converting it to base64 (as it is being done right now) is the only way
        // https://stackoverflow.com/a/68010094
        // image: '../assets/problem-image.png',

        return {
          image: image.startsWith('https')
            ? await convertImageInUrlToDataUrl(image)
            : image,
          width: 250,
          margin: [0, 0, 0, 18] as Margins,
          alignment: 'center' as Alignment,
        };
      }),
    )),
    ...problem.description
      .split('\n')
      .map((p) => ({ text: p, margin: [0, 0, 0, 12] as Margins }))
      .map((obj) =>
        [
          'Entrada',
          'Saída',
          'Restrições',
          'Informações sobre a pontuação',
          'Exemplos',
        ].includes(obj.text)
          ? { ...obj, style: 'subheader' }
          : obj,
      ),
    // {
    //   text: 'Exemplos',
    //   style: 'subheader',
    //   margin: [0, 0, 0, 12] as Margins,
    // },
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
          // deep copying examples because they're for some unknown reason being mutated when used here
          // `["10","100"]` => `[ { "text": "10", ... } ] }, { "text": "100", ...} ] } ]`
          ...(
            JSON.parse(JSON.stringify(problem.examples)) as [string, string][]
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
  ];
};

export async function generateProblemPDF(
  problem: ExistingProblem | UserProblem | Omit<UserProblem, 'id'>,
  index?: number,
  open = false,
) {
  const docDefinition = {
    ...(await docDefinitionGeneralSettings()),

    content: await generateDocDefinitionProblemContent(problem, index),
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

export async function generateProblemsBookletPDF(problems: UserProblem[]) {
  const docDefinition = {
    ...(await docDefinitionGeneralSettings()),

    content: [
      ...(await generateDocDefinitionCoverPageContent(problems.length)),

      ...(
        await Promise.all(
          problems.map(async (problem, index) => {
            const content = await generateDocDefinitionProblemContent(
              problem,
              index,
            );
            if (index !== 0) (content[0] as ContentText).pageBreak = 'before';
            return content;
          }),
        )
      ).flat(),
    ],
  };

  return new Promise<Buffer>((res) => {
    pdfMake.createPdf(docDefinition, undefined, fonts).getBuffer((buffer) => {
      res(buffer);
    });
  });
}

/** used for generate problem shortName; 0 => A, 1 => B, ... */
export const numberToLetter = (n: number) => {
  if (n < 0 || n > 25)
    throw new Error(
      'numberToLetter function only supports numbers between 0 and 25',
    );
  return String.fromCharCode(65 + n);
};

export async function generateProblemZip(
  problem: UserProblem,
  index: number,
  download = false,
) {
  const response = await fetch('/problemtemplate.zip', {
    method: 'GET',
  });
  const data = response.arrayBuffer();

  const zip = await JSZip.loadAsync(data);

  // read existing file
  // const problemInfo = await zip
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   .file('description/problem.info')!
  //   .async('string');
  // console.log(problemInfo);

  // shortName is “usually a letter, no spaces” and it’s defined during problem registration
  // (`/admin/problem.php`); baseName is the “name of the class expected to have the main“,
  // it’s set in the problem package's `description/problem.info` and it must be at least 3
  // chars long, otherwise may there be an error when compiling solutions in Java
  // https://github.com/gusalbukrk/boca/tree/main/tutorial#o-basename-dos-problemas-deve-ter-no-m%C3%ADnimo-3-caracteres
  const shortName = numberToLetter(index);
  const baseName = `Problem${shortName}`;
  const descfile = `${shortName}.pdf`;

  // replace existing file contents
  zip.file(
    'description/problem.info',
    `basename=${baseName}\nfullname=${problem.name}\ndescfile=${descfile}\n`,
  );

  zip.file(
    `description/${descfile}`,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (await generateProblemPDF(problem, index))!,
  );

  problem.examples.forEach(([input, output], index) => {
    const filename = `X_${(index + 1).toString()}`;

    zip.file(`input/${filename}`, input.endsWith('\n') ? input : `${input}\n`);
    zip.file(
      `output/${filename}`,
      output.endsWith('\n') ? output : `${output}\n`,
    );
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  if (download) saveAs(blob, `${shortName}.zip`);
  return blob;
}

export async function generateAllProblemsZip(problems: UserProblem[]) {
  const zip = new JSZip();

  zip.file('booklet.pdf', await generateProblemsBookletPDF(problems));

  for (const [index, problem] of problems.entries()) {
    const problemZip = await generateProblemZip(problem, index);
    zip.file(`${numberToLetter(index)}.zip`, problemZip);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'problems.zip');
}

export function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`; // USA format
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
}

// const archiveRoot = 'https://archive.org/download/mp-sbc-archive/SBC.zip/';
const mpArchiveRoot =
  'https://archive.org/download/programming-marathon/Programming%20Marathon.zip/';
const obiArchiveRoot = 'https://archive.org/download/obi_archive/OBI.zip/';
export function generateArchiveUrl(source: Source, filename: string) {
  // encoding replaces slash with `%2F`
  const path = encodeURIComponent(
    source.competition === 'MP-SBC'
      ? `${source.year.toString()}/phase${source.phase.toString()}/${source.warmup ? 'warmup' : 'contest'}/${source.letter}/${filename}`
      : `${source.year.toString()}/${filename}`,
  );
  return (
    (source.competition === 'MP-SBC' ? mpArchiveRoot : obiArchiveRoot) + path
  );
}

// return example: `['https://archive.org/download/mp-sbc-archive/SBC.zip/2019/phase1/contest/A/1.png', ...]`
export function generateImagesUrlsArray(imagesQuant: number, source: Source) {
  return Array.from({ length: imagesQuant }).map((_, i) =>
    generateArchiveUrl(
      source,
      source.competition === 'MP-SBC'
        ? `${(i + 1).toString()}.png`
        : `f${source.phase.toString()}p${source.level.toString()}_${source.codename}_${(i + 1).toString()}.png`,
    ),
  );
}
