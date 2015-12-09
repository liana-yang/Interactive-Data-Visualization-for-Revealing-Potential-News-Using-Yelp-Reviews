/**
 * Created by Jiaqiang on 12/6/2015.
 */
function get_businesses_list_based_on_abnormality_score(index, type, business_number, location, category) {
    if (location == "" && category == "") {
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
            "sort": ["abnormality_score:desc"]
        }, function (error, business_list) {
            console.log(business_list);
            console.log(business_list["hits"]["hits"][0]["_source"]);
            return business_list["hits"]["hits"][0]["_source"];
        });
    }
    if (location == "" && category != "") {
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
            "sort": ["abnormality_score:desc"],
            "body": {
                "query": {
                    "filtered": {
                        "query": {"match": {"categories": category}}
                    }
                }
            }
        }, function (error, business_list) {
            return business_list["hits"]["hits"][0]["_source"];
        });
    }
    if (location != "" && category == "") {
        console.log("aaddac");
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
            "sort": ["abnormality_score:desc"],
            "body": {
                "query": {
                    "filtered": {
                        "query": {"match": {"full_address": location}}
                    }
                }
            }
        }, function (error, business_list) {
            return business_list["hits"]["hits"][0]["_source"];
        });
    }
    if (location != "" && category != "") {
        console.log("d");
        client.search({
            "index": index,
            "type": type,
            "size": business_number,
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
            return business_list["hits"]["hits"][0]["_source"];
        });
    }
}

