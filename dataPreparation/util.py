import json
from datetime import datetime


def get_last_sunday_in_seconds(date_in_string):
    dt = datetime.strptime(date_in_string, '%Y-%m-%d')
    date_in_seconds = int(dt.timestamp())
    last_sunday_in_seconds = date_in_seconds - (date_in_seconds - 4 * 24 * 3600) % (7 * 24 * 3600)
    return last_sunday_in_seconds


def serialize_for_es(target_files, original_map, index_name, type_name, size_per_file):
    count = 0
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


# calculate yelp trend as analysis reference
def cal_yelp_trend(business_review_map):
    yelp_map = {}
    yelp_trend_stars_reviews = {}
    date_business_amount_map = {}
    for business_id in business_review_map:
        for date in business_review_map[business_id]["stars_reviews"]:
            if date in yelp_trend_stars_reviews:
                yelp_trend_stars_reviews[date]["stars"] += business_review_map[business_id]["stars_reviews"][date]["stars"]
                yelp_trend_stars_reviews[date]["review_amount"] \
                    += business_review_map[business_id]["stars_reviews"][date]["review_amount"]
            else:
                yelp_trend_stars_reviews[date] = \
                    {"stars": business_review_map[business_id]["stars_reviews"][date]["stars"],
                     "review_amount": business_review_map[business_id]["stars_reviews"][date]["review_amount"]}
            if date in date_business_amount_map:
                date_business_amount_map[date] += 1
            else:
                date_business_amount_map[date] = 1
    yelp_total_review_amount = 0
    for date in yelp_trend_stars_reviews:
        yelp_trend_stars_reviews[date]["avg_stars"] = round(yelp_trend_stars_reviews[date]["stars"]\
                                                      / yelp_trend_stars_reviews[date]["review_amount"], 2)
        yelp_trend_stars_reviews[date]["avg_review_amount_per_business"] = \
            round(yelp_trend_stars_reviews[date]["review_amount"] / date_business_amount_map[date], 2)
        yelp_trend_stars_reviews[date]["business_amount_with_reviews"] = date_business_amount_map[date]
        yelp_total_review_amount += yelp_trend_stars_reviews[date]["review_amount"]
    yelp_map["stars_reviews"] = yelp_trend_stars_reviews
    # yelp_map["total_review_amount"] = yelp_total_review_amount
    return yelp_map
