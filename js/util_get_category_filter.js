/**
 * Created by Jiaqiang on 12/13/2015.
 */
function get_category_filter(index, type, cat_filter_num) {
    client.search({
        "index": index,
        "type": type,
        "searchType": "count",
        "body": {
            "aggs": {
                "cat_filter_num": {
                    "terms": {
                        "field": "categories",
                        "size": cat_filter_num
                    }
                }
            }
        }
    }, function (error, category_filter) {
        console.log(category_filter["aggregations"]["cat_filter_num"]["buckets"]);
        global_category_filter = category_filter["aggregations"]["cat_filter_num"]["buckets"];
        return category_filter["aggregations"]["cat_filter_num"]["buckets"];
    });
}