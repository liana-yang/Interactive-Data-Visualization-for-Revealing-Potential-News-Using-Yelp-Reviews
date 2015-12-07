def delete_serialize_for_es(target_file, index_name, type_name):
    count = 0
    fw = open(target_file, 'w', encoding='utf-8')
    fw.write("[")
    while count < 70000:
        fw.write("{\"delete\": {\"_index\": \"" + index_name + "\", \"_type\": \"" + type_name + "\", \"_id\": %d}}," % count)
        count += 1
    fw.write("{\"delete\": {\"_index\": \"" + index_name + "\", \"_type\": \"" + type_name + "\", \"_id\": %d}}" % count)
    fw.write("]")
    fw.close()
delete_serialize_for_es("delete_business1128v2.json", "yelp", "business1128v2")

