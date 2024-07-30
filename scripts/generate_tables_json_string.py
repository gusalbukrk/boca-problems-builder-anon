import json
import re

input = [[['Entrada\n6\n3 2 1 1 2 3\n1 2\n3 4\n6 5\n2 6\n3 6', 'Sa´ıda\n5']], [['Entrada\n8\n1 2 3 3 2 4 1 4\n1 2\n2 3\n2 6\n5 6\n6 8\n7 8\n4 7', 'Sa´ıda\n12']]]
# input = "[[['Entrada\\n6\\n3 2 1 1 2 3\\n1 2\\n3 4\\n6 5\\n2 6\\n3 6', 'Sa´ıda\\n5']], [['Entrada\\n8\\n1 2 3 3 2 4 1 4\\n1 2\\n2 3\\n2 6\\n5 6\\n6 8\\n7 8\\n4 7', 'Sa´ıda\\n12']]]"
#
# input = [[['Sample input 1\n6 6\no----o\n---oo-\n------\n--o---\no--o--\n-----o', 'Sample output 1\nY']], [['Sample input 2\n1 1\n-', 'Sample output 2\nN']], [['Sample input 3\n6 7\n-------\n-o--o--\n--o----\n-----o-\n----o--\no------', 'Sample output 3\nN']], [['Sample input 4\n3 3\n-o-\no-o\n-o-', 'Sample output 4\nN']]]

input_regex_base = re.compile(r'^((exemplos? de |sample )?(entradas?|inputs?))', re.IGNORECASE)
output_regex_base = re.compile(r'^((exemplos? de |sample )?(sa(í|´ı)das?|outputs?))', re.IGNORECASE)
input_row_regex = re.compile(rf'{input_regex_base.pattern}$', re.IGNORECASE)
output_row_regex = re.compile(rf'{output_regex_base.pattern}$', re.IGNORECASE)
input_at_start_regex = re.compile(rf'{input_regex_base.pattern}( [0-9]+)?\n', re.IGNORECASE)
output_at_start_regex = re.compile(rf'{output_regex_base.pattern}( [0-9]+)?\n', re.IGNORECASE)

def split_in_chunks_of_two(arr):
    return [arr[i:i + 2] for i in range(0, len(arr), 2)]

# Remove headers from the test cases
def remove_headers(test_cases):
    # Remove header rows
    header_rows_removed = []
    for pair in test_cases:
        if isinstance(pair, list) and len(pair) == 2:
            input_str, output_str = pair
            if not input_row_regex.match(input_str) and not output_row_regex.match(output_str):
                header_rows_removed.append((input_str, output_str))

    # Remove header substrings at the start of input and output
    header_substrings_removed = [
        (
            re.sub(input_at_start_regex, '', input_str),
            re.sub(output_at_start_regex, '', output_str)
        )
        for input_str, output_str in header_rows_removed
    ]

    return header_substrings_removed

# get `tables` containing the samples and return it in properly formatted json string
def generate_tables_json_string(data):
  str_data = str(data)
  json_data = json.loads(str_data.replace("'", '"').replace("\n", "\\n"))
  flat_json_data = [item for sublist in json_data for subsublist in sublist for item in subsublist]
  chunked_data = split_in_chunks_of_two(flat_json_data)
  removed_headers= remove_headers(chunked_data)
  j = json.dumps(removed_headers)
  return j

# output = generate_tables_json_string(input)
# print(output)
# # Write output to a file
# with open('output.json', 'w') as f:
#     json.dump(json.loads(output), f, indent=2)
