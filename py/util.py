import json


def serialize_for_es(target_files, original_map, index_name, type_name):
    count = 0
    size_per_file = 40000
    for temp in original_map:
        if count % size_per_file == 0:
            fw = open(target_files[int(count / size_per_file)], 'w', encoding='utf-8')
            fw.write("[")
        fw.write("{\"index\": {\"_index\": \"" + index_name + "\", \"_type\": \"" + type_name + "\", \"_id\": %d}}," % count)
        fw.write(json.dumps(original_map.get(temp)))
        count += 1
        if count % size_per_file == 0 or count == len(original_map):
            fw.write("]")
            fw.close()
        else:
            fw.write(",")


def files_name_gen(file_basic_name, number):
    file_name_list = [file_basic_name + str(x) + ".json" for x in range(number)]
    return file_name_list


def read_passage_for_test(source_file, target_file):
    f1 = open(source_file, 'r')
    passage = f1.read(1000)
    f2 = open(target_file, 'w')
    f2.write(passage)
    f1.close()
    f2.close()
# read_passage_for_test("target.json", "target_sample.json")


def count_lines(source_file):
    f1 = open(source_file, 'r')
    passage = f1.readlines()
    print(len(passage))
    f1.close()
# count_lines("target0.json")


