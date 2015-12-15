/**
 * Created by Jiaqiang on 12/9/2015.
 */
function get_significant_terms_in_review_details_within_time_range(index, type, business_ids, term_num, start_time, end_time) {
    client.search({
        "index": index,
        "type": type,
        "searchType": "count",
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
            },
            "aggregations": {
                "most_sig_words": {
                    "significant_terms": {
                        "field": "text",
                        "size": term_num
                    }
                }
            }
        }
    }, function (error, most_sig_words) {
        var wordList = most_sig_words["aggregations"]["most_sig_words"]["buckets"];
        highlightWordInReview(wordList);
        console.log(wordList);
        return wordList;
    });
}