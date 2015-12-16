# -- coding: utf-8 --
# >> pip install elasticsearch
# purify the data and keep useful parts
# upload data into es

import json
from util import serialize_for_es
from util import files_name_gen
from util import get_last_sunday_in_seconds
from util import cal_yelp_trend
from datetime import datetime


def get_business_map(source_file_business):
    fr_business = open(source_file_business, 'r', encoding='utf-8')
    business = fr_business.readlines()
    fr_business.close()
    business_map = {}
    count = 0
    category_dict = {}
    category_list = []
    while count < len(business):
        data = json.loads(business[count])
        key_business = data["business_id"]
        stars_review = {}
        new_address = str.replace(data["full_address"], "\n", "  ")
        business_map[key_business] = {"business_id": data["business_id"], "name": data["name"],
                                              "full_address": new_address, "categories": data["categories"],
                                              "review_total": data["review_count"], "stars_avg": data["stars"],
                                              "stars_reviews": stars_review, "state": data["state"]}
        count += 1
        categories = data["categories"]
        category_idx = 0
        while category_idx < len(categories):
            cat = categories[category_idx]
            if cat in category_dict:
                category_dict[cat] += 1
            else:
                category_dict[cat] = 1
            category_idx += 1
    for temp in category_dict:
        cat = CategoryPair(temp, category_dict[temp])
        category_list.append(cat)
    category_list_sorted = sorted(category_list, key=lambda cat: -cat.frequency)
    fw = open("category.txt", 'w', encoding='utf-8')
    category_list_idx = 0
    while category_list_idx < len(category_list_sorted) - 1:
        fw.write(str(category_list_sorted[category_list_idx].name))
        fw.write(str(","))
        category_list_idx += 1
    fw.write(str(category_list_sorted[category_list_idx].name))
    fw.close()
    return business_map


class CategoryPair(object):
    def __init__(self, name, frequency):
        self.name = name
        self.frequency = frequency


def get_business_review_map(source_file_review, business_map):
    fr_review = open(source_file_review, 'r', encoding='utf-8')
    passage = fr_review.readlines()
    fr_review.close()
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        key_business = data["business_id"]
        key_date = data["date"]
        last_sunday_of_key_date_in_seconds = get_last_sunday_in_seconds(key_date)
        last_sunday_of_key_date = datetime.fromtimestamp(last_sunday_of_key_date_in_seconds).strftime("%Y-%m-%d")
        star_amount = data["stars"]
        if key_business in business_map:
            if last_sunday_of_key_date in business_map[key_business]["stars_reviews"]:
                item = business_map[key_business]["stars_reviews"][last_sunday_of_key_date]
                item["stars"] += data["stars"]
                item["review_amount"] += 1
            else:
                business_map[key_business]["stars_reviews"][last_sunday_of_key_date] = \
                    {"review_amount": 1, "stars": star_amount, "date_in_seconds": last_sunday_of_key_date_in_seconds, "avg_stars": 0}
        count += 1
    business_review_map = business_map
    return business_review_map


def add_avg_stars_in_business_review_map(business_review_map):
    for business in business_review_map:
        for date in business_review_map[business]["stars_reviews"]:
            stars_amount = business_review_map[business]["stars_reviews"][date]["stars"]
            review_amount = business_review_map[business]["stars_reviews"][date]["review_amount"]
            business_review_map[business]["stars_reviews"][date]["avg_stars"] = round(stars_amount / review_amount, 2)
    business_review_map_with_avg_stars = business_review_map
    return business_review_map_with_avg_stars


def add_stars_reviews_diff_in_business_review_map(business_review_map):
    for temp in business_review_map:
        m = {}
        max_diff_stars = max_diff_review_amount = diff_stars = 0
        max_diff_stars_20150101 = max_diff_review_amount_20150101 = 0
        max_diff_stars_20130101 = max_diff_review_amount_20130101 = 0
        max_diff_stars_20110101 = max_diff_review_amount_20110101 = 0
        for date in business_review_map.get(temp)["stars_reviews"]:
            m[business_review_map.get(temp)["stars_reviews"][date]["date_in_seconds"]] = date
        for date in business_review_map.get(temp)["stars_reviews"]:
            cur_date_seconds = business_review_map.get(temp)["stars_reviews"][date]["date_in_seconds"]
            stars_reviews_item = business_review_map.get(temp)["stars_reviews"]
            last_date_seconds = cur_date_seconds - 7 * 24 * 3600
            if last_date_seconds in m:
                diff_stars = stars_reviews_item[date]["avg_stars"] - stars_reviews_item[m.get(last_date_seconds)]["avg_stars"]
                diff_review_amount = stars_reviews_item[date]["review_amount"] - stars_reviews_item[m.get(last_date_seconds)]["review_amount"]
                if abs(max_diff_stars) < abs(diff_stars):
                    max_diff_stars = diff_stars
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount

                if date >= "2015-01-01" and abs(max_diff_stars_20150101) < abs(diff_stars):
                    max_diff_stars_20150101 = diff_stars
                if date >= "2015-01-01" and abs(max_diff_review_amount_20150101) < abs(diff_review_amount):
                    max_diff_review_amount_20150101 = diff_review_amount

                if date >= "2013-01-01" and abs(max_diff_stars_20130101) < abs(diff_stars):
                    max_diff_stars_20130101 = diff_stars
                if date >= "2013-01-01" and abs(max_diff_review_amount_20130101) < abs(diff_review_amount):
                    max_diff_review_amount_20130101 = diff_review_amount

                if date >= "2011-01-01" and abs(max_diff_stars_20110101) < abs(diff_stars):
                    max_diff_stars_20110101 = diff_stars
                if date >= "2011-01-01" and abs(max_diff_review_amount_20110101) < abs(diff_review_amount):
                    max_diff_review_amount_20110101 = diff_review_amount
            else:
                diff_review_amount = stars_reviews_item[date]["review_amount"]
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount
            stars_reviews_item[date]["diff_stars"] = diff_stars
            stars_reviews_item[date]["diff_review_amount"] = diff_review_amount

            next_date_seconds = cur_date_seconds + 7 * 24 * 3600
            if next_date_seconds not in m:
                diff_review_amount = -stars_reviews_item[date]["review_amount"]
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount
                if abs(stars_reviews_item[date]["diff_review_amount"]) < abs(diff_review_amount):
                    stars_reviews_item[date]["diff_review_amount"] = diff_review_amount
        business_review_map.get(temp)["max_diff_stars"] = round(max_diff_stars, 2)
        business_review_map.get(temp)["max_diff_review_amount"] = round(max_diff_review_amount, 2)
        business_review_map.get(temp)["max_diff_stars_20150101"] = round(max_diff_stars_20150101, 2)
        business_review_map.get(temp)["max_diff_review_amount_20150101"] = round(max_diff_review_amount_20150101, 2)
        business_review_map.get(temp)["max_diff_stars_20130101"] = round(max_diff_stars_20130101, 2)
        business_review_map.get(temp)["max_diff_review_amount_20130101"] = round(max_diff_review_amount_20130101, 2)
        business_review_map.get(temp)["max_diff_stars_20110101"] = round(max_diff_stars_20110101, 2)
        business_review_map.get(temp)["max_diff_review_amount_20110101"] = round(max_diff_review_amount_20110101, 2)
        business_review_map[temp]["abnormality_score"] = round(abs(max_diff_review_amount) * (1 + abs(max_diff_stars) / 4), 2)
        business_review_map[temp]["abnormality_score_20150101"] = round(abs(max_diff_review_amount_20150101) * (1 + abs(max_diff_stars_20150101) / 4), 2)
        business_review_map[temp]["abnormality_score_20130101"] = round(abs(max_diff_review_amount_20130101) * (1 + abs(max_diff_stars_20130101) / 4), 2)
        business_review_map[temp]["abnormality_score_20110101"] = round(abs(max_diff_review_amount_20110101) * (1 + abs(max_diff_stars_20110101) / 4), 2)

        # normalize diff stars and diff reviews
    return business_review_map


def construct_business_review_file(source_file_business, source_file_review, target_file_basic_name, target_file_number, index_name, type_name):
    business_map = get_business_map(source_file_business)
    business_review_map = get_business_review_map(source_file_review, business_map)
    business_review_map_with_avg_stars = add_avg_stars_in_business_review_map(business_review_map)
    business_review_map_with_diff = add_stars_reviews_diff_in_business_review_map(business_review_map_with_avg_stars)
    name_list = files_name_gen(target_file_basic_name, target_file_number)
    serialize_for_es(name_list, business_review_map_with_diff, index_name, type_name, 10000)

    name_list2 = files_name_gen("yelp_trend", 1)
    yelp_map = cal_yelp_trend(business_review_map_with_avg_stars)
    serialize_for_es(name_list2, yelp_map, "yelp", "yelp_trend", 100000)
construct_business_review_file("yelp_academic_dataset_business.json", "yelp_academic_dataset_review.json", "business", 30, "yelp", "business1216")
# construct_business_review_file("yelp_sample_business1M.json", "yelp_sample_review1M.json", "business", 1, "yelp", "business1216")