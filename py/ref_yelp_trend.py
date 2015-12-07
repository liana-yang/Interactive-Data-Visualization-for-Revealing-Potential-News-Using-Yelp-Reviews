# calculate yelp trend as analysis reference
def cal_yelp_trend(business_review_map):
    yelp_map = {}
    yelp_trend_stars_reviews = {}
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
    yelp_total_review_amount = 0
    for date in yelp_trend_stars_reviews:
        yelp_trend_stars_reviews[date]["avg_stars"] = yelp_trend_stars_reviews[date]["stars"]\
                                                      / yelp_trend_stars_reviews[date]["review_amount"]
        yelp_total_review_amount += yelp_trend_stars_reviews[date]["review_amount"]
    yelp_map["stars_reviews"] = yelp_trend_stars_reviews
    yelp_map["total_review_amount"] = yelp_total_review_amount
    return yelp_map

