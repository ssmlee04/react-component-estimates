"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Analyst = void 0;

var _react = _interopRequireDefault(require("react"));

var _lodash = _interopRequireDefault(require("lodash"));

var _reactChartjs = require("react-chartjs-2");

var _reactCopyToClipboard = require("react-copy-to-clipboard");

require("./../index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var formatNumber = function formatNumber(number) {
  var toFix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

  if (number < 0) {
    return '-' + formatNumber(-number, toFix);
  }

  if (number > 1000000000) {
    return (number / 1000000000).toFixed(toFix) + '';
  }

  if (number > 1000000) {
    return (number / 1000000).toFixed(toFix) + '';
  }

  if (number > 1000) {
    return (number / 1000).toFixed(toFix) + '';
  }

  return number;
};

var formatNumber2 = function formatNumber2(number) {
  var toFix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

  if (number < 0) {
    return '-' + formatNumber(-number, toFix);
  }

  if (number > 1000000000) {
    return (number / 1000000000).toFixed(toFix);
  }

  if (number > 1000000) {
    return (number / 1000000).toFixed(toFix);
  }

  if (number > 1000) {
    return (number / 1000).toFixed(toFix);
  }

  return number;
};

var calculateMargins = function calculateMargins(data) {
  var divider = 1000;
  var unit = 'thousands';
  var u = 'k';
  if (!data || !data.length) return data;

  if (data[0].rev > 10000000) {
    divider = 1000000;
    unit = 'milllion';
    u = 'm';
  }

  if (data[0].rev > 10000000000) {
    divider = 1000000000;
    unit = 'billion';
    u = 'b';
  }

  data = _lodash["default"].sortBy(data.filter(function (d) {
    return d.reportDate;
  }), function (d) {
    return -d.reportDate;
  }).reverse();
  return data.map(function (d, i) {
    var qq = ~~d.reportDate.slice(5, 7);
    var yy = d.reportDate.slice(0, 4);
    var qtr;

    if (qq <= 3) {
      qtr = 'Q1';
    } else if (qq <= 6) {
      qtr = 'Q2';
    } else if (qq <= 9) {
      qtr = 'Q3';
    } else if (qq <= 12) {
      qtr = 'Q4';
    }

    d.unit = unit;
    d.u = u;
    d.cogsSmall = d.cogs / divider;
    d.ebitSmall = d.ebit / divider;
    d.gpSmall = d.gp / divider;
    d.incomeTaxSmall = d.incomeTax / divider;
    d.niSmall = d.ni / divider;
    d.oiSmall = d.oi / divider;
    d.operatingExpenseSmall = d.operatingExpense / divider;
    d.otherIncomeExpenseSmall = d.otherIncomeExpense / divider;
    d.rndSmall = d.rnd / divider;
    d.sgnaSmall = d.sgna / divider;
    d.revSmall = d.rev / divider;
    d.revenueGrowthYoy = data[i - 4] ? ((d.rev / data[i - 4].rev - 1) * 100).toFixed(2) : '';
    d.quarterStr = yy + qtr;
    d.gpMargin = parseFloat((d.gp / d.rev * 100).toFixed(2));
    d.oiMargin = parseFloat((d.oi / d.rev * 100).toFixed(2));
    d.ebitMargin = parseFloat((d.ebit / d.rev * 100).toFixed(2));
    d.niMargin = parseFloat((d.ni / d.rev * 100).toFixed(2));
    return d;
  });
};

var calculateYearly = function calculateYearly(data) {
  data = _lodash["default"].sortBy(data.filter(function (d) {
    return d.reportDate;
  }), function (d) {
    return -d.reportDate;
  }).reverse();
  var years = {};
  var arr = [];
  data.forEach(function (d, i) {
    var yy = d.reportDate.slice(0, 4);

    if (years[yy] === undefined) {
      years[yy] = arr.length;
    }

    arr[years[yy]] = arr[years[yy]] || {};
    arr[years[yy]].c = arr[years[yy]].c || 0;
    arr[years[yy]].year = arr[years[yy]].year || yy;
    arr[years[yy]].ni = arr[years[yy]].ni || 0;
    arr[years[yy]].ni += d.ni;
    arr[years[yy]].rev = arr[years[yy]].rev || 0;
    arr[years[yy]].rev += d.rev;
    arr[years[yy]].c++;
  });
  return arr.filter(function (d) {
    return d.c === 4;
  });
};

var Analyst =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Analyst, _React$Component);

  function Analyst(props) {
    var _this;

    _classCallCheck(this, Analyst);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Analyst).call(this, props));
    _this.state = {};
    return _this;
  }

  _createClass(Analyst, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      var profile = this.props.profile;
      if (!profile) return true;
      if (nextState.copied) return true;
      if (profile.ticker !== nextProps.profile.ticker) return true;
      return false;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var profile = this.props.profile;
      var copied = this.state.copied;

      if (!profile) {
        return _react["default"].createElement("div", {
          style: {
            fontSize: 14
          }
        }, "Not available at this time... ");
      }

      if (profile.estimate_img && profile.estimate_img.url) {
        var btnClass = copied ? 'react-components-show-url btn btn-sm btn-danger disabled font-10' : 'react-components-show-url btn btn-sm btn-warning font-10';
        var btnText = copied ? 'Copied' : 'Copy Img';
        return _react["default"].createElement("div", {
          className: "react-components-show-button"
        }, _react["default"].createElement("img", {
          alt: "".concat(profile.ticker, " - ").concat(profile.name, " analyst opinions"),
          src: profile.estimate_img.url,
          style: {
            width: '100%'
          }
        }), _react["default"].createElement(_reactCopyToClipboard.CopyToClipboard, {
          text: profile.estimate_img.url || '',
          onCopy: function onCopy() {
            return _this2.setState({
              copied: true
            });
          }
        }, _react["default"].createElement("button", {
          className: btnClass,
          value: btnText
        }, btnText)));
      }

      if (!profile) {
        return _react["default"].createElement("div", {
          className: "font-12"
        }, "Not available at this time... ");
      }

      var data = _lodash["default"].get(profile, 'income_and_revenue.data', []);

      if (!data || !data.length) {
        return _react["default"].createElement("div", {
          className: "font-12"
        }, "Not available at this time... ");
      }

      data = data.map(function (d) {
        d.reportDate = d.reportDate.replace(/-/g, '').slice(0, 6);
        return d;
      });
      var yearly = calculateYearly(data);
      var quarterly = calculateMargins(data.slice(0, 12));
      var minQuarterly = quarterly.reduce(function (t, d) {
        return Math.min(t, d.rev);
      }, 9999999999999999) / 2;
      var minYearly = yearly.reduce(function (t, d) {
        return Math.min(t, d.rev);
      }, 9999999999999999) / 2;
      var unit = data && data[0].unit;
      var optionsQuarterly = {
        tooltips: {
          callbacks: {
            label: function label(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }

              label += formatNumber(tooltipItem.yLabel);
              return label;
            }
          }
        },
        legend: {
          labels: {
            fontSize: 12,
            boxWidth: 12
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: false,
              fontSize: 10
            },
            barPercentage: 0.4
          }],
          yAxes: [{
            type: 'linear',
            display: true,
            position: 'right',
            id: 'earnings',
            gridLines: {
              display: false
            },
            labels: {
              show: true
            },
            ticks: {
              fontSize: 10,
              fontColor: 'orange',
              callback: function callback(label, index, labels) {
                return formatNumber2(label, 0);
              }
            }
          }, {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'revenue',
            labels: {
              show: true
            },
            ticks: {
              fontSize: 10,
              min: minQuarterly,
              callback: function callback(label, index, labels) {
                return formatNumber(label, 0);
              }
            }
          }]
        }
      };
      var optionsYearly = {
        tooltips: {
          callbacks: {
            label: function label(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }

              label += formatNumber(tooltipItem.yLabel);
              return label;
            }
          }
        },
        legend: {
          labels: {
            fontSize: 12,
            boxWidth: 12
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: false,
              fontSize: 10
            },
            barPercentage: 0.2
          }],
          yAxes: [{
            type: 'linear',
            display: true,
            position: 'right',
            id: 'earnings',
            gridLines: {
              display: false
            },
            labels: {
              show: true
            },
            ticks: {
              fontSize: 10,
              fontColor: 'orange',
              callback: function callback(label, index, labels) {
                return formatNumber2(label, 0);
              }
            }
          }, {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'revenue',
            labels: {
              show: true
            },
            ticks: {
              fontSize: 10,
              min: minYearly,
              callback: function callback(label, index, labels) {
                return formatNumber(label, 0);
              }
            }
          }]
        }
      };
      var yearlyData = {
        labels: yearly.map(function (d) {
          return d.year;
        }),
        datasets: [{
          label: "Yearly Earnings (".concat(unit, ")"),
          type: 'line',
          fill: false,
          lineTension: 0,
          borderWidth: 0,
          backgroundColor: 'orange',
          borderColor: 'orange',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'gray',
          pointBackgroundColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
          pointRadius: 2,
          pointHitRadius: 6,
          yAxisID: 'earnings',
          data: yearly.map(function (d) {
            return d.ni;
          })
        }, {
          label: "Annual Revenue (".concat(unit, ")"),
          type: 'bar',
          lineTension: 0,
          backgroundColor: '#368BC1',
          borderColor: '#368BC1',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'gray',
          pointBackgroundColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
          pointRadius: 2,
          pointHitRadius: 6,
          yAxisID: 'revenue',
          data: yearly.map(function (d) {
            return d.rev;
          })
        }]
      };

      var estimate = _lodash["default"].get(profile, 'estimate.data.consensusEPS', null);

      var earningsData = JSON.parse(JSON.stringify(_lodash["default"].get(profile, 'earnings.data', []))).reverse();
      var earningsDataAndEstimate = earningsData.concat([{
        fiscalPeriod: 'est',
        consensusEPS: estimate
      }]);
      var quarterlyData = {
        // labels: quarterly.map(d => d.reportDate),
        labels: earningsDataAndEstimate.map(function (d) {
          return d.fiscalPeriod;
        }),
        datasets: [{
          label: 'Actual EPS',
          fill: false,
          type: 'line',
          lineTension: 0,
          borderWidth: 1,
          backgroundColor: 'orange',
          borderColor: 'orange',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'red',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(0,100,0,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointStyle: 'rectRot',
          pointRadius: 2,
          pointHitRadius: 20,
          data: earningsData.map(function (d) {
            return d.actualEPS;
          })
        }, {
          label: 'Estimate EPS',
          fill: false,
          type: 'line',
          lineTension: 0,
          borderWidth: 1,
          backgroundColor: 'rgba(175,14,14,1)',
          borderColor: 'rgba(175,14,14,1)',
          borderCapStyle: 'butt',
          borderDash: [10, 5],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'red',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(0,100,0,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointStyle: 'circle',
          pointRadius: 2,
          pointHitRadius: 20,
          data: earningsDataAndEstimate.map(function (d) {
            return d.consensusEPS;
          })
        }, {
          label: "Revenue (".concat(unit, ")"),
          type: 'bar',
          lineTension: 0,
          backgroundColor: '#368BC1',
          borderColor: '#368BC1',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'gray',
          pointBackgroundColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
          pointRadius: 2,
          pointHitRadius: 6,
          yAxisID: 'revenue',
          data: quarterly.slice(0, earningsDataAndEstimate.length - 1).map(function (d) {
            return d.rev;
          })
        }]
      };
      return _react["default"].createElement("div", {
        style: {
          width: '100%',
          padding: 5,
          fontSize: 14
        }
      }, _react["default"].createElement("div", {
        style: {
          color: 'darkred',
          fontWeight: 'bold'
        }
      }, profile.ticker, " - ", profile.name), estimate ? _react["default"].createElement("span", {
        style: {
          fontSize: 10
        }
      }, "Current Qtr Estimate (dashed line): ", _react["default"].createElement("b", {
        style: {
          color: 'crimson'
        }
      }, estimate)) : null, quarterlyData ? _react["default"].createElement(_reactChartjs.Bar, {
        options: optionsQuarterly,
        data: quarterlyData,
        height: 150
      }) : null, _react["default"].createElement("hr", {
        style: {
          margin: 1
        }
      }), yearlyData ? _react["default"].createElement(_reactChartjs.Bar, {
        options: optionsYearly,
        data: yearlyData,
        height: 150
      }) : null);
    }
  }]);

  return Analyst;
}(_react["default"].Component);

exports.Analyst = Analyst;
var _default = Analyst;
exports["default"] = _default;