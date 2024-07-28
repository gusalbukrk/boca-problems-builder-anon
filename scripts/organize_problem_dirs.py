import re
import os
import shutil

def list_pdf_files(directory):
	pdf_files = []
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith(".pdf"):
				pdf_files.append(os.path.join(root, file))
	return pdf_files

pdf_files_paths = filter(lambda path: re.search('^[A-Z]$', os.path.basename(path).replace('.pdf', '')), list_pdf_files('/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/')) # only PDFs containing individual problems

for path in pdf_files_paths:
  letter = os.path.basename(path).replace('.pdf', '')
  d = os.path.dirname(path) + '/' + letter

  # check if problem has a respective directory
  dirExists = os.path.isdir(d)
  if not dirExists:
    print(path)

  # if problem directory has input and output files in the same directory
  # (instead of separate input and output directories), fix it
  listDir = os.listdir(d)
  isInCorrectFormat = len(listDir) == 2 and listDir[0] == 'input' and listDir[1] == 'output'
  if not isInCorrectFormat:
    print(path)

    input_dir = os.path.join(d, 'input')
    output_dir = os.path.join(d, 'output')
    os.makedirs(input_dir)
    os.makedirs(output_dir)

    for filename in os.listdir(d):
      file_path = os.path.join(d, filename)
      
      if os.path.isfile(file_path):
        if filename.endswith('.in'):
          shutil.move(file_path, os.path.join(input_dir, filename))
        elif filename.endswith('.sol'):
          shutil.move(file_path, os.path.join(output_dir, filename))
