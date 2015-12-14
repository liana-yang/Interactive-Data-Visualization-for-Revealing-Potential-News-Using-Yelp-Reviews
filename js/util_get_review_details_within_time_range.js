/**
 * Created by Jiaqiang on 12/8/2015.
 */
function get_review_details_within_time_range(index, type, business_ids, review_num, data_order, start_time, end_time) {
    client.search({
        "index": index,
        "type": type,
        "size": review_num,
        "sort": ["date:" + data_order],
        "body": {
            "query": {
                "filtered": {
                    "query": {
                        "multi_match": {
                            "query": business_ids,
                            "fields": "business_id"
                        }
                    },
                    "filter": {
                        "range": {"date": {"gte": start_time, "lte": end_time}}
                    }
                }
            }
        }
    }, function (error, review_list) {
        console.log(review_list);
        renderReviewList(review_list["hits"]["hits"])
    });
}