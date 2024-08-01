import re
import os
import shutil

base_path = '/home/gusalbukrk/Dev/crawled/SBC/2013 onwards/'  # Replace with your desired base path

# NOTE: rename first and second to phase1 and phase2

def list_directories(base_path):
    matching_dirs = []
    for root, dirs, files in os.walk(base_path):
        matching_dirs.extend([os.path.join(root, d) for d in dirs if d.endswith('first') or d.endswith('second')])
    return matching_dirs

directories = list_directories(base_path)

for d in directories:
    new_name = d.replace('first', 'phase1').replace('second', 'phase2')
    print(d, new_name)
    # os.rename(d, new_name)

# NOTE: move problems pdfs to their directory (alongside input and output dirs)

def list_pdf_files(directory):
	pdf_files = []
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith(".pdf") and not file.endswith('contest.pdf') and not file.endswith('warmup.pdf'):
				pdf_files.append(os.path.join(root, file))
	return pdf_files

pdfsPaths = list_pdf_files(base_path)
for path in pdfsPaths:
  problemDir = path.replace('.pdf', '')

  # if current directory in which pdf is located has a directory with same name as pdf, move pdf to that directory
  if os.path.isdir(problemDir):
    print(path, problemDir)
    # shutil.move(path, problemDir)

# NOTE: move images to their respective directories

imgsCurrentDir = '/home/gusalbukrk/Dev/images-scripts/imgs/'

def list_imgs_files(directory):
	imgs_files = []
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith((".png", ".jpeg", ".jpg", ".gif", ".svg")):
				imgs_files.append(os.path.join(root, file))
	return imgs_files

imgs = list_imgs_files(imgsCurrentDir)

for img in imgs:
  ext = img.split('.')[-1]
  m = re.search(r'^/home/gusalbukrk/Dev/images-scripts/imgs/(.*?)[0-9]+\.' + ext + '$', img).group(1).replace('first', 'phase1').replace('second', 'phase2')

  dirPathToMoveTo = base_path + m
  # print(img, dirPathToMoveTo)

  # if os.path.isdir(dirPathToMoveTo):
  #   print(img, '=>', dirPathToMoveTo)
  #   # shutil.copy(img, dirPathToMoveTo)
  # else:
  #   print('Directory does not exist:', dirPathToMoveTo)

# NOTE: remove sample files extensions
# samples files of 2014 & 2015 and samples files of phase2 of 2016
# have extension (input samples have `.in`, output samples have `.sol`)

def list_samples_files_with_extension(directory):
	samples_files = []
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith((".in", ".sol")):
				samples_files.append(os.path.join(root, file))
	return samples_files
#
samples_files = list_samples_files_with_extension(base_path)
for f in samples_files:
  print(f, re.sub(r'(\.in|\.sol)$', '', f))
  os.rename(f, re.sub(r'(\.in|\.sol)$', '', f))