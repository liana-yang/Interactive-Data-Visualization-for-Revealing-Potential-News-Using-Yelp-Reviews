/**
 * Created by Jiaqiang on 12/6/2015.
 */
function rank_business_list_in_time_interval(business_array, start_date, end_date, time_interval) {
    var len = business_array.length;
    var i = 0;
    var business_ranking_max_diff_review_amount = new Array(len);
    business_ranking_max_diff_review_amount.fill(0);
    var business_ranking_max_diff_stars = new Array(len);
    business_ranking_max_diff_stars.fill(0);
    while (i < len) {
        var sum_array = sum_one_business_review_stars_in_time_interval(business_array[i], start_date, end_date, time_interval);
        var max_diff_array = calculate_one_business_max_diff_review_stars_in_time_interval(sum_array[0], sum_array[1]);
        business_ranking_max_diff_review_amount[i] = createPair(max_diff_array[0], business_array[i]["_source"]["business_id"]);
        business_ranking_max_diff_stars[i] = createPair(max_diff_array[1], business_array[i]["_source"]["business_id"]);
        i++;
    }
    business_ranking_max_diff_review_amount.sort(comparePairAscend);
    business_ranking_max_diff_stars.sort(comparePairAscend);
    return [business_ranking_max_diff_review_amount, business_ranking_max_diff_stars];
}
function comparePairAscend(pair1, pair2) {
    if (pair1.number <= pair2.number) {
        return 1;
    } else {
        return -1;
    }
}
function createPair(amount, business_id) {
    var pair = Object.create(Pair);
    pair.number = amount;
    pair.business_id = business_id;
    return pair;
}
var Pair = {
    number: 0,
    business_id: 0
};
function calculate_one_business_max_diff_review_stars_in_time_interval(sum_review_amount_array, sum_stars_array) {
    var len = sum_review_amount_array.length;
    var max_diff_review_amount = 0;
    var max_diff_stars = 0;
    var i = 1;
    while (i < len) {
        var diff_review_amount = sum_review_amount_array[i] - sum_review_amount_array[i - 1];
        if (Math.abs(max_diff_review_amount) < diff_review_amount) {
            max_diff_review_amount = diff_review_amount;
        }
        var diff_stars_avg = sum_stars_array[i] / sum_review_amount_array[i] -
            sum_stars_array[i - 1] / sum_review_amount_array[i - 1];
        if (Math.abs(max_diff_stars) < diff_stars_avg) {
            max_diff_stars = diff_stars_avg;
        }
        i++;
    }
    return [max_diff_review_amount, max_diff_stars];
}
function sum_one_business_review_stars_in_time_interval(business, start_date, end_date, time_interval) {
    var start_seconds = Date.parse(start_date);
    var end_seconds = Date.parse(end_date);
    var interval_seconds = time_interval * 24 * 3600 * 1000;
    var len = Math.floor((end_seconds - start_seconds)/interval_seconds);//ignore dates not enough for interval
    var new_start_seconds = start_seconds + (end_seconds - start_seconds) % interval_seconds;
    var sum_review_amount_array = new Array(len);
    sum_review_amount_array.fill(0);
    var sum_stars_array = new Array(len);
    sum_stars_array.fill(0);
    $.each(business["_source"]["stars_reviews"], function(date) {
        var seconds = business["_source"]["stars_reviews"][date]["date_in_seconds"] * 1000;
        if (seconds > new_start_seconds && seconds < end_seconds) {
            var amount = business["_source"]["stars_reviews"][date]["review_amount"];
            var stars = business["_source"]["stars_reviews"][date]["stars"];
            var pos = Math.floor((seconds - new_start_seconds)/interval_seconds);
            sum_review_amount_array[pos] += amount;
            sum_stars_array[pos] += stars;
        }
    });
    return [sum_review_amount_array, sum_stars_array];
}