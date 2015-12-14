/**
 * Created by Jiaqiang on 12/6/2015.
 */
function get_businesses_list_based_on_abnormality_score(index, type, size, offset_number, location, category) {
    if (location == "" && category == "") {
        client.search({
            "index": index,
            "type": type,
            "size": size,
            "from": offset_number,
            "sort": ["abnormality_score:desc"]
        }, function (error, business_list) {
            var businessList = business_list["hits"]["hits"];
            //get_date_and_review_amount(businessList[0]);
            var i = 0;
            var list_for_line = [];
            while (i < businessList.length) {
                list_for_line[i] = get_date_and_review_amount(businessList[i]);
                i++;
            }
            console.log(list_for_line);
            renderBusinessList(businessList);
            renderLineCharts(list_for_line);
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
            var businessList = business_list["hits"]["hits"];
            var i = 0;
            var list_for_line = [];
            while (i < businessList.length) {
                list_for_line[i] = get_date_and_review_amount(businessList[i]);
                i++;
            }
            renderBusinessList(businessList);
            renderLineCharts(list_for_line);
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
            console.log(business_list);
            var businessList = business_list["hits"]["hits"];
            var i = 0;
            var list_for_line = [];
            while (i < businessList.length) {
                list_for_line[i] = get_date_and_review_amount(businessList[i]);
                i++;
            }
            renderBusinessList(businessList);
            renderLineCharts(list_for_line);
        });
    }
    if (location != "" && category != "") {
        console.log("d");
        client.search({
            "index": index,
            "type": type,
            "size": size,
            "from": offset_number,
            "sort": ["abnormality_score:desc"],
            "body": {
                "query": {
                    "filtered": {
                        "query": [
                            {"match": {"full_address": location}},
                            {"match": {"categories": category}}
                        ]
                    }
                }
            }
        }, function (error, business_list) {
            console.log(business_list);
            var businessList = business_list["hits"]["hits"];
            var i = 0;
            var list_for_line = [];
            while (i < businessList.length) {
                list_for_line[i] = get_date_and_review_amount(businessList[i]);
                i++;
            }
            renderBusinessList(businessList);
            renderLineCharts(list_for_line);
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
            ret[i]["date"] = date;
            ret[i]["review_amount"] = business["_source"]["stars_reviews"][date]["review_amount"];
            ret[i]["avg_stars"] = business["_source"]["stars_reviews"][date]["avg_stars"];
        }
        i++;
    }
    console.log(ret);
    return ret;
}

