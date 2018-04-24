
const DEFAULT_OPTIONS = {
  width: 600,
  height: 480,

  marginTop: 30,
  marginBottom: 30,
  marginRight: 20,
  marginLeft: 50,

  dotRadius: 3,
  dotBigRadius: 4,
  defaultDotFill: '#2B303A',
  maxDotFill: '#BF211E',
  minDotFill: '#92DCE5'
}

class Chart {
  constructor(name, data, options){
    this.name = name;
    this.data = data;

    if(!options){
      this.options = DEFAULT_OPTIONS;
    }

    this.initSvg();
  }

  initSvg(){
    this.svg = d3.select('#container')
      .append('svg')
        .attr('width', this.options.width + this.options.marginLeft + this.options.marginRight)
        .attr('height', this.options.height + this.options.marginTop + this.options.marginBottom)
        .attr('id', '#' + this.name);
  }

  plot(){
    this.svg.select('g').remove();
    this.canvas = this.svg.append('g')
        .attr('transform', `translate(${this.options.marginLeft}, ${this.options.marginTop})`)

    const x = d3.scaleTime().range([0, this.options.width]);
    const y = d3.scaleLinear().range([this.options.height, 0]);

    let minY = d3.min(this.data, d => d.value);
    let maxY = d3.max(this.data, d => d.value);

    // Scales y axis such that min value isn't placed right on the x axis
    minY -= (maxY - minY) * 0.05;
    maxY += (maxY - minY) * 0.05;

    // Display every monday and the first day of the month. This way the month name is displayed.
    const mondays = this.data.filter(day => day.date.getDay() == 1).map(day => day.date);
    const xAxis = d3.axisBottom().scale(x).tickValues([this.data[0].date].concat(mondays));

    const yAxis = d3.axisLeft().scale(y).ticks(10);

    const valueline = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    x.domain(d3.extent(this.data, d => d.date));
    y.domain([minY, maxY]);

    this.canvas.append('path')
      .attr('class', 'line')
      .attr('d', valueline(this.data));

    this.canvas.selectAll('.dot')
        .data(this.data)
      .enter().append('circle')
        .attr('class', 'dot')
        .attr('id', d => this.getIdFor(d))
        .attr('r', this.options.dotRadius)
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value));

    // This allows users to not directly hit the dot for it to be selected
    this.canvas.selectAll('.dotMouse')
        .data(this.data)
      .enter().append('circle')
        .attr('class', 'dotMouse')
        .attr('r', this.options.dotRadius * 2)
        .attr('opacity', 0)
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value))
        .on('mouseover', this.handleMouseOver())
        .on('mouseout', this.handleMouseOut());

    this.canvas.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.options.height})`)
      .call(xAxis);

    this.canvas.append('g')
      .attr('class', 'y axis')
      .call(yAxis);
  }

  handleMouseOver(){
    return (d, i) => {
      const week = this.getWeekFor(d);
      const mins = this.getExtremums(week, 'min');
      const maxs = this.getExtremums(week, 'max');

      week.forEach(day => {
        if(mins.includes(day)){
          this.canvas.select('#' + this.getIdFor(day))
            .attr('r', this.options.dotBigRadius)
            .style('fill', this.options.minDotFill);
        } else if(maxs.includes(day)){
          this.canvas.select('#' + this.getIdFor(day))
            .attr('r', this.options.dotBigRadius)
            .style('fill', this.options.maxDotFill);
        }
      });

      this.canvas.append('rect')
          .attr('class', 'selectionRectangle')
          .attr('x', 0)
          .attr('y', -this.options.dotRadius)
          .attr('width', Math.max(this.getIntAttrFor(week[0], 'cx'), 0)) // Width can't be negative
          .attr('height', this.options.height + this.options.dotRadius);

      this.canvas.append('rect')
          .attr('class', 'selectionRectangle')
          .attr('x', this.getIntAttrFor(week[week.length-1], 'cx'))
          .attr('y', -this.options.dotRadius)
          .attr('width', this.options.width - this.getIntAttrFor(week[week.length-1], 'cx'))
          .attr('height', this.options.height + this.options.dotRadius);
    }
  }

  getIntAttrFor(day, attr){
    return parseInt(this.canvas.select('#' + this.getIdFor(day)).attr(attr));
  }

  getExtremums(data, type){
    let extremumValue;
    let cmp;

    if(type == 'min'){
      extremumValue = Infinity;
      cmp = (a, b) => a < b;
    } else {
      extremumValue = -Infinity;
      cmp = (a, b) => a > b;
    }

    let extremums = [];

    data.forEach(day => {
      if(cmp(day.value, extremumValue)){
        extremumValue = day.value;
        extremums = [day];
      } else if(day.value == extremumValue){
        extremums.push(day);
      }
    });

    return extremums;
  }

  handleMouseOut(){
    return (d, i) => {
      this.clearSelection();
    }
  }

  clearSelection(){
    this.canvas.selectAll('.dot')
      .style('fill', this.options.defaultDotFill)
      .attr('r', this.options.dotRadius);

    this.canvas.selectAll('.selectionRectangle').remove();
  }

  getWeekFor(d){
    const week = [];

    this.data.forEach(day => {
      if(this.sameWeek(d.date, day.date)){
        week.push(day);
      }
    });

    return week;
  }

  sameWeek(d1, d2){
    return moment(d1).format('W') == moment(d2).format('W');
  }

  getIdFor(day){
    return 'point' + this.name + day.date.toISOString().slice(0,10);
  }
}
