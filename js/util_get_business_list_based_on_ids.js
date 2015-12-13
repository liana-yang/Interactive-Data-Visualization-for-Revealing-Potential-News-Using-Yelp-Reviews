/**
 * Created by Jiaqiang on 12/13/2015.
 */
function get_business_list_based_on_ids(index, type, business_ids) {
    client.search({
        "index": index,
        "type": type,
        "body": {
            "query": {
                "multi_match": {
                    "query": business_ids,
                    "fields": "business_id"
                }
            }
        }
    }, function (error, business_list) {
        console.log(business_list);
        renderBusinessList(business_list["hits"]["hits"])
    });
}