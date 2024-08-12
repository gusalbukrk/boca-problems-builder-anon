import os
import re
import pdfplumber
from functools import reduce
from format_examples import format_examples
import json
from collections import Counter
from fuzzywuzzy import fuzz

obi_dir = '/home/gusalbukrk/Dev/crawled/OBI_organized'
years = sorted(os.listdir(obi_dir))

individual_problem_pdf_regex = '^f[0-9]p[0-9js](-b)?_.*\\.pdf$'

def extract_problem_from_pdf(pdfPath):
  pdf = pdfplumber.open(pdfPath)  

  # EXTRACT TEXT (except text from tables)
  description = ''
  for page in pdf.pages:
    # https://github.com/jsvine/pdfplumber/issues/292#issuecomment-712752239
    # y_tolerance for better subscripts recognition
    pageText = page.extract_text(x_tolerance=2, y_tolerance=6) + '\n'
    
    # remove first line at every page, because it is the page header
    #
    # page 3 from 2022/phase2/contest/M/M.pdf has only images, so there won't be a trailing newline
    pageText = re.sub('^.*\n?', '', pageText)
    description += pageText
  #
  # remove text from tables
  # https://github.com/jsvine/pdfplumber/issues/242
  tables = []
  for page in pdf.pages:
    tables.extend(page.find_tables()) # get tables coordinates
  #
  for table in tables:
    try:
      tableText = table.page.within_bbox(table.bbox).extract_text(x_tolerance=2, y_tolerance=6)
      # sometimes `extract_text` returns empty string (e.g. 2019/phase2/contest/F/F.pdf); replacing empty string
      # occurrences with a space will result in adding a space between every character of the original string
      if tableText != '':
        description = description.replace(tableText, ' ')
    except ValueError as e:
      # the following PDFs have a figure which is mistakenly identified as a table,
      # which triggers error `Bounding box is not fully within parent page bounding box`
      if not (pdfPath.endswith('/2011/f1p2_quadrado.pdf') or pdfPath.endswith('2011/f1p2_tesouro.pdf')):
        raise e

  # REMOVE HYPHENATION
  description = description.replace('-\n', '')

  # FIX DIACRITICS (tilde, circumflex, ç, etc.)
  # must be done before extract title, because it may contain punctuation
  # `unicodedata.normalize('NFKD', description)` doesn't suffice because pdfplumber isn't consistent with diacritics
  # (sometimes it is extract before the letter, sometimes after) and unicodedata expects the diacritic to be before the letter
  # besides, unicodedata is adding a space in the place of the diacritic
  patterns = [
    ('¸c', 'ç'),
    ('˜a', 'ã'),
    ('˜o', 'õ'),
    ('´ı', 'í'),
    ('´a', 'á'),
    ('´e', 'é'),
    ('´i', 'í'),
    ('´o', 'ó'),
    ('´u', 'ú'),
    ('ˆa', 'â'),
    ('ˆe', 'ê'),
    ('ˆo', 'ô'),
    ('`a', 'à'),
  ]
  # for each tuple, create a new tuple with the reversed pattern (e.g. `('¸c', 'ç')` => `('c¸', 'ç')`)
  # patterns = reduce(lambda acc, x: acc + [x, (x[0][::-1], x[1])], patterns, [])
  # for each tuple, create 3 variants: reversed pattern (e.g. `('¸c', 'ç')` => `('c¸', 'ç')`), uppercase and uppercase reversed
  patterns = reduce(lambda acc, x: acc + [x, (x[0][::-1], x[1]), (x[0].upper(), x[1].upper()), (x[0][::-1].upper(), x[1].upper())], patterns, [])
  #
  for pattern, replacement in patterns:
    description = description.replace(pattern, replacement)

  # EXTRACT PROBLEM NAME, AUTHOR AND OTHER METADATA
  problem_name = re.match('^.*\n+', description).group(0).strip()
  description = re.sub('^.*\n+', '', description) # remove first line
  #
  problem_author = re.match('Autor(?:es)?: (.*)\n+', description)
  if problem_author is not None:
    problem_author = problem_author.group(1).strip()
  #
  # e.g. filename example `/home/gusalbukrk/Dev/crawled/OBI_organized/2023/f3p0_metronibus.pdf`
  year, phase, level, codename =  re.search('/([0-9]{4})/f([123])p([0123])_(.*)\\.pdf$', pdfPath).groups()
  source = {
    'competition': 'OBI',
    'year': int(year),
    'phase': int(phase),
    'level': int(level),
    'warmup': None,
    'letter': None,
    'author': problem_author,
    'codename': codename,
  }

  # REMOVE 'Nome do arquivo:...'
  description = re.sub('(arquivo de entrada|arquivo fonte|nome do arquivo fonte|nome do arquivo): .*\n+', '', description, flags=re.IGNORECASE)

  # REMOVE NEWLINES
  description = re.sub(r'(?<!\.)\n', ' ', description)
  #
  # restore newlines after section names
  # negative lookbehind is needed because sometimes the first word in the output section is 'Output'
  # `.strip()` is necessary because usually 'Exemplos' will be the last line in the description
  description = re.sub('(Entrada|Saída|Exemplos|Notas|Restrições|Informações sobre a pontuação) +', r'\1\n', description).strip()

  # EXTRACT TABLES CONTAINING SAMPLES EXAMPLES
  # NOTE: text in tables are not being normalized (e.g. diacritics are not being fixed) because they contain very simple text
  tables = [] # e.g. [[['Entrada\n10 7', 'Sa´ıda\n10']], [['Entrada\n2 2', 'Sa´ıda\n2']]]
  for page in pdf.pages:
    tables += page.extract_tables()
  #
  # some PDFs have figures/shapes which are mistakenly identified as tables; some of them will trigger error when
  # passed to `format_examples`
  # meanwhile, every table cell which contains a sample has the words 'entrada', 'saída', 'input' or 'output'
  # therefore, ignore tables which don't contain these words
  examplesTables = list(filter(lambda t: re.search('(entrada|saída)', str(t), re.IGNORECASE) is not None, tables))
  examples = format_examples(examplesTables)

  # EXTRACT IMAGES
  images = []
  if not (pdfPath.endswith('/2011/f1p2_quadrado.pdf') or pdfPath.endswith('2011/f1p2_tesouro.pdf')):
    for page in pdf.pages:
      images.extend(page.images)
    #
    if (len(images) > 0):
      year_dir_path = os.path.join(obi_dir, year)

      for index, image in enumerate(images):
        x0 = image["x0"]
        y0 = image["y0"]
        x1 = image["x1"]
        y1 = image["y1"]
        # bbox = (x0, y0, x1, y1) # wrong
        bbox = (x0, pdf.pages[image['page_number'] - 1].height - y1, x1, pdf.pages[image['page_number'] - 1].height - y0)
        cropped_page = pdf.pages[image['page_number'] - 1].crop(bbox)
        image_obj = cropped_page.to_image(resolution=150)
        image_obj.save(os.path.join(year_dir_path, f"f{phase}p{level}_{codename}_{str(index + 1)}.png"))

  return {
    'name': problem_name,
    'description': description.strip(),
    'examples': examples,
    'source': source,
    'imagesQuant': len(images),
  }

def remove_duplicate_problems(ps):
  names = [p['name'] for p in ps]

  for name, count in Counter(names).items():
    if count > 1:
      occurrencesIndexes = [index for index, value in enumerate(names) if value == name]
      # print(name, count, occurrencesIndexes)

      for index in occurrencesIndexes[1:]:
        firstOccurrenceDescription = ps[occurrencesIndexes[0]]['description']
        possibleDuplicatedDescription = ps[index]['description']

        # there're 2 pairs of distinct problems that share the same name
        # Enigma - 2017/phase2/contest/E/E.pdf, 2018/phase1/contest/E/E.pdf
        # Baralho Embaralhado - 2023/phase1/contest/B/B.pdf, 2014/phase1/contest/B/B.pdf
        similarity = fuzz.ratio(firstOccurrenceDescription, possibleDuplicatedDescription)
        
        if similarity > 90:
          # print('deleting', index, ps[index]['name'])
          ps[index] = None

  ps = [p for p in ps if p is not None]

  return ps

problems = []

for year in years[10:]:
# for year in ['2009', '2010', '2017', '2023']:
  print(year)
  year_dir_path = os.path.join(obi_dir, year)
  pdf_filenames = sorted([ file for file in os.listdir(year_dir_path) if re.search(individual_problem_pdf_regex, file) ])

  for pdf_filename in pdf_filenames:
    # TODO:
    if re.search('^f[123]p[0123]-b', pdf_filename):
      continue

    pdf_path = os.path.join(obi_dir, year_dir_path, pdf_filename)
    print(pdf_path)
    problem = extract_problem_from_pdf(pdf_path)
    # print(problem['name'])
    # print('\n\n')
    problems.append(problem)
    # break
  print()

problems = remove_duplicate_problems(problems)

with open('../src/assets/OBI_problems.json', 'w') as file:
  json.dump(problems, file, ensure_ascii=False, indent=2)

print(len(problems))
