from functools import reduce
import re
import os
from collections.abc import Iterable
import pdfplumber
from pypdf import PdfReader, PdfWriter
from format_samples import format_samples
import json

pdfsToIgnore = [
  # white space problem, couldn't correct by tweaking x_tolerance and y_tolerance
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2015/phase1/contest/H/H.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2016/phase1/warmup/A/A.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2016/phase1/contest/G/G.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2016/phase1/contest/I/I.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2013/phase1/contest/B/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/phase1/contest/F/F.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/phase1/contest/B/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2018/phase1/warmup/B/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/phase1/contest/C/C.pdf',
]

# despite its text contain words like 'figure', 'figura', 'picture', ...
# the PDFs of these problems doesn't actually contain any figures
doesNotContainFigures = [
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/phase1/contest/J/J.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/phase2/warmup/B/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/phase2/contest/D/D.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/phase2/contest/G/G.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/phase2/contest/M/M.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/phase2/warmup/C/C.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/phase2/contest/K/K.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2018/phase2/contest/A/A.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/phase1/contest/J/J.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/phase2/contest/H/H.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2021/phase2/warmup/B/B.pdf',
]

leftoversFile = open('leftovers.json', 'r')
leftovers = json.loads(leftoversFile.read())
leftoversFile.close()
pdfPathsWithLeftovers = leftovers.keys()
# print(len(pdfPathsWithLeftovers))

def list_pdf_files(directory):
	pdf_files = []
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith(".pdf"):
				pdf_files.append(os.path.join(root, file))
	return pdf_files

def flatten(xs):
    for x in xs:
        if isinstance(x, Iterable) and not isinstance(x, (str, bytes)):
            yield from flatten(x)
        else:
            yield x

# extract non-tabular text from PDF
def extract_problem_from_pdf(pdfPath):
  pdf = pdfplumber.open(pdfPath)  

  # EXTRACT TEXT (except text from tables)
  text = ''
  for page in pdf.pages:
    # https://github.com/jsvine/pdfplumber/issues/292#issuecomment-712752239
    # y_tolerance for better subscripts recognition
    pageText = page.extract_text(x_tolerance=2, y_tolerance=6) + '\n'
    
    # remove first line at every page, because it is the page header
    #
    # 2022/phase2/contest/M/M.pdf page 3 has only images, so there won't be a trailing newline
    pageText = re.sub('^.*\n?', '', pageText)
    text += pageText
  #
  # remove text from tables
  # https://github.com/jsvine/pdfplumber/issues/242
  tables = []
  for page in pdf.pages:
    tables.extend(page.find_tables()) # get table coordinates

  for table in tables:
    try:
      tableText = table.page.within_bbox(table.bbox).extract_text(x_tolerance=2, y_tolerance=6)
      # sometimes table extract_text returns empty string (e.g. 2019/phase2/contest/F/F.pdf); replacing empty string
      # occurrences with a space will result in adding a space between every character of the original string
      if tableText != '':
        text = text.replace(tableText, ' ')
    except ValueError as e:
      # 2015/phase1/contest/G/G.pdf has a figure which is mistakenly identified as a table,
      # which triggers error `Bounding box is not fully within parent page bounding box`
      if not pdfPath.endswith('2015/phase1/contest/G/G.pdf'):
        raise e

  # REMOVE HYPHENATION
  text = text.replace('-\n', '\n')

  # FIX DIACRITICS (tilde, circumflex, ç, etc.)
  # must be done before extract title, because it may contain punctuation
  # `unicodedata.normalize('NFKD', text)` doesn't suffice because pdfplumber isn't consistent with diacritics
  # (sometimes it is extract before the letter, sometimes after) and unicodedata expects the diacritic to be before the letter
  # besides, unicodedata adds a space in the place of the diacritic
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
    text = text.replace(pattern, replacement)

  # EXTRACT PROBLEM NAME
  firstLine = re.match('^.*\n', text).group(0).strip()
  text = re.sub('^.*\n', '', text)
  if re.search('–', firstLine):
    # some of the problems, have the letter and the title on the same line
    # e.g. "Problem A – The fellowship of the ring"
    m = re.match('^Problema? [A-Z] – (.*)$', firstLine)

    if m is None:
      raise Exception('Unexpected first line in ' + pdfPath + ': "' + firstLine + '"')

    problemName = m.group(1)
  else:
    # first line has the problem letter, e.g. "Problema A" and second line has the title
    if re.search('^Problema? [A-Z]$', firstLine) is None:
      raise Exception('Unexpected first line in ' + pdfPath + ': "' + firstLine + '"')

    problemName = re.match('^.*\n', text).group(0).strip()
    text = re.sub('^.*\n', '', text)
  #
  # some of the problems have the author after the title
  newFirstLine = re.match('^.*\n', text).group(0).strip()
  author = None
  if re.search('^Author: (.*)$', newFirstLine) is not None:
    text = re.sub('^.*\n', '', text)
    author = re.match('^Author: (.*)$', newFirstLine).group(1)
  elif re.search('^Arquivo: (.*)$', newFirstLine) is not None:
    # some of the problems have the expected filename after the title
    # e.g. 2014/phase1/contest/K/K.pdf
    text = re.sub('^.*\n', '', text)

  # REMOVE NEWLINES
  text = re.sub(r'(?<!\.)\n', ' ', text)
  #
  # restore newlines after section names
  # negative lookbehind is needed because sometimes the first word in the output section is 'Output'
  # `.strip()` is necessary because usually 'Exemplos' will be the last line in the text
  text = re.sub('(?<!Output )(Entrada|Saída|Exemplos|Notas|Input|Output) +', r'\1\n', text).strip()

  # EXTRACT METADATA
  year, phase, warmup, letter = pdfPath.split("/")[-5:-3] + [pdfPath.split("/")[-3] == 'warmup'] + [pdfPath.split("/")[-2]]
  source = {
    'year': year,
    'phase': 1 if phase == 'phase1' else 2,
    'warmup': warmup,
    'letter': letter,
    'author': author,
  }

  # EXTRACT TABLES
  # NOTE: text in tables are not being normalized (e.g. diacritics are not being fixed) because they contain very simple text
  tables = [] # e.g. [[['Entrada\n10 7', 'Sa´ıda\n10']], [['Entrada\n2 2', 'Sa´ıda\n2']]]
  for page in pdf.pages:
    tables += page.extract_tables()
  #
  # some PDFs have figures/shapes which are mistakenly identified as tables; some of them will trigger error when
  # passed to `format_samples` (e.g. 2015/phase1/contest/E/E.pdf) others won't (e.g. 2018/phase1/contest/E/E.pdf)
  # meanwhile, every table cell which contains a sample has the words 'entrada', 'saída', 'input' or 'output'
  # therefore, ignore tables which don't contain these words
  samplesTables = list(filter(lambda t: re.search('(entrada|saída|input|output)', str(t), re.IGNORECASE) is not None, tables))
  samples = format_samples(samplesTables)

  hasImages = False
  
  # EXTRACT IMAGES
  images = []
  for page in pdf.pages:
    images.extend(page.images)
  #
  if (len(images) > 0):
    # print(pdfPath, len(images))
    hasImages = True

    components = pdfPath.split("/")[-5:-1]
    dirname = './imgs/' + ("/".join(components))
    # os.makedirs(dirname, exist_ok=True)

    for index, image in enumerate(images):
      x0 = image["x0"]
      y0 = image["y0"]
      x1 = image["x1"]
      y1 = image["y1"]
      # bbox = (x0, y0, x1, y1) # wrong
      bbox = (x0, pdf.pages[image['page_number'] - 1].height - y1, x1, pdf.pages[image['page_number'] - 1].height - y0)
      cropped_page = pdf.pages[image['page_number'] - 1].crop(bbox)
      image_obj = cropped_page.to_image(resolution=150)
      # image_obj.save(dirname + '/' + str(index + 1) + '.png')

  # EXTRACT IMAGES NOT IDENTIFIED BY PDFPLUMBER
  # pdfplumber successfully identifies raster images, but not vector figures which are made of shapes (lines, circles, rectangles, ...)
  # https://github.com/jsvine/pdfplumber/issues/454
  # e.g. 2016/phase2/contest/F/F.pdf, 2015/phase1/contest/G/G.pdf
  # code below create a directory for each problem which likely to have images
  # the process of extracting vector images from these PDFs will be done manually
  if (re.search('figure|figura|picture|ilustraç(ão|ões)|illustration|image', text, re.IGNORECASE) is not None):
    if pdfPath not in doesNotContainFigures:
      # print(pdfPath)
      hasImages = True
      # dirname = f"./imgs/{year}/{phase}/{'warmup' if warmup is True else 'contest'}/{letter}/"
      dirname = './imgs/' + ("/".join(pdfPath.split("/")[-5:-1]))
      # os.makedirs(dirname, exist_ok=True)

  # REMOVE LEFTOVER TEXTS FROM FIGURES
  # the figures that are vectors were extracted manually and the leftovers.json has a key/value pairs
  # in which key is the path to a PDF problem and value is a list of strings which are leftovers from the figures for that PDF
  if pdfPath in pdfPathsWithLeftovers:
    # print(pdfPath)
    leftoversOfCurrentPdf = leftovers[pdfPath]
    for leftover in leftoversOfCurrentPdf:
      leftover = leftover.replace('\\n', '\n')
      if text.find(leftover) == -1:
        raise Exception(f'Leftover "{leftover}" not found in {pdfPath}')
      text = text.replace(leftover, '')

  return {
    'name': problemName,
    'text': text.strip(),
    'samples': samples,
    'source': source,
    'hasImages': hasImages,
  }

pdf_files_paths = list(filter(lambda path: re.search('^[A-Z]$', os.path.basename(path).replace('.pdf', '')), list_pdf_files('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/')))

ps = []
for path in pdf_files_paths:
  if path in pdfsToIgnore:
    continue

  print(path)
  p = extract_problem_from_pdf(path)
  # print(p)
  # print(json.dumps(p, ensure_ascii=False)) # print json
  ps.append(p)

  # break

# when serializing JSON, `json.dumps()` use by default  Unicode escape sequences (e.g. \u00f3 for "ó")
# for characters outside the ASCII range; `ensure_ascii=False` prevent such behavior
# which is opportune because the size of the JSON file will be reduced without the escape sequences
with open('output.json', 'w') as f:
  json.dump(ps, f, ensure_ascii=False, indent=2)

# create a JSON file for each problem in the SBC directory
# print()
# destBasePath = '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/'
# for p in ps:
#   problemPath = f'{p["source"]["year"]}/phase{p["source"]["phase"]}/{"warmup" if p["source"]["warmup"] else "contest"}/{p["source"]["letter"]}/'
#   filename = destBasePath + problemPath + p['source']['letter'] + '.json'
#   print(filename)
#   with open(filename, 'w') as f:
#     json.dump(p, f, ensure_ascii=False, indent=2)

# e = extract_problem_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2015/phase2/contest/H/H.pdf')
# print(e)
