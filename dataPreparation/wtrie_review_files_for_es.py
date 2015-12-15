# serialize yelp review files into es format
import json
from util import serialize_for_es
from util import files_name_gen


def get_review_detail_map(source_file_review):
    fr_review = open(source_file_review, 'r', encoding='utf-8')
    passage = fr_review.readlines()
    fr_review.close()
    count = 0
    review_detail_map = {}
    while count < len(passage):
        data = json.loads(passage[count])
        review_detail_map[data["review_id"]] = data
        count += 1
    return review_detail_map


def construct_review_detail_file(source_file_review, target_file_basic_name, target_file_number, index_name, type_name):
    review_detail_map = get_review_detail_map(source_file_review)
    files_name_list = files_name_gen(target_file_basic_name, target_file_number)
    serialize_for_es(files_name_list, review_detail_map, index_name, type_name, 100000)


# construct_review_detail_file("yelp_sample_review1M.json", "review", 100, "yelp", "review1208v3")
construct_review_detail_file("yelp_academic_dataset_review.json", "review", 100, "yelp", "review1208v3")

