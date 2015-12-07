# -- coding: utf-8 --
# >> pip install elasticsearch
# purify the data and keep useful parts
# upload data into es
import json
from util import serialize_for_es
from util import files_name_gen
from ref_yelp_trend import cal_yelp_trend
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
                dt = datetime.strptime(key_date, '%Y-%m-%d')
                date_in_seconds = int(dt.timestamp())
                business_map[key_business]["stars_reviews"][key_date] = \
                    {"review_amount": 1, "stars": star_amount, "date_in_seconds": date_in_seconds, "avg_stars": 0}
        count += 1
    business_review_map = business_map
    return business_review_map


def add_avg_stars_in_business_review_map(business_review_map):
    for business in business_review_map:
        for date in business_review_map[business]["stars_reviews"]:
            stars_amount = business_review_map[business]["stars_reviews"][date]["stars"]
            review_amount = business_review_map[business]["stars_reviews"][date]["review_amount"]
            business_review_map[business]["stars_reviews"][date]["avg_stars"] = stars_amount / review_amount
    business_review_map_with_avg_stars = business_review_map
    return business_review_map_with_avg_stars


def add_stars_reviews_diff_in_business_review_map(business_review_map):
    for temp in business_review_map:
        m = {}
        max_diff_stars = max_diff_review_amount = diff_stars = 0
        for date in business_review_map.get(temp)["stars_reviews"]:
            m[business_review_map.get(temp)["stars_reviews"][date]["date_in_seconds"]] = date
        for date in business_review_map.get(temp)["stars_reviews"]:
            cur_date_seconds = business_review_map.get(temp)["stars_reviews"][date]["date_in_seconds"]
            stars_reviews_item = business_review_map.get(temp)["stars_reviews"]
            last_date_seconds = cur_date_seconds - 24 * 3600
            if last_date_seconds in m:
                diff_stars = stars_reviews_item[date]["avg_stars"] - stars_reviews_item[m.get(last_date_seconds)]["avg_stars"]
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

            next_date_seconds = cur_date_seconds + 24 * 3600
            if next_date_seconds not in m:
                diff_review_amount = -stars_reviews_item[date]["review_amount"]
                if abs(max_diff_review_amount) < abs(diff_review_amount):
                    max_diff_review_amount = diff_review_amount
                if abs(stars_reviews_item[date]["diff_review_amount"]) < abs(diff_review_amount):
                    stars_reviews_item[date]["diff_review_amount"] = diff_review_amount
        business_review_map.get(temp)["max_diff_stars"] = max_diff_stars
        business_review_map.get(temp)["max_diff_review_amount"] = max_diff_review_amount
        business_review_map[temp]["abnormality_score"] = max_diff_stars + max_diff_review_amount
    return business_review_map


def construct_business_review_file(source_file_business, source_file_review, target_file_basic_name, target_file_number, index_name, type_name):
    business_map = get_business_map(source_file_business)
    business_review_map = get_business_review_map(source_file_review, business_map)
    business_review_map_with_avg_stars = add_avg_stars_in_business_review_map(business_review_map)
    business_review_map_with_diff = add_stars_reviews_diff_in_business_review_map(business_review_map_with_avg_stars)
    name_list = files_name_gen(target_file_basic_name, target_file_number)
    serialize_for_es(name_list, business_review_map_with_diff, index_name, type_name)

    # name_list2 = files_name_gen("yelp_trend", 1)
    # yelp_map = cal_yelp_trend(business_review_map_with_avg_stars)
    # serialize_for_es(name_list2, yelp_map, "yelp", "yelp_trend")
construct_business_review_file("yelp_academic_dataset_business.json", "yelp_academic_dataset_review.json", "target", 2, "yelp", "business1206")
# construct_business_review_file("yelp_sample_business1M.json", "yelp_sample_review1M.json", "target1206", 1, "yelp", "business1206")