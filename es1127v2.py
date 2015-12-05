# -- coding: utf-8 --
# >> pip install elasticsearch
# purify the data and keep useful parts
# upload data into es
import json
from datetime import datetime


def get_business_map(source_file_business):
    fr_business = open(source_file_business, 'r', encoding='utf-8')
    business = fr_business.readlines()
    fr_business.close()
    business_map = {}
    count = 0
    while count < len(business):
        data = json.loads(business[count])
        key_business = data["business_id"]
        stars_review = {}
        new_address = str.replace(data["full_address"], "\n", "  ")
        business_map[key_business] = {"business_id": data["business_id"], "name": data["name"],
                                              "full_address": new_address, "categories": data["categories"],
                                              "review_total": data["review_count"], "stars_avg": data["stars"],
                                              "stars_reviews": stars_review}
        count += 1
    return business_map


def get_business_review_map(source_file_review, business_map):
    fr_review = open(source_file_review, 'r', encoding='utf-8')
    passage = fr_review.readlines()
    fr_review.close()
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        key_business = data["business_id"]
        key_date = data["date"]
        star_amount = data["stars"]
        if key_business in business_map:
            if key_date in business_map[key_business]["stars_reviews"]:
                item = business_map[key_business]["stars_reviews"][key_date]
                item["stars"] += data["stars"]
                item["review_amount"] += 1
            else:
                business_map[key_business]["stars_reviews"][key_date] = \
                    {"review_amount": 1, "stars": star_amount}
        count += 1
    return business_map


def add_stars_reviews_diff_in_business_review_map(business_review_map):
    for temp in business_review_map:
        m = {}
        max_diff_stars = max_diff_review_amount = diff_stars = 0
        for date in business_review_map.get(temp)["stars_reviews"]:
            dt = datetime.strptime(date, '%Y-%m-%d')
            m[dt.timestamp()] = date
        for date in business_review_map.get(temp)["stars_reviews"]:
            dt = datetime.strptime(date, '%Y-%m-%d')
            last_date_seconds = dt.timestamp() - 24 * 3600
            stars_reviews_item = business_review_map.get(temp)["stars_reviews"]
            if last_date_seconds in m:
                diff_stars = stars_reviews_item[date]["stars"] - stars_reviews_item[m.get(last_date_seconds)]["stars"]
                diff_review_amount = stars_reviews_item[date]["review_amount"] - stars_reviews_item[m.get(last_date_seconds)]["review_amount"]
                if abs(max_diff_stars) < abs(diff_stars):
                    max_diff_stars = diff_stars
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount
            else:
                diff_review_amount = stars_reviews_item[date]["review_amount"]
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount
            stars_reviews_item[date]["diff_stars"] = diff_stars
            stars_reviews_item[date]["diff_review_amount"] = diff_review_amount

            next_date_seconds = dt.timestamp() + 24 * 3600
            if next_date_seconds not in m:
                diff_review_amount = -stars_reviews_item[date]["review_amount"]
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount
                if abs(stars_reviews_item[date]["diff_review_amount"]) < abs(diff_review_amount):
                    stars_reviews_item[date]["diff_review_amount"] = diff_review_amount
        business_review_map.get(temp)["max_diff_stars"] = max_diff_stars
        business_review_map.get(temp)["max_diff_review_amount"] = max_diff_review_amount
    return business_review_map


def serialize_for_es(target_files, business_review_map, index_name, type_name):
    count = 0
    for temp in business_review_map:
        if count % 10000 == 0:
            fw = open(target_files[int(count/10000)], 'w', encoding='utf-8')
            fw.write("[")
        fw.write("{\"index\": {\"_index\": \"" + index_name + "\", \"_type\": \"" + type_name + "\", \"_id\": %d}}," % count)
        fw.write(json.dumps(business_review_map.get(temp)))
        count += 1
        if count % 10000 == 0 or count == len(business_review_map):
            fw.write("]")
            fw.close()
        else:
            fw.write(",")


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
delete_serialize_for_es("delete_file.json", "yelp", "business1128v2")

def files_name_gen(file_basic_name, number):
    file_name_list = [file_basic_name + str(x) + ".json" for x in range(number)]
    return file_name_list


def construct_business_review_file(source_file_business, source_file_review, target_file_basic_name, target_file_number, index_name, type_name):
    business_map = get_business_map(source_file_business)
    business_review_map = get_business_review_map(source_file_review, business_map)
    business_review_map_with_diff = add_stars_reviews_diff_in_business_review_map(business_review_map)
    name_list = files_name_gen(target_file_basic_name, target_file_number)
    serialize_for_es(name_list, business_review_map_with_diff, index_name, type_name)
# construct_business_review_file("yelp_academic_dataset_business.json", "yelp_academic_dataset_review.json", "target", 10, "yelp", "business1128v2")
# construct_business_review_file("yelp_sample_business1M.json", "yelp_sample_review1M.json", "target", 5, "yelp", "business1128")


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

