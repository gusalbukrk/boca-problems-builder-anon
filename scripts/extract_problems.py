from functools import reduce
import re
import os
from collections.abc import Iterable
import pdfplumber
from pypdf import PdfReader, PdfWriter

pdfsToIgnore = [
  # white space problem, couldn't correct by tweaking x_tolerance and y_tolerance
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2015/first/contest/H.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2016/first/warmup/A.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2016/first/contest/G.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2016/first/contest/I.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2013/first/contest/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2019/first/contest/F.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/first/contest/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2018/first/warmup/B.pdf',
  '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/first/contest/C.pdf',

  # 
]

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
def extract_text_from_pdf(pdfPath):
  pdf = pdfplumber.open(pdfPath)  

  text = ''
  for page in pdf.pages:
    # https://github.com/jsvine/pdfplumber/issues/292#issuecomment-712752239
    # y_tolerance for better subscripts recognition
    pageText = page.extract_text(x_tolerance=2, y_tolerance=6) + '\n'
    
    # remove first line at every page, because it is the page header
    #
    # 2022/second/contest/M.pdf page 3 has only images, so there won't be a trailing newline
    pageText = re.sub('^.*\n?', '', pageText)
    text += pageText

  # remove text from tables
  # https://github.com/jsvine/pdfplumber/issues/242
  tables = []
  for page in pdf.pages:
    tables.extend(page.find_tables()) # get table coordinates

  for table in tables:
    try:
      tableText = table.page.within_bbox(table.bbox).extract_text(x_tolerance=2, y_tolerance=6)
      # sometimes table extract_text returns empty string (e.g. 2019/second/contest/F.pdf); replacing empty string
      # occurrences with a space will result in adding a space between every character of the original string
      if tableText != '':
        text = text.replace(tableText, ' ')
    except ValueError as e:
      # 2015/first/contest/G.pdf has a figure which is mistakenly identified as a table,
      # which triggers error `Bounding box is not fully within parent page bounding box`
      if not pdfPath.endswith('2015/first/contest/G.pdf'):
        raise e

  # remove hyphenation
  text = text.replace('-\n', '\n')

  # fix diacritics/accents (tilde, circumflex, ç, etc.)
  # must be done before extract title, because it may contain punctuation
  # `unicodedata.normalize('NFKD', text)` doesn't suffice because pdfplumber isn't consistent with diacritics
  # (sometimes it is extract before the letter, sometimes after) and unicodedata expects the diacritic to be before the letter
  # besides, unicodedata adds a space in the place of the diacritic
  # TODO: case insensitive
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

  # get problem letter and name
  firstLine = re.match('^.*\n', text).group(0).strip()
  text = re.sub('^.*\n', '', text)
  if re.search('–', firstLine):
    # some of the problems, have the letter and the title on the same line
    # e.g. "Problem A – The fellowship of the ring"
    # problemLetter, problemName = firstLine.split(' – ')
    m = re.match('^Problema? ([A-Z]) – (.*)$', firstLine)

    if m is None:
      raise Exception('Unexpected first line in ' + pdfPath + ': "' + firstLine + '"')

    problemLetter = m.group(1)
    problemName = m.group(2)
  else:
    # first line has the problem letter, e.g. "Problema A" and second line has the title
    if re.search('^Problema? [A-Z]$', firstLine) is None:
      raise Exception('Unexpected first line in ' + pdfPath + ': "' + firstLine + '"')

    problemLetter = re.match('^Problema? ([A-Z])$', firstLine).group(1)
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
    # e.g. 2014/first/contest/K.pdf
    text = re.sub('^.*\n', '', text)
    print(pdfPath)
    print(newFirstLine)

  # remove newlines
  # text = re.sub(r'(?<!\.)\n', ' ', text)
  text = re.sub(r'(?<!\.)\n', ' ', text)
  #
  # restore newlines after section names
  # negative lookbehind is needed because sometimes the first word in the output section is 'Output'
  text = re.sub('(?<!Output )(Entrada|Saída|Input|Output) ', r'\1\n', text)

  # extract images
  # 2020/first/warmup/A.pdf has a image
  # 2022/second/contest/M.pdf has a page (3) containing only images

  # identify shapes as image instead of recognizing them as text
  # 2015/first/contest/G.pdf has shapes

  return problemLetter, problemName, author, text.strip()

pdf_files_paths = list(filter(lambda path: re.search('^[A-Z]$', os.path.basename(path).replace('.pdf', '')), list_pdf_files('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/'))) # only PDFs containing individual problems

# pdf_files_paths = list(filter(lambda path: re.search('second', path) is not None, pdf_files_paths))

for path in pdf_files_paths:
  if path in pdfsToIgnore:
    continue

  print(path)
  letter, name, author, text = extract_text_from_pdf(path)
  print(letter + ': ' + name)
  # print(author)
  print(text)
  # print()
  break

# print(extract_text_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/first/warmup/A.pdf'))
# print(extract_text_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/second/contest/D.pdf'))
# print('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/second/contest/M.pdf')
# t = extract_text_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2014/first/contest/K.pdf')
# print(t)
