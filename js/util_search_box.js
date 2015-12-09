/**
 * Created by Jiaqiang on 12/8/2015.
 */
function search_box(index, review_num, terms) {
    client.search({
        "index": index,
        "size": review_num,
        "body": {
            "query": {
                "multi_match": {
                    "query": terms,
                    "fields": ["name", "text"]
                }
            }
        }
    }, function (error, business_list) {
        console.log(business_list);
        console.log(business_list["hits"]["hits"][0]["_source"]);
        return business_list["hits"]["hits"][0]["_source"];
    });
}