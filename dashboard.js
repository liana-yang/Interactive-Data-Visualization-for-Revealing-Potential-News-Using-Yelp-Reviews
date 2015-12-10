/**
 * Created by Shauro on 15/12/10.
 */
$( document ).ready(function() {
  var data = {
    x: 2005, y:500,
    x: 2006, y:600,
    x: 2007, y:1000,
    x: 2008, y:1200,
  };
  renderLineCharts();
  $(window).resize(function() {
    renderLineCharts();
  });
});

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