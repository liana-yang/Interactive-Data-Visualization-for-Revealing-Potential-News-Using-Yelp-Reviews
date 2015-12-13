/**
 * Created by Shauro on 15/12/10.
 */
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

  //var businessList = [1,2,3,4,5,6,7,8,9,10]
  //var trSelection = d3.select('#business-list').select('tbody').selectAll('tr').data(businessList);
  //trSelection.enter().append('tr');
  //trSelection.exit().remove();
  //var tdSelection = trSelection.append('td');
  //tdSelection.text(function(d) {
  //  return d;
  //});
  //renderLineCharts();

//  $(window).resize(function () {
//    renderLineCharts();
//  });
//});

function renderLineCharts() {
  drawReviewAmountLineChart();
}

function drawReviewAmountLineChart() {
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
  var xScale = d3.scale.linear().range([
    50,
    lineChartWeight - 30
  ]).domain([2005, 2015]);
  var yScale = d3.scale.linear().range([
    lineChartHeight - 30,
    30
  ]).domain([100, 5000]);
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
  //var line = d3.svg.line()
  //  .x(function(data, i) {
  //    return xScale(i);
  //  })
  //  .y(yScale)
  //  .interpolate('linear');
}