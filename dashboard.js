/**
 * Created by Shauro on 15/12/10.
 */

function renderBusinessList(businessList) {
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection.selectAll('*').remove();
  var trSelection = tbodySelection.selectAll('tr').data(businessList);
  trSelection.enter().append('tr');
  trSelection.exit().remove();
  var tdSelection = trSelection
    .append('td')
    .text(function (d) {
//        return d._source.business_id;
      return d._source.name;
    });
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection
    .select('td:nth-child(1)')
    .classed('text-highlighted', true);
  tdSelection
    .on('mouseover', function (businessName, i) {
      businessListHighlight(i);
    })
    .on('click', function(business, i) {
      businessListClick(i);
      get_review_details_within_time_range("yelp", "review1208v3", business._source.business_id, 100, "desc", "2012-11-01", "2014-12-01");
    });
  $('#business-list tbody tr:first-child td').trigger('click');
}

function renderBusinessListReRank(businessList) {//different input format compared with renderBusinessList
  var trSelection = d3.select('#business-list').select('tbody').selectAll('tr').data(businessList);
  tbodySelection.selectAll('*').remove();
  trSelection.enter().append('tr');
  trSelection.exit().remove();
  var tdSelection = trSelection
      .append('td')
      .text(function (d) {
//        return d._source.business_id;
        return d.name;
      });
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection
      .select('td:nth-child(1)')
      .classed('text-highlighted', true);
  tdSelection
      .on('mouseover', function (businessName, i) {
        businessListHighlight(i);
      })
      .on('click', function(businessName, i) {
        businessListClick(i);
      });
}

function renderReviewList(reviewList) {
  var tbodySelection = d3.select('#review-list').select('tbody');
  tbodySelection.selectAll('*').remove();
  var trSelection = tbodySelection.selectAll('tr').data(reviewList);
  trSelection.enter().append('tr');
  trSelection.exit().remove();
  var timeSelection = trSelection
    .append('td')
    .text(function (d) {
//        return d._source.business_id;
      return d._source.date;
    });
  var reviewSelection = trSelection
    .append('td')
    .text(function (d) {
      return d._source.text;
    });
}

function renderLineCharts(lineChartData) {
  drawReviewAmountLineChart(lineChartData);
}

function drawReviewAmountLineChart(lineChartData) {
  var reviewContainer = $('#review-amount-line-chart');
  var lineChartHeight = $('#business-list').height() / 2;
  var lineChartWeight = reviewContainer.width();
  reviewContainer.height(lineChartHeight);
  var reviewSelection = d3.select('#review-amount-line-chart');
  reviewSelection.selectAll('*').remove();
  var svgSelection = reviewSelection
    .append('svg')
    .classed('line-chart', true)
    .attr('height', lineChartHeight)
    .attr('width', lineChartWeight);
  var mindate = new Date(2014,1,1);
  var maxdate = new Date(2014,12,31);
  var xScale = d3.time.scale().range([
    50,
    lineChartWeight - 30
  ]).domain([mindate, maxdate]);
  var yScale = d3.scale.linear().range([
    lineChartHeight - 30,
    30
  ]).domain([0, 50]);
  var xAxis = d3.svg.axis()
    .scale(xScale).orient('bottom');
  var yAxis = d3.svg.axis()
    .scale(yScale).orient('left');
  svgSelection
    .append('svg:g').call(xAxis)
    .classed('axis', true)
    .classed('x', true)
    .attr('transform', 'translate(0, ' + (lineChartHeight - 30) + ')');
  svgSelection
    .append('svg:g').call(yAxis)
    .classed('axis', true)
    .classed('y', true)
    .attr('transform', 'translate(50, 0)');
  var reviewContent = svgSelection.append('g')
    .attr('width', lineChartWeight)
    .attr('height', lineChartHeight);
  console.log(lineChartData);
  var reviewPath = reviewContent.selectAll('path').data(lineChartData);
  var line = d3.svg.line()
    .x(function(data) {
      //console.log(data);
      return xScale(new Date(data.date));
    })
    .y(function(data) {
      return yScale(data.review_amount);
    })
    .interpolate('linear');
  reviewPath.enter().append('path')
    .on('mousemove', function() {
      reviewContent.selectAll('path').classed('path-highlighted', false);
      d3.select(d3.event.target).classed('path-highlighted', true);
    });
  reviewPath.classed('profile', true)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', 'gray');
  reviewPath.exit().remove();

}

function businessListHighlight(index) {
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection.selectAll('td').classed('text-highlighted', false);
  tbodySelection.select('tr:nth-child(' + (index + 1 ) + ') td').classed('text-highlighted', true);
}

function businessListClick(index) {
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection.selectAll('td').classed('text-clicked', false);
  tbodySelection.select('tr:nth-child(' + (index + 1 ) + ') td').classed('text-clicked', true);
}

//Unused code.
//$(document).ready(function () {
//  var client = new $.es.Client({
//    host: 'http://localhost:9200'
//  });
//  client.ping({
//    requestTimeout: 30000 // undocumented params are appended to the query string
//  }, function (error) {
//    if (error) {
//      console.error('elasticsearch cluster is down!');
//    } else {
//      console.log('All is well');
//      var businessList = get_businesses_list_based_on_abnormality_score("yelp", "business1208v3", 10, 1000, "wi", "bars");
//      //get_review_details_within_time_range("yelp", "review1208v3", "g10zmpUzmMJOOIjj_JJPvg, Lml0-yTNsMYsP9IrSMxw9A", 100, "desc", "2012-11-01", "2014-12-01");
//      //get_significant_terms_in_review_details_within_time_range("yelp", "review1208v3", "g10zmpUzmMJOOIjj_JJPvg, Lml0-yTNsMYsP9IrSMxw9A", 100, "2012-11-01", "2014-12-01");
//      //re_rank_in_date_range("yelp", "business1208v3", "2014-01-01", "2014-12-01");
//      //search_box("yelp", 10, "starbucks, money");
//      console.log(businessList);
//
//      //Draw business list.
//      var trSelection = d3.select('#business-list').select('tbody').selectAll('tr').data(businessList);
//      trSelection.enter().append('tr');
//      trSelection.exit().remove();
//      var tdSelection = trSelection.append('td');
//      tdSelection.text(function(d) {
//        return d._source.business_id;
//      });
//      renderLineCharts();
//    }
//  });