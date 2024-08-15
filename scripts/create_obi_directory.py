import os
import re
import shutil

# location of the files crawled from olimpiada.ic.unicamp.br/static/extras/
# (which is where the PDF and test cases zip files are stored)
src_dir = '/home/redacted/Dev/crawled/OBI/static/extras'

dest_dir = '/home/redacted/Dev/crawled/OBI_organized'

# copy relevant files from source to destination directory
# naming conventions are:
# - PDF files: `f{phase}p{level}(-b)?.pdf`
# - zip files: `f{phase}p{level}_{name}.zip`;
# as of recently, there're:
# - 3 phases (local, state-wide, national)
# - 4 levels (p0: junior, p1, p2, p3: senior), and
# '-b' (e.g. 'f1p0-b') was used in 2020 because phase 1 happened twice;
# changes on the number of contests: up until 2004, there's only 1 level (i.e. level 2); up until 2007, there're only 2 levels (i.e. 1 & 2);
# up until 2015, there're only 3 levels (i.e. 0, 1 & 2); up until 2005, there's only 1 phase; up until 2016, there're only 2 phases
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
      pdfs_filenames = [ file for file in provas_dir_files if re.search(f'^ProvaOBI{year}_f[0-9]p[012jus](-b)?\\.pdf$', file, re.IGNORECASE) is not None ]
      #
      for pdf_filename in pdfs_filenames:
        pdf_full_path = os.path.join(provas_dir_full_path, pdf_filename)

        # the PDF files from the years 2003 & 2004 start with 'f0p0' and from 2005 with 'f0p1' and 'f0p2'
        # instead of using the same naming convention of the previous years (i.e. 'f1p2' — 2005 was first year w/ two levels);
        # replace pj (level junior) to p0, pu/ps (level universitário/sênior) to p3
        # (note: senior level was introduced in 2016 as universitário level and then renamed in 2018;
        # as such, some PDF files from 2016-2020 have `pu` instead of `ps` in their filenames)
        # dest_pdf_filename = pdf_filename.replace(f'ProvaOBI{year}_', '')
        dest_pdf_filename = pdf_filename.replace(f'ProvaOBI{year}_', '').replace('f0p0', 'f1p2').replace('f0p1', 'f1p1').replace('f0p2', 'f1p2').replace('pj', 'p0').replace('pu', 'p3').replace('ps', 'p3')

        dest_pdf_full_path = os.path.join(dest_year_dir_full_path, dest_pdf_filename)

        shutil.copy(pdf_full_path, dest_pdf_full_path)
        print(pdf_full_path)

      # copy zips containing test cases from `gabaritos` directory to destination directory
      gabaritos_dir_full_path = os.path.join(year_dir_full_path, 'gabaritos')
      #
      if os.path.isdir(gabaritos_dir_full_path):
        gabaritos_dir_files = os.listdir(gabaritos_dir_full_path)
        # zip_filenames = [ file for file in gabaritos_dir_files if file.endswith('.zip') ]
        zip_filenames = [ file for file in gabaritos_dir_files if re.search('^[0-9]{4}f[0-9]p[012jus]_.+\\.zip$', file, re.IGNORECASE) is not None ]

        for zip_filename in zip_filenames:
          zip_full_path = os.path.join(gabaritos_dir_full_path, zip_filename)

          # see comments before dest_pdf_filename to understand the following replacements
          dest_zip_filename = zip_filename[4: ] # `2024f1p2_jogo.zip` => `f1p2_jogo.zip`
          for pattern, replacement in [['^f0p0', 'f1p2'], ['^f0p(1|2)', 'f1p\\1'], ['(?<=f[0-9])pj', 'p0'], ['(?<=f[0-9])p(u|s)', 'p3']]:
            dest_zip_filename = re.sub(pattern, replacement, dest_zip_filename)

          dest_zip_full_path = os.path.join(dest_year_dir_full_path, dest_zip_filename)

          shutil.copy(zip_full_path, dest_zip_full_path)
          print(zip_full_path)

    print()

copy_files()
