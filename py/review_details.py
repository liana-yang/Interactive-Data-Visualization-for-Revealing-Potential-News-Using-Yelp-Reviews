# serialize yelp review files into es format
import json
from datetime import datetime
from util import serialize_for_es
from util import files_name_gen


def get_business_id_map(source_file_business):
    fr_business = open(source_file_business, 'r', encoding='utf-8')
    business = fr_business.readlines()
    fr_business.close()
    business_id_map = {}
    count = 0
    while count < len(business):
        data = json.loads(business[count])
        business_id_map[data["business_id"]] = {}
        count += 1
    return business_id_map


def get_review_detail_map(source_file_review, business_id_map):
    fr_review = open(source_file_review, 'r', encoding='utf-8')
    passage = fr_review.readlines()
    fr_review.close()
    count = 0
    while count < len(passage):
        data = json.loads(passage[count])
        key_business = data["business_id"]
        key_date = data["date"]
        if key_business in business_id_map:
            if key_date in business_id_map[key_business]:
                business_id_map[key_business][key_date][data["review_id"]] = {"review_id": data["review_id"],
                        "user_id": data["user_id"], "stars": data["stars"], "text": data["text"]}
            else:
                dt = datetime.strptime(key_date, '%Y-%m-%d')
                date_in_seconds = int(dt.timestamp())
                business_id_map[key_business][key_date] = {"date_in_seconds": date_in_seconds,
                        data["review_id"]: {"review_id": data["review_id"],"user_id": data["user_id"],
                                            "stars": data["stars"], "text": data["text"]}}
        count += 1
    review_detail_map = business_id_map
    return review_detail_map


def construct_review_detail_file(source_file_business, source_file_review, target_file_basic_name, target_file_number, index_name, type_name):
    files_name_list = files_name_gen(target_file_basic_name, target_file_number)
    business_id_map = get_business_id_map(source_file_business)
    review_detail_map = get_review_detail_map(source_file_review, business_id_map)
    serialize_for_es(files_name_list, review_detail_map, index_name, type_name)


construct_review_detail_file("yelp_sample_business1M.json", "yelp_sample_review1M.json", "review_details", 1, "yelp", "review_details")
