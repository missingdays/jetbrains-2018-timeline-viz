
DEFAULT_OPTIONS = {
  width: 600,
  height: 480,
  marginTop: 30,
  marginBottom: 30,
  marginRight: 20,
  marginLeft: 50
}

var parseDate = d3.timeParse("%Y-%m-%d");

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
    // Set the ranges
    var x = d3.scaleTime().range([0, this.options.width]);
    var y = d3.scaleLinear().range([this.options.height, 0]);

    // Define the axes
    var xAxis = d3.axisBottom().scale(x).ticks(5);

    var yAxis = d3.axisLeft().scale(y).ticks(5);

    // Define the line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

    // Scale the range of the data
    x.domain(d3.extent(this.data, function(d) { return d.date; }));
    y.domain([0, d3.max(this.data, function(d) { return d.value; })]);

    // Add the valueline path.
    this.svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(this.data));
        //.attr('stroke-width', 2)
        //.attr('stroke', 'black');

    // Add the scatterplot
    this.svg.selectAll("dot")
        .data(this.data)
      .enter().append("circle")
        .attr("r", 6)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); })
        .attr("id", function(d, i){ return "point" + i; })
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
      var mins = self.getMins(week);
      var maxs = self.getMaxs(week);

      week.forEach(function(day){
        if(mins.includes(day)){
          d3.select('#point' + day).transition(300).attr('fill', 'orange');
        } else if(maxs.includes(day)){
          d3.select('#point' + day).transition(300).attr('fill', 'red')
        }
      });

      self.svg.append('rect')
          .attr('class', 'leftRectangle')
          .attr('x', 0)
          .attr('y', -7)
          .attr('width', d3.select('#point' + week[0]).attr('cx') - 5)
          .attr('height', self.options.height + 7)
          .attr('fill', 'black')
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .attr('opacity', 0.5);

      self.svg.append('rect')
          .attr('class', 'rightRectangle')
          .attr('x', parseInt(d3.select('#point' + week[week.length-1]).attr('cx')) + 5)
          .attr('y', -7)
          .attr('width', self.options.width - d3.select('#point' + week[week.length-1]).attr('cx'))
          .attr('height', self.options.height + 7)
          .attr('fill', 'black')
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .attr('opacity', 0.5);
    }
  }

  getMins(week){
    var mins = [];
    var min = Infinity;
    var self = this;

    week.forEach(function(day){
      if(self.data[day].value < min){
        min = self.data[day].value;
        mins = [day];
      } else if(self.data[day].value == min){
        mins.append(day);
      }
    });

    return mins;
  }

  getMaxs(week){
      var mins = [];
      var min = 0;
      var self = this;

      week.forEach(function(day){
        if(self.data[day].value > min){
          min = self.data[day].value;
          mins = [day];
        } else if(self.data[day].value == min){
          mins.push(day);
        }
      });

      return mins;
    }


  handleMouseOut(){
    var self = this;

    return function(d, i){
      self.clearSelection();
    }
  }

  clearSelection(){
    var self = this;

    setTimeout(function(){
      self.data.forEach(function(day, i){
        d3.select('#point' + i).transition(300).attr('fill', 'black');
      });

      d3.selectAll('.leftRectangle').transition(300).attr('opacity', 0).remove();
      d3.selectAll('.rightRectangle').transition(300).attr('opacity', 0).remove();
    }, 300);
  }

  getWeekFor(d){
    var week = [];
    var self = this;

    this.data.forEach(function(day, i){
      if(self.sameWeek(d.date, day.date)){
        week.push(i);
      }
    });

    return week;
  }

  sameWeek(d1, d2){
    return moment(d1).format('W') == moment(d2).format('W');
  }
}
