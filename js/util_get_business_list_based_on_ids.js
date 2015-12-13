/**
 * Created by Jiaqiang on 12/13/2015.
 */
function get_business_list_based_on_ids(index, type, business_id, pos) {
    client.search({
        "index": index,
        "type": type,
        "body": {
            "query": {
                "multi_match": {
                    "query": business_id,
                    "fields": "business_id"
                }
            }
        }
    }, function (error, business) {
        global_business_list[pos] = business.hits.hits[0];
        if (pos == 9) {
            renderBusinessList(global_business_list);
        }
    });
}