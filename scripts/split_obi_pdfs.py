import os
import re
import pdfplumber
from pypdf import PdfReader, PdfWriter

obi_dir = '/home/gusalbukrk/Dev/crawled/OBI_organized'
years = sorted(os.listdir(obi_dir))

# to match the contests PDFs (i.e. PDFs containing multiple problems)
# the optional '-b' before the extension is to match four PDFs from 2020 (e.g. f1p1-b.pdf); in that year, phase 1 happened twice
contest_pdf_regex = 'f[0-9]p[0-9js](-b)?\\.pdf$'

# return an array of dictionaries, each containing the name of a problem and the starting and ending page numbers
def find_pdf_problems(pdf_path):
  # repair is needed otherwise error when opening /home/gusalbukrk/Dev/crawled/OBI_organized/1999/f2p2.pdf
  pdf = pdfplumber.open(pdf_path, repair=True)

  problems = []

  for page_number, page in enumerate(pdf.pages, start=1):
    page_text_abridged = page.extract_text()[:180]

    match = re.search(
      '(?:arquivo de entrada|arquivo fonte|nome do arquivo fonte|nome do arquivo): “?(.*?)\\.',
      page_text_abridged,
      re.IGNORECASE
    )

    if match:
      if len(problems) > 0:
        problems[-1]['ending_page'] = page_number - 1
      problems.append({ 'problem_name': match.group(1).lower(), 'starting_page': page_number })
  
  if problems:
    problems[-1]['ending_page'] = len(pdf.pages)
  else:
    # empty array means no problems were found; that is expected only for the 1 PDF
    if pdf_path.endswith('1999/f1p2.pdf'):
      problems = [
        { 'problem_name': 'genoma', 'starting_page': 2, 'ending_page': 3 },
        { 'problem_name': 'satelite', 'starting_page': 4, 'ending_page': 5 },
        { 'problem_name': 'cruzadas', 'starting_page': 6, 'ending_page': 8 },
        { 'problem_name': 'trem', 'starting_page': 9, 'ending_page': 10 }
      ]
    else:
      raise Exception('No problems found in file: ' + pdf_path)

  return problems

def extract_pages(pdf_path, starting_page, ending_page, output_path):
  """
  Extracts pages from a PDF and saves them to a new PDF.
  
  Parameters:
  pdf_path (str): The path to the PDF file.
  start_page (int): The start page (inclusive). First page is 1.
  end_page (int): The end page (inclusive).
  output_path (str): The path to save the extracted pages PDF.
  """
  with open(pdf_path, 'rb') as file:
    reader = PdfReader(file)
    writer = PdfWriter()

    num_pages = len(reader.pages)

    for i in range(starting_page, ending_page + 1):
      writer.add_page(reader.pages[i - 1])

    with open(output_path, 'wb') as output_file:
      writer.write(output_file)

for year in years:
  print(year)
  year_dir_path = os.path.join(obi_dir, year)
  pdf_filenames = [ file for file in os.listdir(year_dir_path) if re.search(contest_pdf_regex, file) ]

  for pdf_filename in pdf_filenames:
    pdf_path = os.path.join(year_dir_path, pdf_filename)
    print(pdf_path)
    problems = find_pdf_problems(pdf_path)

    for problem in problems:
      problem_name = problem['problem_name']
      starting_page = problem['starting_page']
      ending_page = problem['ending_page']

      output_path = os.path.join(year_dir_path, f"{pdf_filename.replace('.pdf', '')}_{problem_name}.pdf")
      extract_pages(pdf_path, starting_page, ending_page, output_path)
  print()
