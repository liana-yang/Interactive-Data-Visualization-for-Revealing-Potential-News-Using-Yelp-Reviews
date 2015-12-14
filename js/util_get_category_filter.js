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
    }, function (error, category_filters) {
        console.log(category_filters["aggregations"]["cat_filter_num"]["buckets"]);
        global_category_filter = category_filters["aggregations"]["cat_filter_num"]["buckets"].map(get_key());
        console.log(global_category_filter);
        return category_filter["aggregations"]["cat_filter_num"]["buckets"];
    });
}
function get_key(category_filter) {
    console.log(category_filter);
    return category_filter["key"];
}