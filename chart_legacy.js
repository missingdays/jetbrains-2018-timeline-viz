'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_OPTIONS = {
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
};

var Chart = function () {
  function Chart(name, data, options) {
    _classCallCheck(this, Chart);

    this.name = name;
    this.data = data;

    if (!options) {
      this.options = DEFAULT_OPTIONS;
    }

    this.initSvg();
  }

  _createClass(Chart, [{
    key: 'initSvg',
    value: function initSvg() {
      this.svg = d3.select('#container').append('svg').attr('width', this.options.width + this.options.marginLeft + this.options.marginRight).attr('height', this.options.height + this.options.marginTop + this.options.marginBottom).attr('id', '#' + this.name);
    }
  }, {
    key: 'plot',
    value: function plot() {
      var _this = this;

      this.svg.select('g').remove();
      this.canvas = this.svg.append('g').attr('transform', 'translate(' + this.options.marginLeft + ', ' + this.options.marginTop + ')');

      var x = d3.scaleTime().range([0, this.options.width]);
      var y = d3.scaleLinear().range([this.options.height, 0]);

      var minY = d3.min(this.data, function (d) {
        return d.value;
      });
      var maxY = d3.max(this.data, function (d) {
        return d.value;
      });

      // Scales y axis such that min value isn't placed right on the x axis
      minY -= (maxY - minY) * 0.05;
      maxY += (maxY - minY) * 0.05;

      // Display every monday and the first day of the month. This way the month name is displayed.
      var mondays = this.data.filter(function (day) {
        return day.date.getDay() == 1;
      }).map(function (day) {
        return day.date;
      });
      var xAxis = d3.axisBottom().scale(x).tickValues([this.data[0].date].concat(mondays));

      var yAxis = d3.axisLeft().scale(y).ticks(10);

      var valueline = d3.line().x(function (d) {
        return x(d.date);
      }).y(function (d) {
        return y(d.value);
      });

      x.domain(d3.extent(this.data, function (d) {
        return d.date;
      }));
      y.domain([minY, maxY]);

      this.canvas.append('path').attr('class', 'line').attr('d', valueline(this.data));

      this.canvas.selectAll('.dot').data(this.data).enter().append('circle').attr('class', 'dot').attr('id', function (d) {
        return _this.getIdFor(d);
      }).attr('r', this.options.dotRadius).attr('cx', function (d) {
        return x(d.date);
      }).attr('cy', function (d) {
        return y(d.value);
      });

      // This allows users to not directly hit the dot for it to be selected
      this.canvas.selectAll('.dotMouse').data(this.data).enter().append('circle').attr('class', 'dotMouse').attr('r', this.options.dotRadius * 2).attr('opacity', 0).attr('cx', function (d) {
        return x(d.date);
      }).attr('cy', function (d) {
        return y(d.value);
      }).on('mouseover', this.handleMouseOver()).on('mouseout', this.handleMouseOut());

      this.canvas.append('g').attr('class', 'x axis').attr('transform', 'translate(0, ' + this.options.height + ')').call(xAxis);

      this.canvas.append('g').attr('class', 'y axis').call(yAxis);
    }
  }, {
    key: 'handleMouseOver',
    value: function handleMouseOver() {
      var _this2 = this;

      return function (d, i) {
        var week = _this2.getWeekFor(d);
        var mins = _this2.getExtremums(week, 'min');
        var maxs = _this2.getExtremums(week, 'max');

        week.forEach(function (day) {
          if (mins.includes(day)) {
            _this2.canvas.select('#' + _this2.getIdFor(day)).attr('r', _this2.options.dotBigRadius).style('fill', _this2.options.minDotFill);
          } else if (maxs.includes(day)) {
            _this2.canvas.select('#' + _this2.getIdFor(day)).attr('r', _this2.options.dotBigRadius).style('fill', _this2.options.maxDotFill);
          }
        });

        _this2.canvas.append('rect').attr('class', 'selectionRectangle').attr('x', 0).attr('y', -_this2.options.dotRadius).attr('width', Math.max(_this2.getIntAttrFor(week[0], 'cx'), 0)) // Width can't be negative
        .attr('height', _this2.options.height + _this2.options.dotRadius);

        _this2.canvas.append('rect').attr('class', 'selectionRectangle').attr('x', _this2.getIntAttrFor(week[week.length - 1], 'cx')).attr('y', -_this2.options.dotRadius).attr('width', _this2.options.width - _this2.getIntAttrFor(week[week.length - 1], 'cx')).attr('height', _this2.options.height + _this2.options.dotRadius);
      };
    }
  }, {
    key: 'getIntAttrFor',
    value: function getIntAttrFor(day, attr) {
      return parseInt(this.canvas.select('#' + this.getIdFor(day)).attr(attr));
    }
  }, {
    key: 'getExtremums',
    value: function getExtremums(data, type) {
      var extremumValue = void 0;
      var cmp = void 0;

      if (type == 'min') {
        extremumValue = Infinity;
        cmp = function cmp(a, b) {
          return a < b;
        };
      } else {
        extremumValue = -Infinity;
        cmp = function cmp(a, b) {
          return a > b;
        };
      }

      var extremums = [];

      data.forEach(function (day) {
        if (cmp(day.value, extremumValue)) {
          extremumValue = day.value;
          extremums = [day];
        } else if (day.value == extremumValue) {
          extremums.push(day);
        }
      });

      return extremums;
    }
  }, {
    key: 'handleMouseOut',
    value: function handleMouseOut() {
      var _this3 = this;

      return function (d, i) {
        _this3.clearSelection();
      };
    }
  }, {
    key: 'clearSelection',
    value: function clearSelection() {
      this.canvas.selectAll('.dot').style('fill', this.options.defaultDotFill).attr('r', this.options.dotRadius);

      this.canvas.selectAll('.selectionRectangle').remove();
    }
  }, {
    key: 'getWeekFor',
    value: function getWeekFor(d) {
      var _this4 = this;

      var week = [];

      this.data.forEach(function (day) {
        if (_this4.sameWeek(d.date, day.date)) {
          week.push(day);
        }
      });

      return week;
    }
  }, {
    key: 'sameWeek',
    value: function sameWeek(d1, d2) {
      return moment(d1).format('W') == moment(d2).format('W');
    }
  }, {
    key: 'getIdFor',
    value: function getIdFor(day) {
      return 'point' + this.name + day.date.toISOString().slice(0, 10);
    }
  }]);

  return Chart;
}();
