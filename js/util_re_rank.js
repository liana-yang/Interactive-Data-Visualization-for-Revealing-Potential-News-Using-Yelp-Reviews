/**
 * Created by Jiaqiang on 12/6/2015.
 */
function re_rank_in_date_range(index, type, start_date, end_date) {
    client.search({
        "index": index,
        "type": type,
        "size": 10
    }, function (error, business_list) {
        var business_triples = rank_business_list_in_time_interval(business_list["hits"]["hits"], start_date, end_date);
        renderBusinessListReRank(business_triples);
        //var business_ids_arr = business_triples.map(get_array_business_id);
        //get_business_list_based_on_ids(index, type, business_ids_arr.toString());//for line chart
    });
}
function get_array_business_id(business_triple) {
    return business_triple.business_id;
}

function rank_business_list_in_time_interval(business_array, start_date, end_date) {
    var len = business_array.length;
    var i = 0;
    var business_rank_list = new Array(len);
    business_rank_list.fill(0);
    while (i < len) {
        var abnormality_score = calculate_one_business_abnormality_score_in_time_interval(business_array[i], start_date, end_date);
        business_rank_list[i] = createPair(abnormality_score, business_array[i]["_source"]["business_id"], business_array[i]["_source"]["name"]);
        i++;
    }
    business_rank_list.sort(compareTripleDescend);
    return business_rank_list;
}
function compareTripleDescend(triple1, triple2) {
    if (triple1.abnormality_score <= triple2.abnormality_score) {
        return 1;
    } else {
        return -1;
    }
}
function createPair(abnormality_score, business_id, business_name) {
    var triple = Object.create(Business_triple);
    triple.abnormality_score = abnormality_score;
    triple.business_id = business_id;
    triple.name = business_name;
    return triple;
}
var Business_triple = {
    abnormality_score: 0,
    business_id: 0,
    name: ""
};
function calculate_one_business_abnormality_score_in_time_interval(business, start_date, end_date) {
    var max_diff_review_amount = 0;
    var max_diff_stars = 0;
    for (var date in business["_source"]["stars_reviews"]) {
        if (business["_source"]["stars_reviews"].hasOwnProperty(date)) {
            if (date >= start_date && date <= end_date) {
                var diff_review_amount = business["_source"]["stars_reviews"][date]["diff_review_amount"];
                var diff_stars = business["_source"]["stars_reviews"][date]["diff_stars"];
                if (max_diff_review_amount <= Math.abs(diff_review_amount)) {
                    max_diff_review_amount = Math.abs(diff_review_amount);
                }
                if (max_diff_stars <= Math.abs(diff_stars)) {
                    max_diff_stars = Math.abs(diff_stars);
                }
            }
        }
    }
    return max_diff_review_amount * (1 + max_diff_stars / 4);
}