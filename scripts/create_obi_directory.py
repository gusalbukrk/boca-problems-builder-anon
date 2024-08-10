import os
import re
import shutil

# location of the files crawled from olimpiada.ic.unicamp.br/static/extras/
# (which is where the PDF and test cases zip files are stored)
src_dir = '/home/gusalbukrk/Dev/crawled/OBI/static/extras'

dest_dir = '/home/gusalbukrk/Dev/crawled/OBI_organized'

# copy relevant files from source to destination directory
def copy_files() :
  years = sorted([ year[-4:] for year in os.listdir(src_dir) if re.search('^obi[0-9]{4}$', year) ])

  for year in years:
    print(year)
    year_dir_full_path = os.path.join(src_dir, f"obi{year}")

    if os.path.isdir(year_dir_full_path):
      dest_year_dir_full_path = os.path.join(dest_dir, year)
      os.makedirs(dest_year_dir_full_path, exist_ok=True)

      print('Files copied from source to destination:')

      # copy PDFs from `provas` directory to destination directory
      provas_dir_full_path = os.path.join(year_dir_full_path, 'provas')
      provas_dir_files = os.listdir(provas_dir_full_path)
      #
      pdfs_filenames = [ file for file in provas_dir_files if re.search(f'^ProvaOBI{year}_f[0-9]p.*\\.pdf$', file, re.IGNORECASE) is not None ]
      #
      for pdf_filename in pdfs_filenames:
        pdf_full_path = os.path.join(provas_dir_full_path, pdf_filename)

        dest_pdf_filename = pdf_filename.replace(f'ProvaOBI{year}_', '')
        if re.search('^f[0-9]pu', dest_pdf_filename):
          # senior level was introduced in 2016 as universitário level and then renamed in 2018
          # as such, some PDF files from 2016-2020 have `pu` instead of `ps` in their filenames
          dest_pdf_filename = re.sub('(?<=^f[0-9])pu', 'ps', dest_pdf_filename)
        dest_pdf_full_path = os.path.join(dest_year_dir_full_path, dest_pdf_filename)

        shutil.copy(pdf_full_path, dest_pdf_full_path)
        print(pdf_full_path)

      # copy zips containing test cases from `gabaritos` directory to destination directory
      gabaritos_dir_full_path = os.path.join(year_dir_full_path, 'gabaritos')
      #
      if os.path.isdir(gabaritos_dir_full_path):
        gabaritos_dir_files = os.listdir(gabaritos_dir_full_path)
        zip_filenames = [ file for file in gabaritos_dir_files if file.endswith('.zip') ]

        for zip_filename in zip_filenames:
          zip_full_path = os.path.join(gabaritos_dir_full_path, zip_filename)

          # `2024f1p2_jogo.zip` => `f1p2_jogo.zip`
          dest_zip_filename = zip_filename[4: ]
          if re.search('^f[0-9]pu_', dest_zip_filename):
            # senior level was introduced in 2016 as universitário level and then renamed in 2018
            # as such, some zip files from 2016, 2018 and 2019 have `pu` instead of `ps` in their filenames
            dest_zip_filename = re.sub('(?<=^f[0-9])pu', 'ps', dest_zip_filename)
          dest_zip_full_path = os.path.join(dest_year_dir_full_path, dest_zip_filename)

          shutil.copy(zip_full_path, dest_zip_full_path)
          print(zip_full_path)

    print()

copy_files()
