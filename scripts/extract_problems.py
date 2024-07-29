import re
import os
from collections.abc import Iterable
import pdfplumber
from pypdf import PdfReader, PdfWriter

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
    pageText = page.extract_text(x_tolerance=2, y_tolerance=6)
    
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
      text = text.replace(tableText, ' ')
    except ValueError as e:
      # 2015/first/contest/G.pdf has a figure which is mistakenly identified as a table,
      # which triggers error `Bounding box is not fully within parent page bounding box`
      if not pdfPath.endswith('2015/first/contest/G.pdf'):
        raise e

  # print(text)
  #

  # remove hyphenation
  text = text.replace('-\n', '\n')

  # fix accents (tilde, circumflex, ç, etc.)
  # must be done before extract title, because it may contain punctuation

  # get "Problema X" and problem title
  # problemX = re.match('^.*\n', text).group(0).strip()
  # text = re.sub('^.*\n', '', text) # remove first line
  # problemName = re.match('^.*\n', text).group(0).strip()
  # text = re.sub('^.*\n', '', text) # remove first line
  # print(problemX, '—', problemName)

  # remove newlines

  # extract images
  # 2020/first/warmup/A.pdf has a image
  # 2022/second/contest/M.pdf has a page (3) containing only images

  # identify shapes as image instead of recognizing them as text
  # 2015/first/contest/G.pdf has shapes

  return text

# print(extract_text_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/first/warmup/A.pdf'))
# print(extract_text_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2020/second/contest/D.pdf'))

pdf_files_paths = filter(lambda path: re.search('^[A-Z]$', os.path.basename(path).replace('.pdf', '')), list_pdf_files('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/')) # only PDFs containing individual problems

for path in pdf_files_paths:
  print(path)
  t = extract_text_from_pdf(path)
  # print(t)
  print()
  # break

# print('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/second/contest/M.pdf')
# t = extract_text_from_pdf('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/2022/second/contest/M.pdf')
# print()