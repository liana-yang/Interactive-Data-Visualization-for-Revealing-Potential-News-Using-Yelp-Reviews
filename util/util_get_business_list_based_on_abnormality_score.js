/**
 * Created by Jiaqiang on 12/6/2015.
 */
function get_businesses_list_based_on_abnormality_score(index, type, size, offset_number, location, category, sort_key) {
    if (location == "" && category == "") {
        client.search({
            "index": index,
            "type": type,
            "size": size,
            "from": offset_number,
            "sort": [sort_key + ":desc"]
        }, function (error, business_list) {
            renderFunctions(business_list);
        });
    }
    if (location == "" && category != "") {
        client.search({
            "index": index,
            "type": type,
            "size": size,
            "from": offset_number,
            "sort": ["abnormality_score:desc"],
            "body": {
                "query": {
                    "filtered": {
                        "query": {"match": {"categories": category}}
                    }
                }
            }
        }, function (error, business_list) {
            renderFunctions(business_list);
        });
    }
    if (location != "" && category == "") {
        client.search({
            "index": index,
            "type": type,
            "size": size,
            "from": offset_number,
            "sort": ["abnormality_score:desc"],
            "body": {
                "query": {
                    "filtered": {
                        "query": {"match": {"full_address": location}}
                    }
                }
            }
        }, function (error, business_list) {
            renderFunctions(business_list);
        });
    }
    if (location != "" && category != "") {
        client.search({
            "index": index,
            "type": type,
            "size": size,
            "from": offset_number,
            "sort": ["abnormality_score:desc"],
            "body": {
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"full_address": location}},
                            {"match": {"categories": category}}
                        ]
                    }
                }
            }

        }, function (error, business_list) {
            renderFunctions(business_list);
        });
    }
}
function get_date_and_review_amount(business) {
    var ret = [];
    var i = 0;
    var idx = 0;
    while (idx < Object.keys(business["_source"]["stars_reviews"]).length) {
        ret[idx] = {};
        idx++;
    }
    for (var date in business["_source"]["stars_reviews"]) {
        if (business["_source"]["stars_reviews"].hasOwnProperty(date)) {
            //if (date >= global_line_chart_start_time && date <= global_line_chart_end_time) {
                ret[i]["date"] = date;
                ret[i]["review_amount"] = business["_source"]["stars_reviews"][date]["review_amount"];
                ret[i]["avg_stars"] = business["_source"]["stars_reviews"][date]["avg_stars"];
                if (global_line_chart_max_review_amount < ret[i]["review_amount"]) {
                    global_line_chart_max_review_amount = ret[i]["review_amount"];
                }
            //}
        }
        i++;
    }
    ret.sort(compareBusinessTimeAscend);
    return ret;
}

function compareBusinessTimeAscend(business1, business2) {
    if (business1.date <= business2.date) {
        return -1;
    } else {
        return 1;
    }
}

function renderFunctions(business_list) {
    global_line_chart_max_review_amount = 0;
    var businessList = business_list["hits"]["hits"];
    var i = 0;
    var list_for_line = [];
    while (i < businessList.length) {
        list_for_line[i] = get_date_and_review_amount(businessList[i]);
        i++;
    }
    console.log(global_line_chart_max_review_amount);
    renderBusinessList(businessList);
    renderLineCharts(list_for_line);
    $(window).resize(function () {
        renderLineCharts(list_for_line);
    });

    get_category_filter("yelp", "business1208v3", 50);
    renderLocation_filter();
}

