/**
 * Created by Jiaqiang on 12/6/2015.
 */
function get_businesses_list_based_on_abnormality_score(index, type, business_number, offset_number, location, category) {
    if (location == "" && category == "") {
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
            "from": offset_number,
            "sort": ["abnormality_score:desc"]
        }, function (error, business_list) {
            renderBusinessList(business_list["hits"]["hits"]);
        });
    }
    if (location == "" && category != "") {
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
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
            renderBusinessList(business_list["hits"]["hits"]);
        });
    }
    if (location != "" && category == "") {
        console.log("aaddac");
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
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
            renderBusinessList(business_list["hits"]["hits"]);
        });
    }
    if (location != "" && category != "") {
        console.log("d");
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
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
            renderBusinessList(business_list["hits"]["hits"]);
        });
    }
}

