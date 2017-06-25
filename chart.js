document.addEventListener('DOMContentLoaded', contentLoadedCb)

function contentLoadedCb(req) {
  const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
  req = new XMLHttpRequest()
  req.open('GET', url, true)
  req.send()
  req.onload = function () {
    json = JSON.parse(req.responseText)
    // console.log(json)
    chartIt(json)
  }
}

function chartIt(dataset) {
  var w = 800
  var h = 400
  var padding = 60
  var barWidth = 1

  const shiftYear = (date, nYears) => {
    const newYear = date.getFullYear() + nYears
    return new Date(newYear, 0, 1)
  }

  const dates = dataset.map(obj => new Date(obj['Year'], 0, 1))
  const xScale = d3.scaleTime()
    .domain([shiftYear(d3.min(dates), -1), shiftYear(d3.max(dates), 1)])
    .rangeRound([padding, w - padding])

  const parseTime = d3.timeParse('%M:%S')
  const minutes = dataset.map(obj => parseTime(obj['Time']))
  const yScale = d3.scaleTime()
    .domain(d3.extent(minutes))
    .range([padding, h - padding])

  var svg = d3.select('div#container')
    .append('svg')
    .attr('preserveAspectRation', 'xMinYMin meet')
    .attr('viewBox', '0 0 ' + w + ' ' + h)

  const doping = (d, i) => {
    if (d['Doping'].length > 0) {
      return 'doping'
    }
    return 'nodoping'
  }

  const tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .attr('id', 'tooltip')

  const onMouseOverCB = (d, i) => {
    tooltip.text(d['Year'])
    tooltip.attr('data-year', d['Year'])
    return tooltip.style('visibility', 'visible')
  }

  svg.selectAll('.dot')
    .data(dataset)
    .enter().append('circle')
    .attr('class', d => 'dot' + ' ' + doping(d))
    .attr('r', 6)
    .attr('cx', (d, i) => xScale(dates[i]))
    .attr('cy', (d, i) => yScale(minutes[i]))
    .attr('data-xvalue', (d, i) => xScale(dates[i]))
    // .attr('data-xvalue', (d, i) => d['Year'])
    .attr('data-yvalue', (d, i) => yScale(minutes[i]))
    // .attr('data-yvalue', d => d['Time'])
    .on('mouseover', onMouseOverCB)
    .on('mousemove', function () { return tooltip.style('top', (d3.event.pageY - 10) + 'px').style('left', (d3.event.pageX + 10) + 'px') })
    .on('mouseout', function () { return tooltip.style('visibility', 'hidden') })

  svg.append('text')
    .attr('x', (w / 2))
    .attr('y', padding)
    .attr('text-anchor', 'middle')
    .attr('id', 'title')
    .style('font-size', '20px')
    .text('Doping in Professional Bicycle Racing')

  const xAxis = d3.axisBottom(xScale)

  svg.append('g')
    .attr('transform', 'translate(0,' + (h - padding) + ')')
    .call(xAxis)
    .attr('id', 'x-axis')

  var formatTime = d3.timeFormat('%M:%S')

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(formatTime)

  svg.append('g')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis)
    .attr('id', 'y-axis')

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0)
    .attr('x', 0 - (h / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Minutes')
    .attr('id', 'y-axis-label')

  var legend = svg.append('g')
    .attr('id', 'legend')

  var legendPadding = padding

  var noDopingLegend = legend.append('rect')
    .attr('x', w - legendPadding)
    .attr('y', h / 2)
    .attr('width', 18)
    .attr('height', 18)
    .attr('class', 'nodoping')

  legend.append('text')
    .attr('x', w - legendPadding - 3)
    .attr('y', h / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'end')
    .style('font-size', 'small')
    .text('No doping allegations')

  var dopingLegend = legend.append('rect')
    .attr('x', w - legendPadding)
    .attr('y', (h / 2) + 20)
    .attr('width', 18)
    .attr('height', 18)
    .attr('class', 'doping')

  legend.append('text')
    .attr('x', w - legendPadding - 3)
    .attr('y', (h / 2) + 20)
    .attr('dy', '1em')
    .style('text-anchor', 'end')
    .style('font-size', 'small')
    .text('Riders with doping allegations')
}
