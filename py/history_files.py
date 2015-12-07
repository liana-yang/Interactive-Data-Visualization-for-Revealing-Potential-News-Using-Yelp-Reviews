import json
from elasticsearch import Elasticsearch

# -- coding: utf-8 --
# >> pip install elasticsearch

'''
# purify the data and keep useful parts
# upload data into es
from elasticsearch import Elasticsearch
import json


def construct_business_data_type(source_file_review, source_file_business, target_file):
    fr_review = open(source_file_review, 'r', encoding='utf-8')
    passage = fr_review.readlines()
    fr_business = open(source_file_business, 'r', encoding='utf-8')
    business = fr_business.readlines()
    business_add_cat_map = {}
    count = 0
    while count < len(business):
        data = json.loads(business[count])
        key_business = data["business_id"]
        business_add_cat_map[key_business] = {"full_address": data["full_address"], "categories": data["categories"]}
        count += 1
    fw = open(target_file, 'w', encoding='utf-8')
    count = 0
    line = {}
    while count < len(passage):
        data = json.loads(passage[count])
        key_business = data["business_id"]
        key_date = data["date"]
        star_amount = data["stars"]
        if key_business in line:
            if key_date in line[key_business]:
                line[key_business][key_date]["stars"] += data["stars"]
                line[key_business][key_date]["review_amount"] += 1
            else:
                line[key_business][key_date] = {"review_amount": 1, "stars": star_amount}
        else:
            line[key_business] = {key_date: {"review_amount": 1, "stars": star_amount}}
        count += 1
    for temp in line:
        if temp in business_add_cat_map:
            temp_key = str(json.JSONEncoder().encode(temp))
            temp_value = str(json.JSONEncoder().encode(line[temp]))
            address_old = str(business_add_cat_map[temp]["full_address"])
            address = str.replace(address_old, "\n", "   ")
            categories = str(json.JSONEncoder().encode(business_add_cat_map[temp]["categories"]))
            content1 = "{\"business_id\": " + temp_key + ", "
            content2 = "\"full_address\": \"" + address + "\", \"categories\": " + categories + ", "
            content3 = "\"stars_reviews\": " + temp_value + "}\n"
            content = content1 + content2 + content3
            fw.write(content)
    fr_business.close()
    fr_review.close()
    fw.close()


construct_business_data_type("yelp_all_review_purify.json", "yelp_all_business_purify.json", "yelp_all_merged_purify.json")
#clean_json_review_file("yelp_academic_dataset_review.json", "yelp_sample_review_purifyAll.json")
#clean_json_business_file("yelp_academic_dataset_business.json", "yelp_all_business_purify.json")
#put_json_file_into_es("yelp_sample_review_purify10M.json", "yelp", "review")


"""
    es = Elasticsearch()
    ret = es.search(index="yelp", doc_type="review")
    print(ret["hits"]["total"])
"""
# , body={"query": {"match": {"stars": 5}}}

from datetime import datetime
dt = datetime.strptime("2015-6-1", '%Y-%m-%d')
dateInSeconds = int(dt.timestamp())
print(dateInSeconds - 24 * 60 * 60)
dt2 = datetime.strptime('2015-5-31', '%Y-%m-%d')
dateInSeconds2 = dt2.timestamp()
print(dateInSeconds2 == (dateInSeconds - 24 * 60 * 60))

a={}
a["a"] = 1
print(a)

def clean_json_business_file(source_file, target_file):
    fr = open(source_file, 'r', encoding='utf-8')
    passage = fr.readlines()
    fw = open(target_file, 'w', encoding='utf-8')
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        line = {"business_id": data["business_id"],
                "categories": data["categories"],
                "full_address": data["full_address"],
                }
        json_str = json.dumps(line)
        fw.write(json_str + "\n")
        count += 1
    fr.close()
    fw.close()


def clean_json_review_file(source_file, target_file):
    """
    :param source_file:
    :param target_file:
    :return:
    keep review_id, star, date, business_id, and delete other information in yelp_review
    """
    fr = open(source_file, 'r')
    passage = fr.readlines()
    fw = open(target_file, 'w')
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        line = {"review_id": data["review_id"],
                "stars": data["stars"],
                "date": data["date"],
                "business_id": data["business_id"],
                }
        json_str = json.dumps(line)
        fw.write(json_str + "\n")
        count += 1
    fr.close()
    fw.close()

def put_json_file_into_es(source_file, index_name, doc_type):
    es = Elasticsearch()
    f1 = open(source_file, 'r')
    passage = f1.readlines()
    length = len(passage)
    count = 0
    while count < length:
        print(passage[count])
        es.create(index=index_name, doc_type=doc_type, id=count,
                  body=passage[count])
        count += 1
    f1.close()


js = {"ead": "helloA", "d": "helloB", "c": "k"}
js2 = sorted(js.items(), key=lambda d: d[0])
print(js)
print(js2)



def put_json_file_into_es(source_file, index_name, doc_type):
    es = Elasticsearch()
    f1 = open(source_file, 'r')
    passage = f1.readlines()
    length = len(passage)
    count = 0
    while count < length:
        print(passage[count])
        es.create(index=index_name, doc_type=doc_type, id=count,
                  body=passage[count])
        count += 1
    f1.close()


def clean_json_business_file(source_file, target_file):
    fr = open(source_file, 'r', encoding='utf-8')
    passage = fr.readlines()
    fw = open(target_file, 'w', encoding='utf-8')
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        line = {"name": data["name"],
                "business_id": data["business_id"],
                "categories": data["categories"],
                "full_address": data["full_address"],
                "review_total": data["review_count"],
                "stars_avg": data["stars"]
                }
        json_str = json.dumps(line)
        fw.write(json_str + "\n")
        count += 1
    fr.close()
    fw.close()


def clean_json_review_file(source_file, target_file):
    """
    :param source_file:
    :param target_file:
    :return:
    keep review_id, star, date, business_id, and delete other information in yelp_review
    """
    fr = open(source_file, 'r')
    passage = fr.readlines()
    fw = open(target_file, 'w')
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        line = {"review_id": data["review_id"],
                "stars": data["stars"],
                "date": data["date"],
                "business_id": data["business_id"],
                }
        json_str = json.dumps(line)
        fw.write(json_str + "\n")
        count += 1
    fr.close()
    fw.close()

# clean_json_review_file("yelp_academic_dataset_review.json", "yelp_sample_review_purifyAll.json")
# clean_json_business_file("yelp_academic_dataset_business.json", "yelp_sample_business1M.json")
# put_json_file_into_es("yelp_sample_review_purify10M.json", "yelp", "review")


"""
    es = Elasticsearch()
    ret = es.search(index="yelp", doc_type="review")
    print(ret["hits"]["total"])
"""
# body={"query": {"match": {"stars": 5}}}
'''
'''
    for business in business_add_cat_map:
        #print(business_add_cat_map[business].items())
        business_add_cat_map[business]["stars_reviews"] = \
            sorted(business_add_cat_map[business]["stars_reviews"].items(), key=lambda d: d[0])
        business_add_cat_map[business] = sorted(business_add_cat_map[business].items(), key=lambda d: d[0])


def serializeToJson(target_file, business_review_map):
    fw = open(target_file, 'w', encoding='utf-8')
    for temp in business_review_map:
        fw.write(json.dumps(business_review_map.get(temp)) + "\n")
    fw.close()


def add_index_in_jsons_data(source_file, target_file, index_name, type_name):
    """
    :param source_file:
    :param target_file:
    :return:
    """
    f1 = open(source_file, 'r')
    passage = f1.readlines()
    length = len(passage)
    f2 = open(target_file, 'w')
    count = 0
    f2.write("[")
    while count < length - 1:
        f2.write("{\"index\": {\"_index\": \"" + index_name + "\", \"_type\": \"" + type_name + "\", \"_id\": %d}}," % count)
        f2.write("%s," % passage[count].strip())
        count += 1
    f2.write("{\"index\": {\"_index\": \"" + index_name + "\", \"_type\": \"" + type_name + "\", \"_id\": %d}}," % count)
    f2.write("%s" % passage[count].strip())
    f2.write("]")
    f1.close()
    f2.close()
'''