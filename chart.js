
DEFAULT_OPTIONS = {
  width: 600,
  height: 480,

  marginTop: 30,
  marginBottom: 30,
  marginRight: 20,
  marginLeft: 50,

  dotRadius: 3,
  dotBigRadius: 4,
  defaultDotFill: "#2B303A",
  maxDotFill: "#BF211E",
  minDotFill: "#92DCE5"
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
    this.svg = d3.select("#container")
      .append("svg")
        .attr("width", this.options.width + this.options.marginLeft + this.options.marginRight)
        .attr("height", this.options.height + this.options.marginTop + this.options.marginBottom)
        .attr("id", "#" + this.name)
      .append("g")
        .attr("transform", "translate(" + this.options.marginLeft + "," + this.options.marginTop + ")");
  }


  plot(){
    var self = this;

    // Set the ranges
    var x = d3.scaleTime().range([0, this.options.width]);
    var y = d3.scaleLinear().range([this.options.height, 0]);

    var minY = d3.min(this.data, function(d){ return d.value; });
    var maxY = d3.max(this.data, function(d) { return d.value; });

    minY *= 1.1;
    maxY *= 1.1;

    // Define the axes
    var xAxis = d3.axisBottom().scale(x).ticks(10);

    var yAxis = d3.axisLeft().scale(y).ticks(10);

    // Define the line
    var valueline = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

    // Scale the range of the data
    x.domain(d3.extent(this.data, function(d) { return d.date; }));
    y.domain([minY, maxY]);

    // Add the valueline path.
    this.svg.append("path")
      .attr("class", "line")
      .attr("d", valueline(this.data));
        //.attr('stroke-width', 2)
        //.attr('stroke', 'black');

    // Add the scatterplot
    this.svg.selectAll(".dot")
        .data(this.data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d, i){ return self.getIdFor(d); })
        .attr("r", this.options.dotRadius)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); });

    this.svg.selectAll(".dotMouse")
        .data(this.data)
      .enter().append("circle")
        .attr("class", "dotMouse")
        .attr("r", this.options.dotRadius * 2)
        .attr("opacity", 0)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); })
        .on("mouseover", this.handleMouseOver())
        .on("mouseout", this.handleMouseOut());

    // Add the X Axis
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.options.height + ")")
      .call(xAxis);

    // Add the Y Axis
    this.svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  }

  handleMouseOver(){
    var self = this;

    return function(d, i){
      var week = self.getWeekFor(d);
      var mins = self.getExtremums(week, 'min');
      var maxs = self.getExtremums(week, 'max');

      week.forEach(function(day){
        if(mins.includes(day)){
          self.svg.select("#" + self.getIdFor(day))
            .attr("r", self.options.dotBigRadius)
            .style('fill', self.options.minDotFill);
        } else if(maxs.includes(day)){
          self.svg.select("#" + self.getIdFor(day))
            .attr("r", self.options.dotBigRadius)
            .style('fill', self.options.maxDotFill);
        }
      });

      self.svg.append('rect')
          .attr('class', 'leftRectangle')
          .attr('x', 0)
          .attr('y', -self.options.dotRadius)
          .attr('width', Math.max(self.svg  .select("#" + self.getIdFor(week[0])).attr('cx') - self.options.dotRadius, 0))
          .attr('height', self.options.height + self.options.dotRadius)
          .attr('fill', 'black')
          .attr('opacity', 0)
          .attr('opacity', 0.5);

      self.svg.append('rect')
          .attr('class', 'rightRectangle')
          .attr('x', parseInt(self.svg.select("#" + self.getIdFor(week[week.length-1])).attr('cx')) + self.options.dotRadius)
          .attr('y', -self.options.dotRadius)
          .attr('width', self.options.width - self.svg.select("#" + self.getIdFor(week[week.length-1])).attr('cx'))
          .attr('height', self.options.height + self.options.dotRadius)
          .attr('fill', 'black')
          .attr('opacity', 0)
          .attr('opacity', 0.5);
    }
  }

  getExtremums(data, type){
    var extremumValue;
    var cmp;

    if(type == 'min'){
      extremumValue = Infinity;
      cmp = (a, b) => a < b;
    } else {
      extremumValue = -Infinity;
      cmp = (a, b) => a > b;
    }

    var extremums = [];
    var self = this;

    data.forEach(function(day){
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
    var self = this;

    return function(d, i){
      self.clearSelection();
    }
  }

  clearSelection(){
    var self = this;

    self.svg.selectAll(".dot")
      .style('fill', self.options.defaultDotFill)
      .attr("r", self.options.dotRadius);

    self.svg.selectAll('.leftRectangle').remove();
    self.svg.selectAll('.rightRectangle').remove();
  }

  getWeekFor(d){
    var week = [];
    var self = this;

    this.data.forEach(function(day){
      if(self.sameWeek(d.date, day.date)){
        week.push(day);
      }
    });

    return week;
  }


  sameWeek(d1, d2){
    return moment(d1).format('W') == moment(d2).format('W');
  }

  getIdFor(day){
    return "point" + self.name + day.date.toISOString().slice(0,10);
  }
}
