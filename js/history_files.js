/**
 * Created by Jiaqiang on 11/17/2015.
 */

/*
 client.search({
 "index": "yelp",
 "q": "business_id: *",
 "size": 10,
 "from": 10,
 "sort": ["max_diff_review_amount:desc", "max_diff_stars:desc"]
 }, function (error, business_list) {
 //console.log(business_list["hits"]["hits"]);
 //console.log(business_list["hits"]["hits"][0]["_source"]);
 d3.select("#desc2").selectAll("li")
 .data(business_list["hits"]["hits"])
 .enter().append("li")
 .text(function(d){return d["_source"]["max_diff_review_amount"] + "->" +d["_source"]["name"]});
 });
 client.search({
 "index": "yelp",
 "q": "business_id: *",
 "size": 10,
 "sort": ["max_diff_review_amount", "max_diff_stars"]
 }, function (error, business_list) {
 //console.log(business_list["hits"]["hits"]);
 //console.log(business_list["hits"]["hits"][0]["_source"]);
 d3.select("#asc").selectAll("li")
 .data(business_list["hits"]["hits"])
 .enter().append("li")
 .text(function(d){return d["_source"]["max_diff_review_amount"] + "->" +d["_source"]["name"]});
 });
 client.search({
 "index": "yelp",
 "q": "business_id: *",
 "size": 10,
 "from": 10,
 "sort": ["max_diff_review_amount", "max_diff_stars"]
 }, function (error, business_list) {
 //console.log(business_list["hits"]["hits"]);
 //console.log(business_list["hits"]["hits"][0]["_source"]);
 d3.select("#asc2").selectAll("li")
 .data(business_list["hits"]["hits"])
 .enter().append("li")
 .text(function(d){return d["_source"]["max_diff_review_amount"] + "->" +d["_source"]["name"]});
 });

var client = new $.es.Client({
    host: 'http://localhost:9200'
});
client.ping({
    requestTimeout: 30000,

    // undocumented params are appended to the query string
    hello: "elasticsearch"
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});
var ret = 0;
var dateHashMap;
dataLoad();
function dataLoad(){
    client.search({
        "index": "yelp",
        "type": "business112503",
        "size": 5000,
         "body": {
             "query": {
                 "bool": {
                     "must": [
                         {"match": {"business_id": "4bEjOyTaDG24SY5TxsaUNQ"}},
                         //{"match": {"stars_reviews.2004-10-12.review_amount": 1}}
                     ]
                 }
             }
         }
    }, function(error, response){
        if (error) {
            console.log("error!");
        } else {
            ret = response;
            var arr = calculateMax(ret);
            var arrMaxDiffStarsBusiness = arr[0];
            var arrMaxDiffReviewsBusiness = arr[1];
            console.log(arrMaxDiffStarsBusiness.slice(0, 20));
            console.log(arrMaxDiffReviewsBusiness.slice(0, 20));
            console.log(arrMaxDiffStarsBusiness.slice(arrMaxDiffStarsBusiness.length - 20).reverse());
            console.log(arrMaxDiffReviewsBusiness.slice(arrMaxDiffReviewsBusiness.length - 20).reverse());
        }
    });
}
function calculateMax(ret) {
    var pos = ret["hits"]["hits"].length - 1;
    var arrMaxDiffStarsBusiness = [];
    var arrMaxDiffReviewsBusiness = [];
    while (pos >= 0) {
        var maxDiffStars = 0;
        var maxDiffReviews = 0;
        var business_id = ret["hits"]["hits"][pos]["_source"]["business_id"];
        dateHashMap = new Map();
        $.each(ret["hits"]["hits"][pos]["_source"]["stars_reviews"], function(key) {
            dateHashMap.set(Date.parse(key), key);
        });
        $.each(ret["hits"]["hits"][pos]["_source"]["stars_reviews"], function(dateStr, item) {
            var lastDateNum = Date.parse(dateStr) - 24 * 60 * 60 * 1000;
            var dateStars = item["stars"];
            var dateReviewAmount = item["review_amount"];
            if (dateHashMap.has(lastDateNum)) {
                var lastDateStr = dateHashMap.get(lastDateNum);
                var lastDateStars = ret["hits"]["hits"][pos]["_source"]["stars_reviews"][lastDateStr]["stars"];
                var lastDateReviewAmount = ret["hits"]["hits"][pos]["_source"]["stars_reviews"][lastDateStr]["review_amount"];
                var diffStars = dateStars/dateReviewAmount - lastDateStars/lastDateReviewAmount;
                var diffReviews = dateReviewAmount - lastDateReviewAmount;
                maxDiffStars = (Math.abs(maxDiffStars) < Math.abs(diffStars)) ? diffStars : maxDiffStars;
                maxDiffReviews = (Math.abs(maxDiffReviews) < Math.abs(diffReviews)) ? diffReviews : maxDiffReviews;
            } else {
                //maxDiffStars = maxDiffStars < (dateStars/dateReviewAmount) ? (dateStars/dateReviewAmount) : maxDiffStars;
                //ignore if no stars in pre or post day
                maxDiffReviews = Math.abs(maxDiffReviews) < dateReviewAmount ? dateReviewAmount : maxDiffReviews;
            }
            var nextDateNum = Date.parse(dateStr) + 24 * 60 * 60 * 1000;
            if (!dateHashMap.has(nextDateNum)) {//consider date has no info only
                maxDiffReviews = Math.abs(maxDiffReviews) < dateReviewAmount ? -dateReviewAmount : maxDiffReviews;
            }

        });
        arrMaxDiffStarsBusiness.push(createPair(maxDiffStars, business_id));
        arrMaxDiffReviewsBusiness.push(createPair(maxDiffReviews, business_id));
        pos--;
    }
    arrMaxDiffStarsBusiness.sort(comparePairAscend);
    arrMaxDiffReviewsBusiness.sort(comparePairAscend);
    return [arrMaxDiffStarsBusiness, arrMaxDiffReviewsBusiness];
}
function comparePairAscend(pair1, pair2) {
    if (pair1.amount <= pair2.amount) {
        return 1;
    } else {
        return -1;
    }
}
function createPair(amount, business_id) {
    var pair = Object.create(Pair);
    pair.amount = amount;
    pair.business_id = business_id;
    return pair;
}
var Pair = {
    amount: 0,
    business_id: 0
};


getOneBusinessDetail("vcNAWiLM4dR7D2nwwJ7nCA");
var ret;
function getOneBusinessDetail(business_id){
    var data1 = client.search({
        index: "yelp",
        body: {
            query:{
                match:{
                    business_id: business_id
                },
                match:{
                    date: "2007-05-17"
                }
            }
        }
    }).then(function(resp) {
        ret = resp.hits.hits;
        console.log(ret);
    })
}
client.bulk({
    body: [
        {"index": {"_index": "yelp", "_type": "test1", "_id": 0}},
        {"business_id": "vcNAWiLM4dR7D2nwwJ7nCA", "full_address": "4840 E Indian School Rd\nSte 101\nPhoenix, AZ 85018", "hours": {"Tuesday": {"close": "17:00", "open": "08:00"}, "Friday": {"close": "17:00", "open": "08:00"}, "Monday": {"close": "17:00", "open": "08:00"}, "Wednesday": {"close": "17:00", "open": "08:00"}, "Thursday": {"close": "17:00", "open": "08:00"}}, "open": true, "categories": ["Doctors", "Health & Medical"], "city": "Phoenix", "review_count": 9, "name": "Eric Goldberg, MD", "neighborhoods": [], "longitude": -111.98375799999999, "state": "AZ", "stars": 3.5, "latitude": 33.499313000000001, "attributes": {"By Appointment Only": true}, "type": "business"},
        {index: {_index: 'yelp', _type: 'test1', _id: 1}},
        {"business_id": "UsFtqoBl7naz8AVUBZMjQQ", "full_address": "202 McClure St\nDravosburg, PA 15034", "hours": {}, "open": true, "categories": ["Nightlife"], "city": "Dravosburg", "review_count": 4, "name": "Clancy's Pub", "neighborhoods": [], "longitude": -79.886930000000007, "state": "PA", "stars": 3.5, "latitude": 40.350518999999998, "attributes": {"Happy Hour": true, "Accepts Credit Cards": true, "Good For Groups": true, "Outdoor Seating": false, "Price Range": 1}, "type": "business"},
        {index: {_index: 'yelp', _type: 'test1', _id: 2}},
        {"business_id": "cE27W9VPgO88Qxe4ol6y_g", "full_address": "1530 Hamilton Rd\nBethel Park, PA 15234", "hours": {}, "open": false, "categories": ["Active Life", "Mini Golf", "Golf"], "city": "Bethel Park", "review_count": 5, "name": "Cool Springs Golf Center", "neighborhoods": [], "longitude": -80.015910000000005, "state": "PA", "stars": 2.5, "latitude": 40.356896200000001, "attributes": {"Good for Kids": true}, "type": "business"},
        {index: {_index: 'yelp', _type: 'test1', _id: 3}},
        {"business_id": "HZdLhv6COCleJMo7nPl-RA", "full_address": "301 S Hills Vlg\nPittsburgh, PA 15241", "hours": {"Monday": {"close": "21:00", "open": "10:00"}, "Tuesday": {"close": "21:00", "open": "10:00"}, "Friday": {"close": "21:00", "open": "10:00"}, "Wednesday": {"close": "21:00", "open": "10:00"}, "Thursday": {"close": "21:00", "open": "10:00"}, "Sunday": {"close": "18:00", "open": "11:00"}, "Saturday": {"close": "21:00", "open": "10:00"}}, "open": true, "categories": ["Shopping", "Home Services", "Internet Service Providers", "Mobile Phones", "Professional Services", "Electronics"], "city": "Pittsburgh", "review_count": 3, "name": "Verizon Wireless", "neighborhoods": [], "longitude": -80.059979999999996, "state": "PA", "stars": 3.5, "latitude": 40.357619999999997, "attributes": {}, "type": "business"},
    ]
}, function (err, resp) {
    // ...
});*/
//console.log(map);
//console.log(key);
//var t1 = Date.parse("2015-11-27");
//var t2 = Date.parse("2015-11-26");
//var test = t1 - 24 * 60 * 60 * 1000 == t2;
//console.log(key);
//console.log(item);

//console.log(ret["hits"]["hits"][0]["_source"]["business_id"]);
//console.log(ret["hits"]["hits"][0]["_source"]["stars_reviews"]["2004-10-12"]["review_amount"]);



