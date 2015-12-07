/**
 * Created by Jiaqiang on 12/6/2015.
 */
function data_search() {
    client.search({
        "index": "yelp",
        "q": "business_id: *",
        //"q": "business_id: 1bMesJDIAG9GpRU1SwKMsg",
        "size": 10
        //"sort": ["max_diff_review_amount:desc", "max_diff_stars:desc"]
    }, function (error, business_list) {
        console.log(business_list["hits"]["hits"]);
        //console.log(business_list["hits"]["hits"][0]["_source"]);
        d3.select("#desc").selectAll("li")
            .data(business_list["hits"]["hits"])
            .enter().append("li")
            .text(function(d){return d["_source"]["max_diff_review_amount"] + "->" +d["_source"]["name"]});
        var ret = rank_business_list_in_time_interval(business_list["hits"]["hits"], "2013-12-30", "2014-12-30", 7);
        console.log(ret);
    });
}