import re
import os
import pdfplumber
from pypdf import PdfReader, PdfWriter

def int_to_letter(n):
	"""
	Convert an integer to a corresponding letter, where 0 => 'A', 1 => 'B', 2 => 'C', etc.
	"""
	
	letter = chr(n + 65)
	
	return letter

def letter_to_int(letter):
    """
    Convert a letter to its corresponding integer, where 'A' => 0, 'B' => 1, 'C' => 2, etc.
    """

    if not letter.isalpha() or len(letter) != 1 or not letter.isupper():
        raise ValueError("Input must be a single uppercase letter (A-Z)")

    return ord(letter) - 65

# get the start page of each problem in the pdf
def get_problems_pages(pdf):
	pagesText = []
	for page in pdf.pages:
		text = page.extract_text()
		pagesText.append(text)

	problemsPages = {}
	for pageNumber, page in enumerate(pagesText, start=1):
		letter = int_to_letter(len(problemsPages))
		# PDFs used in the first phase are in Portuguese, while the second phase PDFs are in English
		if (re.search('Problema? ' + letter, page)):
			problemsPages[letter] = pageNumber

	return problemsPages

def list_pdf_files(directory):
	pdf_files = []
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith(".pdf"):
				pdf_files.append(os.path.join(root, file))
	return pdf_files

def extract_pages(pdf_path, start_page, end_page, output_path):
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
        if start_page < 1 or end_page > num_pages or start_page > end_page:
            raise ValueError("Invalid page range")

        for i in range(start_page, end_page + 1):
            writer.add_page(reader.pages[i - 1])

        with open(output_path, 'wb') as output_file:
            writer.write(output_file)

# split each PDF into multiple PDFs, one for each problem
def split_pdfs():
	pdf_files_paths = list_pdf_files('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/')

	for path in pdf_files_paths:
		print(path)
		pdf = pdfplumber.open(path)
		problemsPages = get_problems_pages(pdf)
		print(problemsPages)

		for letter, pageNumber in problemsPages.items():
			nextLetter = int_to_letter(letter_to_int(letter) + 1)
			end_page = problemsPages[nextLetter] - 1 if nextLetter in problemsPages else len(pdf.pages)

			if (
				'This page would be intentionally left blank if we would not wish to inform about that.' in pdf.pages[end_page - 1].extract_text()
			):
				end_page -= 1

			print(path, pageNumber, end_page, os.path.dirname(path) + '/' + letter + '.pdf')
			extract_pages(path, pageNumber, end_page, os.path.dirname(path) + '/' + letter + '.pdf')

		pdf.close()
		print()

# split_pdfs()