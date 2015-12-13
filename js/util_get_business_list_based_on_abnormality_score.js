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
            console.log(businessList);
            var i = 0;
            var list_for_line = [];
            while (i < businessList.length) {
                list_for_line[i] = get_date_and_review_amount(businessList[i]);
                i++;
            }
            console.log(list_for_line);
            renderBusinessList(businessList);
            renderLineCharts(businessList);
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
            renderBusinessList(businessList);
            renderLineCharts(businessList);
        });
    }
    if (location != "" && category == "") {
        console.log("aaddac");
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
            var businessList = business_list["hits"]["hits"];
            renderBusinessList(businessList);
            renderLineCharts(businessList);
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
            renderBusinessList(businessList);
            renderLineCharts(businessList);
        });
    }
}
function get_date_and_review_amount(business) {
    var ret = [[]];
    var i = 0;
    for (var date in business["_source"]["stars_reviews"]) {
        if (business["_source"]["stars_reviews"].hasOwnProperty(date)) {
            ret[i][0] = date;
            ret[i][1] = business["_source"]["stars_reviews"][date]["review_amount"];
            ret[i][2] = business["_source"]["stars_reviews"][date]["avg_stars"];
        }
    }
    return ret;
}

