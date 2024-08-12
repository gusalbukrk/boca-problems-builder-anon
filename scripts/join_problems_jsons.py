import json
import locale

# otherwise, the sorting will be done using ASCII values
# for instance, lowercase letters and letters with diacritics will be sorted after uppercase letters
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')

mp = json.loads(open('../src/assets/MP-SBC_problems.json').read())
obi = json.loads(open('../src/assets/OBI_problems.json').read())
problems = sorted(mp + obi, key=lambda p: locale.strxfrm(p['name']))
print(len(problems))

with open('../src/assets/problems.json', 'w') as file:
  json.dump(problems, file, ensure_ascii=False, indent=2)