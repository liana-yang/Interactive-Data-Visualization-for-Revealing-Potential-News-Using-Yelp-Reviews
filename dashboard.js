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
      return d._source.name;
    });
  //tbodySelection
  //  .select('td:nth-child(1)')
  //  .classed('text-highlighted', true);
  tdSelection
    .on('mouseover', function (businessName, i) {
      businessListHighlight(i);
      reviewLineChartHighlight(i);
      starLineChartHighlight(i);
    })
    .on('click', function (business, i) {
      businessListClick(i);
      reviewLineChartClick(i);
      starLineChartClick(i);
      window.clickedBusinessIndex = i + 1;
      window.clickedBusinessID = business._source.business_id;
      console.log(business);
      d3.select('#selected-business-name').text(business._source.name);
      d3.select('#full-address').text(business._source.full_address);
      get_review_details_within_time_range("yelp", "review1208v3", business._source.business_id, 100, "asc", "2005-01-01", "2014-12-31");
    })
    .on('mouseout', function() {
      clearAllHover();
    });
  $('#business-list .table-responsive').height($('#review-list').height() - 176);
}

//function renderBusinessListReRank(businessList) {//different input format compared with renderBusinessList
//  var trSelection = d3.select('#business-list').select('tbody').selectAll('tr').data(businessList);
//  tbodySelection.selectAll('*').remove();
//  trSelection.enter().append('tr');
//  trSelection.exit().remove();
//  var tdSelection = trSelection
//      .append('td')
//      .text(function (d) {
//        return d.name;
//      });
//  var tbodySelection = d3.select('#business-list').select('tbody');
//  tbodySelection
//      .select('td:nth-child(1)')
//      .classed('text-highlighted', true);
//  tdSelection
//      .on('mouseover', function (businessName, i) {
//        businessListHighlight(i);
//        reviewLineChartHighlight(i);
//      })
//      .on('click', function(businessName, i) {
//        businessListClick(i);
//        reviewLineChartClick(i);
//      });
//}

function renderReviewList(reviewList, startDate, endDate) {
  var tbodySelection = d3.select('#review-list').select('tbody');
  tbodySelection.selectAll('*').remove();
  var trSelection = tbodySelection.selectAll('tr').data(reviewList);
  trSelection.enter().append('tr');
  trSelection.exit().remove();
  var timeSelection = trSelection
    .append('td')
    .text(function (d) {
      return d._source.date;
    });
  var reviewSelection = trSelection
    .append('td')
    .text(function (d) {
      return d._source.text;
    });
  if (window.reviewListRendered) {
    get_significant_terms_in_review_details_within_time_range("yelp", "review1208v3", window.clickedBusinessID, 15, startDate, endDate);
  }
  window.reviewListRendered = false;
}

function renderLineCharts(lineChartData) {
  drawReviewAmountLineChart(lineChartData);
  drawStarAmountLineChart(lineChartData);
}

function drawReviewAmountLineChart(lineChartData) {
  var reviewContainer = $('#review-amount-line-chart');
  var lineChartHeight = ($('#review-list').height() - 60) / 2;
  var lineChartWidth = reviewContainer.width();
  reviewContainer.height(lineChartHeight);
  var reviewSelection = d3.select('#review-amount-line-chart');
  reviewSelection.selectAll('*').remove();
  var svgSelection = reviewSelection
    .append('svg')
    .classed('line-chart', true)
    .attr('height', lineChartHeight)
    .attr('width', lineChartWidth);
  var mindate = new Date(global_line_chart_start_time);
  var maxdate = new Date(global_line_chart_end_time);
  var xScale = d3.time.scale().range([
    30,
    lineChartWidth - 30
  ]).domain([mindate, maxdate]);
  var yScale = d3.scale.linear().range([
    lineChartHeight - 30,
    10
  ]).domain([0, global_line_chart_max_review_amount]);
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
    .attr('transform', 'translate(30, 0)');
  var reviewContent = svgSelection.append('g')
    .classed('review-content', true)
    .attr('width', lineChartWidth)
    .attr('height', lineChartHeight);
  var rect = reviewContent.append('svg:rect')
    .attr('width', lineChartWidth - 60)
    .attr('height', lineChartHeight - 40)
    .attr('transform', 'translate(30, 10)')
    .attr('fill', 'white');
  var clip = reviewContent.append("svg:clipPath")
    .attr("id", "clip");
  clip.append("svg:rect")
    .attr("id", "clip-rect")
    .attr('width', lineChartWidth - 60)
    .attr('height', lineChartHeight - 40)
    .attr('transform', 'translate(30, 10)');
  var reviewPath = reviewContent.selectAll('path').data(lineChartData);
  var line1 = d3.svg.line()
    .x(function (data) {
      return xScale(new Date(data.date));
    })
    .y(function (data) {
      return yScale(data.review_amount);
    })
    .interpolate('linear');
  reviewPath.enter().append('path')
    .attr("clip-path", "url(#clip)")
    .on('mousemove', function (data, i) {
      var selection = $('#business-list tbody tr:nth-of-type(' + (i + 1) + ') td')
      businessListHighlight(i);
      reviewLineChartHighlight(i);
      starLineChartHighlight(i);
      var pointer = d3.mouse(this);
      var selectedDate = timeFormate(xScale.invert(pointer[0]));
      renderTooltip(selection.text(), selectedDate, data, [d3.event.x, d3.event.y], i);
    })
    .on('click', function (data, i) {
      var selection = $('#business-list tbody tr:nth-of-type(' + (i + 1) + ') td')
      selection.trigger('click');
    })
    .on('mouseout', function() {
      clearAllHover();
      d3.select('#tooltip').style({
        'display': 'none'
      });
    });
  reviewPath.classed('profile', true)
    .attr('d', line1)
    .attr('fill', 'none')
    .attr('stroke', '#D8D8D8')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1);
  reviewPath.exit().remove();

  var yScale2 = d3.scale.linear().range([
    lineChartHeight - 30,
    10
  ]).domain([0, 5]);
  var line2 = d3.svg.line()
    .x(function (data) {
      return xScale(new Date(data.date));
    })
    .y(function (data) {
      return yScale2(data.avg_stars);
    })
    .interpolate('linear');

  var zoom = d3.behavior.zoom()
    .x(xScale)
    //.y(yScale)
    .on('zoom', function() {
      d3.selectAll('.line-chart').select(".x").call(xAxis);
      //svgSelection.select(".x").call(xAxis);
      //svgSelection.select(".y").call(yAxis);
      reviewPath.attr('d', line1);
      d3.select('.star-content')
        .selectAll('path')
        .data(lineChartData)
        .attr('d', line2);
      var fullDomain = maxdate - mindate;
      var currentDomain = xScale.domain()[1] - xScale.domain()[0];
      var minScale = currentDomain / fullDomain,
        maxScale = minScale * 20;
      //zoom.scaleExtent([0, maxScale]);
      zoom.scaleExtent([1, 20]);
    });
  //    //xScale.domain([xMin, xMax]);
  //    //yScale.domain([yMax, yMin]);
  //    //xAxis.scale(xScale);
  //    //yAxis.scale(yScale);
  //    //console.log("here", d3.event.translate, d3.event.scale);
  //    //if (xScale.domain()[0] < mindate) {
  //    //  var temp = zoom.translate()[0] - xScale(mindate) + xScale.range()[0];
  //    //  zoom.translate([temp, 0]);
  //    //} else if (xScale.domain()[1] > maxdate) {
  //    //  var temp = zoom.translate()[0] - xScale(maxdate) + xScale.range()[1];
  //    //  zoom.translate([temp, 0]);
  //    //}
  //    svgSelection.select(".x").call(xAxis);
  //    svgSelection.select(".y").call(yAxis);
  //    reviewPath.attr('d', line);
  //    //reviewPath.transition()
  //    //  .attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
  //    var fullDomain = maxdate - mindate,
  //      currentDomain = xScale.domain()[1] - xScale.domain()[0];
  //    var minScale = currentDomain / fullDomain,
  //      maxScale = minScale * 20;
  //    zoom.scaleExtent([minScale, maxScale]);
  svgSelection.call(zoom)
    .on("mousedown.zoom", null)
    .on("touchstart.zoom", null)
    .on("touchmove.zoom", null)
    .on("touchend.zoom", null);

  // Drag Selection.
  var timeLeft = 0;
  var timeRight = 0;
  var drag = d3.behavior.drag()
    .on('drag', function (d, i) {
      var selection = d3.selectAll('.selected');
      if (selection[0].indexOf(this) == -1) {
        selection.classed('selected', false);
        selection = d3.select(this);
        selection.classed('selected', true);
      }
      selection.attr('transform', function (d, i) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        return 'translate(' + [d.x, d.y] + ')';
      });
      this.parentNode.appendChild(this);
      d3.event.sourceEvent.stopPropagation();
    });
  reviewPath.call(drag);
  svgSelection
    .on('mousedown', function () {
      if (!d3.event.ctrlKey) {
        d3.selectAll('path.selected').classed('selected', false);
      }
      var p = d3.mouse(this);
      timeLeft = p[0];
      reviewContent.append('rect')
        .attr({
          rx: 6,
          ry: 6,
          class: 'selection',
          x: p[0],
          y: p[1],
          width: 0,
          height: 0
        });
    })
    .on('mousemove', function () {
      var s = reviewContent.select('rect.selection');
      if (!s.empty()) {
        var p = d3.mouse(this),
          d = {
            x: parseInt(s.attr('x'), 10),
            y: parseInt(s.attr('y'), 10),
            width: parseInt(s.attr('width'), 10),
            height: parseInt(s.attr('height'), 10)
          },
          move = {
            x: p[0] - d.x,
            y: p[1] - d.y
          };
        if (move.x < 1 || (move.x * 2 < d.width)) {
          d.x = p[0];
          d.width -= move.x;
        }
        else {
          d.width = move.x;
        }
        if (move.y < 1 || (move.y * 2 < d.height)) {
          d.y = p[1];
          d.height -= move.y;
        }
        else {
          d.height = move.y;
        }
        s.attr(d);
        // deselect all temporary selected state objects
        reviewContent.selectAll('.selection.selected').classed('selected', false);
        //reviewContent.selectAll('g.state >circle.inner').each( function( state_data, i) {
        //  if(
        //    !d3.select(this).classed('selected') &&
        //      // inner circle inside selection frame
        //    state_data.x-radius>=d.x && state_data.x+radius<=d.x+d.width &&
        //    state_data.y-radius>=d.y && state_data.y+radius<=d.y+d.height
        //  ) {
        //
        //    d3.select( this.parentNode)
        //      .classed( "selection", true)
        //      .classed( "selected", true);
        //  }
        //});
      }
    })
    .on('mouseup', function () {
      reviewContent.selectAll('rect.selection').remove();
      reviewContent.selectAll('.selection').classed('selection', false);
      var p = d3.mouse(this);
      timeRight = p[0];
      var leftDate = xScale.invert(timeLeft);
      var startDate = timeFormate(leftDate);
      var rightDate = xScale.invert(timeRight);
      var endDate = timeFormate(rightDate);
      console.log(startDate, endDate);
      console.log(window.clickedBusinessID);
      if (startDate != endDate) {
        window.reviewListRendered = true;
        get_review_details_within_time_range("yelp", "review1208v3", window.clickedBusinessID, 100, "asc", startDate, endDate);
        ////get_significant_terms_in_review_details_within_time_range("yelp", "review1208v3", window.clickedBusinessID, 10, startDate, endDate);
        //var oneDay = 24 * 60 * 60 * 1000;
        //var diffDaysTotal = (maxdate.getTime() - mindate.getTime()) / (oneDay);
        //var diffDaysSelected = (rightDate.getTime() - leftDate.getTime()) / (oneDay);
        ////var zoomScale = (diffDaysTotal / diffDaysSelected).toFixed(2);
        //var zoomScale = (lineChartWidth - 60) / (timeRight - timeLeft);
        //
        ////var zoomTranslate = (mindate.getTime() - leftDate.getTime()) / (oneDay);
        //var zoomTranslate = ((lineChartWidth - (timeRight - timeLeft)) / 2) - timeLeft;
        //
        //console.log(zoomScale);
        //console.log(zoomTranslate);
        //console.log(timeLeft);
        //reviewPath.call(zoom);
        //zoom.center([((timeRight - timeLeft) / 2) + timeLeft, 0]);
        //zoom.scale(zoomScale);
        //console.log(zoom.center());
        ////zoom.translate([zoomTranslate, 0]);
        ////zoom.translate([-(timeLeft * zoomScale), 0]);
        ////zoom.size([lineChartWidth - 60, lineChartHeight - 40]);
        //zoom.event(reviewPath)
      }
    })
    .on('mouseout', function () {
      if (d3.event.relatedTarget.tagName == 'HTML') {
        reviewContent.selectAll('rect.selection').remove();
        reviewContent.selectAll('.selection').classed('selection', false);
      }
    });
}

function drawStarAmountLineChart(lineChartData) {
  var starContainer = $('#star-amount-line-chart');
  var lineChartHeight = ($('#review-list').height() - 60)/ 2;
  var lineChartWidth = starContainer.width();
  starContainer.height(lineChartHeight);
  var starSelection = d3.select('#star-amount-line-chart');
  starSelection.selectAll('*').remove();
  var svgSelection = starSelection
    .append('svg')
    .classed('line-chart', true)
    .attr('height', lineChartHeight)
    .attr('width', lineChartWidth)
    .attr('transform', 'translate(0, ' + lineChartHeight + ')');
  var mindate = new Date(global_line_chart_start_time);
  var maxdate = new Date(global_line_chart_end_time);
  var xScale = d3.time.scale().range([
    30,
    lineChartWidth - 30
  ]).domain([mindate, maxdate]);
  var yScale = d3.scale.linear().range([
    lineChartHeight - 30,
    10
  ]).domain([0, 5]);
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
    .attr('transform', 'translate(30, 0)');
  var starContent = svgSelection.append('g')
    .classed('star-content', true)
    .attr('width', lineChartWidth)
    .attr('height', lineChartHeight);
  var rect = starContent.append('svg:rect')
    .attr('width', lineChartWidth - 60)
    .attr('height', lineChartHeight - 40)
    .attr('transform', 'translate(30, 10)')
    .attr('fill', 'white');
  var clip = starContent.append("svg:clipPath")
    .attr("id", "clip");
  clip.append("svg:rect")
    .attr("id", "clip-rect")
    .attr('width', lineChartWidth - 60)
    .attr('height', lineChartHeight - 40)
    .attr('transform', 'translate(30, 10)');
  var starPath = starContent.selectAll('path').data(lineChartData);
  var line = d3.svg.line()
    .x(function (data) {
      return xScale(new Date(data.date));
    })
    .y(function (data) {
      return yScale(data.avg_stars);
    })
    .interpolate('linear');
  starPath.enter().append('path')
    .attr("clip-path", "url(#clip)")
    .on('mousemove', function (data, i) {
      var selection = $('#business-list tbody tr:nth-of-type(' + (i + 1) + ') td')
      businessListHighlight(i);
      reviewLineChartHighlight(i);
      starLineChartHighlight(i);
      var pointer = d3.mouse(this);
      var selectedDate = timeFormate(xScale.invert(pointer[0]));
      renderTooltip(selection.text(), selectedDate, data, [d3.event.x, d3.event.y], i);
    })
    .on('click', function (data, i) {
      $('#business-list tbody tr:nth-of-type(' + (i + 1) + ') td').trigger('click');
    })
    .on('mouseout', function() {
      clearAllHover();
      d3.select('#tooltip').style({
        'display': 'none'
      });
    });
  starPath.classed('profile', true)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', '#D8D8D8')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1);
  starPath.exit().remove();
  if (!window.clickedBusinessID) {
    $('#business-list tbody tr:first-child td').trigger('click');
  }
  else {
    businessListClick(window.clickedBusinessIndex - 1);
    reviewLineChartClick(window.clickedBusinessIndex - 1);
    starLineChartClick(window.clickedBusinessIndex - 1);
  }

  var yScale1 = d3.scale.linear().range([
    lineChartHeight - 30,
    10
  ]).domain([0, global_line_chart_max_review_amount]);
  var line1 = d3.svg.line()
    .x(function (data) {
      return xScale(new Date(data.date));
    })
    .y(function (data) {
      return yScale1(data.review_amount);
    })
    .interpolate('linear');

  var zoom = d3.behavior.zoom()
    .x(xScale)
    //.y(yScale)
    .on('zoom', function() {
      d3.selectAll('.line-chart').select(".x").call(xAxis);
      //svgSelection.select(".x").call(xAxis);
      //svgSelection.select(".y").call(yAxis);
      starPath.attr('d', line);
      d3.select('.review-content')
        .selectAll('path')
        .data(lineChartData)
        .attr('d', line1);
      var fullDomain = maxdate - mindate;
      var currentDomain = xScale.domain()[1] - xScale.domain()[0];
      var minScale = currentDomain / fullDomain,
        maxScale = minScale * 20;
      zoom.scaleExtent([1, 20]);
    });
  svgSelection.call(zoom)
    .on("mousedown.zoom", null)
    .on("touchstart.zoom", null)
    .on("touchmove.zoom", null)
    .on("touchend.zoom", null);

  // Drag Selection.
  var timeLeft = 0;
  var timeRight = 0;
  var drag = d3.behavior.drag()
    .on('drag', function (d, i) {
      var selection = d3.selectAll('.selected');
      if (selection[0].indexOf(this) == -1) {
        selection.classed('selected', false);
        selection = d3.select(this);
        selection.classed('selected', true);
      }
      selection.attr('transform', function (d, i) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        return 'translate(' + [d.x, d.y] + ')';
      });
      this.parentNode.appendChild(this);
      d3.event.sourceEvent.stopPropagation();
    });
  starPath.call(drag);
  svgSelection
    .on('mousedown', function () {
      if (!d3.event.ctrlKey) {
        d3.selectAll('path.selected').classed('selected', false);
      }
      var p = d3.mouse(this);
      timeLeft = p[0];
      starContent.append('rect')
        .attr({
          rx: 6,
          ry: 6,
          class: 'selection',
          x: p[0],
          y: p[1],
          width: 0,
          height: 0
        });
    })
    .on('mousemove', function () {
      var s = starContent.select('rect.selection');
      if (!s.empty()) {
        var p = d3.mouse(this),
          d = {
            x: parseInt(s.attr('x'), 10),
            y: parseInt(s.attr('y'), 10),
            width: parseInt(s.attr('width'), 10),
            height: parseInt(s.attr('height'), 10)
          },
          move = {
            x: p[0] - d.x,
            y: p[1] - d.y
          };
        if (move.x < 1 || (move.x * 2 < d.width)) {
          d.x = p[0];
          d.width -= move.x;
        }
        else {
          d.width = move.x;
        }
        if (move.y < 1 || (move.y * 2 < d.height)) {
          d.y = p[1];
          d.height -= move.y;
        }
        else {
          d.height = move.y;
        }
        s.attr(d);
        // deselect all temporary selected state objects
        starContent.selectAll('.selection.selected').classed('selected', false);
        //reviewContent.selectAll('g.state >circle.inner').each( function( state_data, i) {
        //  if(
        //    !d3.select(this).classed('selected') &&
        //      // inner circle inside selection frame
        //    state_data.x-radius>=d.x && state_data.x+radius<=d.x+d.width &&
        //    state_data.y-radius>=d.y && state_data.y+radius<=d.y+d.height
        //  ) {
        //
        //    d3.select( this.parentNode)
        //      .classed( "selection", true)
        //      .classed( "selected", true);
        //  }
        //});
      }
    })
    .on('mouseup', function () {
      starContent.selectAll('rect.selection').remove();
      starContent.selectAll('.selection').classed('selection', false);
      var p = d3.mouse(this);
      timeRight = p[0];
      var leftDate = xScale.invert(timeLeft);
      var startDate = timeFormate(leftDate);
      var rightDate = xScale.invert(timeRight);
      var endDate = timeFormate(rightDate);
      console.log(startDate, endDate);
      if (startDate != endDate) {
        window.reviewListRendered = true;
        get_review_details_within_time_range("yelp", "review1208v3", window.clickedBusinessID, 100, "asc", startDate, endDate);
        //get_significant_terms_in_review_details_within_time_range("yelp", "review1208v3", window.clickedBusinessID, 10, startDate, endDate);
      }
    })
    .on('mouseout', function () {
      if (d3.event.relatedTarget.tagName == 'HTML') {
        starContent.selectAll('rect.selection').remove();
        starContent.selectAll('.selection').classed('selection', false);
      }
    });
}

function renderTooltip(businessName, selectedDate, data, pointer, index) {
  var i = 0;
  var reviewAmount = 0;
  var starAmount = 0;
  while (i < data.length) {
    if (data[i].date == selectedDate) {
      reviewAmount = data[i].review_amount;
      starAmount = data[i].avg_stars;
      break;
    }
    i++;
  }
  d3.select('#tooltip').style({
    'display': 'inline',
    'top': pointer[1] + 'px',
    'left': pointer[0] + 'px'
  });
  d3.select('#business-name').text(businessName);
  d3.select('#selected-date').text(selectedDate);
  if (reviewAmount == 0 || starAmount == 0) {
    d3.selectAll('p.tooltip-amount').style('display', 'none');
    d3.select('p.tooltip-empty').style('display', 'inline');
  }
  else {
    d3.select('#review-amount').text(reviewAmount);
    d3.select('#star-amount').text(starAmount);
    d3.selectAll('p.tooltip-amount').style('display', 'inline');
    d3.select('p.tooltip-empty').style('display', 'none');
  }
  if (window.clickedBusinessIndex == index + 1) {
    d3.select('#tooltip')
      .classed('panel-info', true)
      .classed('panel-warning', false);
  }
  else {
    d3.select('#tooltip')
      .classed('panel-info', false)
      .classed('panel-warning', true);
  }
  if (reviewAmount == 0 || starAmount == 0) {
    d3.select('#tooltip').style({
      'display': 'none'
    });
  }

  //.addClass('panel panel-info tooltip');
  //panelSelection.attr('transform', 'translate(' + pointer[0] + ', ' + pointer[1] + ')');
  //var tooltipHeading = panelSelection.append('div')
  //  .addClass('panel-heading')
  //  .text(businessName);
  //var tooltipBody = panelSelection.append('div')
  //  .addClass('panel-body');
}

function businessListHighlight(index) {
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection.selectAll('td').classed('text-highlighted', false);
  tbodySelection.select('tr:nth-of-type(' + (index + 1) + ') td').classed('text-highlighted', true);
}

function businessListClick(index) {
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection.selectAll('td').classed('text-clicked', false);
  tbodySelection.select('tr:nth-of-type(' + (index + 1) + ') td').classed('text-clicked', true);
}

function reviewLineChartHighlight(index) {
  var reviewContent = d3.select('.review-content');
  reviewContent.selectAll('path').classed('path-highlighted', false);
  reviewContent.select('path:nth-of-type(' + (index + 1) + ')').classed('path-highlighted', true);
}

function reviewLineChartClick(index) {
  var reviewContent = d3.select('.review-content');
  reviewContent.selectAll('path').classed('path-clicked', false);
  reviewContent.select('path:nth-of-type(' + (index + 1) + ')').classed('path-clicked', true);
}

function starLineChartHighlight(index) {
  var starContent = d3.select('.star-content');
  starContent.selectAll('path').classed('path-highlighted', false);
  starContent.select('path:nth-of-type(' + (index + 1) + ')').classed('path-highlighted', true);
}

function starLineChartClick(index) {
  var starContent = d3.select('.star-content');
  starContent.selectAll('path').classed('path-clicked', false);
  starContent.select('path:nth-of-type(' + (index + 1) + ')').classed('path-clicked', true);
}

function clearAllHover() {
  var tbodySelection = d3.select('#business-list').select('tbody');
  tbodySelection.selectAll('td').classed('text-highlighted', false);
  var reviewContent = d3.select('.review-content');
  reviewContent.selectAll('path').classed('path-highlighted', false);
  var starContent = d3.select('.star-content');
  starContent.selectAll('path').classed('path-highlighted', false);
}

function highlightWordInReview(wordList) {
  $('#key-words').empty();
  wordList.forEach(function(word, i) {
    var tdSelection = $('#review-list tbody tr td:nth-of-type(2)');
    //highlight_words(word.key, tdSelection);
    highlight_words(word.key, tdSelection);
  });
}

function highlight_words(keywords, element) {
  //var color = d3.scale.category20().range()
  //  .concat(d3.scale.category20b().range())
  //  .concat(d3.scale.category20c().range());
  var color = d3.scale.category10().range();
  if (keywords) {
    var textNodes;
    keywords = keywords.replace(/\W/g, '');
    var str = keywords.split(" ");
    $(str).each(function () {
      var term = this;
      var textNodes = element.contents().filter(function () {
        return this.nodeType === 3
      });
      textNodes.each(function () {
        var content = $(this).text();
        var regex = new RegExp(term, "gi");
        content = content.replace(regex, '<span class="review-text-highlighted keyword-' + keywords + '">' + term + '</span>');
        $(this).replaceWith(content);
      });
    });
    //var textColor = color[hashString(keywords) % 60];
    var textColor = color[hashString(keywords) % 10];
    $('.keyword-' + keywords).css('color', textColor);

    //$('.key-words-init').clone()
    //  .attr('id', keywords)
    //  .text(keywords)
    //  .attr('display', 'inline')
    //  .appendTo('#key-words');
  }
}

function hashString(s) {
  if (typeof s != 'string') {
    return genotet.error('x is not a string to hash');
  }
  var a = 3, p = 1000000007;
  var result = 0;
  for (var i = 0; i < s.length; i++) {
    var x = s.charCodeAt(i);
    result = (result * a + x) % p;
  }
  return result;
}

function timeFormate(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var formatDate = (1900 + date.getYear()) + '-'
    + (month > 9 ? "" + month : "0" + month) + '-'
    + (day > 9 ? "" + day : "0" + day);
  return formatDate;
}

function renderCategoryFilter() {
  d3.text('dataPreparation/category.txt', function(category_strings){
    var category_array = category_strings.split(",");
    category_array.unshift('All');
    var eventSelect = $('#category-filter');
    eventSelect.select2({
      data: category_array,
      width: '60%'
    });
    eventSelect.on('select2:select', function(event) {
      global_next_prev_click_times = 0;
      var category = event.params.data.id.toLowerCase();
      if (category == 'all') {
        category = '';
      }
      window.selectedCategoryFilter = category;
      window.clickedBusinessID = '';
      get_businesses_list_based_on_abnormality_score('yelp', 'business1216', global_business_size, 0, window.selectedLocationFilter, category, 'abnormality_score_' + global_sortKey);
      console.log(category);
    });
  });
}

function renderLocationFilter() {
  global_state_filter.unshift('All');
  var eventSelect = $('#location-filter');
  eventSelect.select2({
    data: global_state_filter,
    width: '60%'
  });
  eventSelect.on('select2:select', function(event) {
    global_next_prev_click_times = 0;
    var location = event.params.data.id;
    if (location == 'All') {
      location = '';
    }
    window.selectedLocationFilter = location;
    window.clickedBusinessID = '';
    get_businesses_list_based_on_abnormality_score('yelp', 'business1216', global_business_size, 0, location, window.selectedCategoryFilter, 'abnormality_score_' + global_sortKey);
    console.log(location);
  });
}

function zoomed() {

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