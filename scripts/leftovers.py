# i have a list of pdf paths (input.txt) which contain vector figures (lines, rectangles, circles and text) 
# these figures were extracted manually
# this scripts will be used to locate the text leftover from the figures
# it will open the pdf and json files in the browser
# and it will prompt for the parts of text that are figure leftovers
# and save this information in the output.txt

from functools import reduce
import re
import os
import json
import webbrowser
import csv

# url = 'http://www.google.com'
# chrome_path = '/usr/bin/google-chrome %s'

# with open('input.txt', 'r') as inputFile:
#   for pdfPath in inputFile:
#     pdfPath = pdfPath.strip()
#     jsonPath = pdfPath.replace('.pdf', '.json')
#     print(pdfPath)
#     webbrowser.get(chrome_path).open(jsonPath)
#     webbrowser.get(chrome_path).open(pdfPath)

#     # text leftover from figure
#     leftover = []

#     while True:
#       inp = input('Enter the string to remove: ')

#       if inp == '':
#         break

#       leftover.append(inp)

#     with open('output.txt', mode='a') as outputFile:
#         outputFile.writelines([f'{pdfPath} `{json.dumps(leftover)}`\n'])
    
#     file = open('input.txt', 'r')
#     current_content = file.read()
#     file.close()
#     new_content = current_content.replace(pdfPath + '\n', '')
#     file = open('input.txt', 'w')
#     file.write(new_content)
#     file.close()
    
#     # break
#     print()

# NOTE: use the output.txt built using code above to generate the leftovers.json
leftoversDict = {}
#
with open('output.txt', 'r') as outputFile:
  for line in outputFile:
    print(line.strip())
    m = re.match('^(.*)\.pdf `(.*)`', line)
    pdfPath = m.group(1) + '.pdf'
    leftovers = json.loads(m.group(2))
    leftoversDict[pdfPath] = leftovers
#
# with open('leftovers.json', 'w') as leftoversFile:
#   json.dump(leftoversDict, leftoversFile, ensure_ascii=False, indent=2)
