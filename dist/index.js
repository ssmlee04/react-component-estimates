"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Estimates = void 0;

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

var Estimates =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Estimates, _React$Component);

  function Estimates(props) {
    var _this;

    _classCallCheck(this, Estimates);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Estimates).call(this, props));
    _this.state = {};
    return _this;
  }

  _createClass(Estimates, [{
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

      var _this$props = this.props,
          profile = _this$props.profile,
          _this$props$imgProp = _this$props.imgProp,
          imgProp = _this$props$imgProp === void 0 ? 'estimates_av_img' : _this$props$imgProp,
          _this$props$prop = _this$props.prop,
          prop = _this$props$prop === void 0 ? 'earnings_av.data' : _this$props$prop;
      var copied = this.state.copied;

      if (!profile) {
        return _react["default"].createElement("div", {
          style: {
            fontSize: 8
          }
        }, "Not available at this time... ");
      }

      if (profile[imgProp] && profile[imgProp].url) {
        var btnClass = copied ? 'react-components-show-url btn btn-sm btn-danger disabled font-10' : 'react-components-show-url btn btn-sm btn-warning font-10';
        var btnText = copied ? 'Copied' : 'Copy Img';
        return _react["default"].createElement("div", {
          className: "react-components-show-button"
        }, _react["default"].createElement("img", {
          alt: "".concat(profile.ticker, " - ").concat(profile.name, " earnings estimates"),
          src: profile[imgProp].url,
          style: {
            width: '100%'
          }
        }), _react["default"].createElement(_reactCopyToClipboard.CopyToClipboard, {
          text: profile[imgProp].url || '',
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

      var data = _lodash["default"].get(profile, prop, []);

      if (!data || !data.length) {
        return _react["default"].createElement("div", {
          className: "font-8"
        }, "Not available at this time... ");
      }

      data = data.map(function (d) {
        d.fiscalDate = d.fiscalDate.replace(/-/g, '').slice(0, 6);
        return d;
      }).sort(function (a, b) {
        return a.fiscalDate > b.fiscalDate;
      }).slice(-12);
      var options = {
        legend: {
          labels: {
            fontSize: 8,
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
            labels: {
              show: true
            },
            ticks: {
              fontSize: 10,
              callback: function callback(label, index, labels) {
                return formatNumber2(label, 0);
              }
            }
          }]
        }
      };

      var estimatesLastFiscalDate = _lodash["default"].last(data).fiscalDate;

      var CurrentEstimate = _lodash["default"].get(profile, 'estimates_yh.earnings_0q', {});

      var CurrentEstimateFiscalDate = CurrentEstimate.endDate && CurrentEstimate.endDate.replace(/-/g, '').slice(0, 6);
      var CurrentEstimateEps;

      if (CurrentEstimateFiscalDate > estimatesLastFiscalDate) {
        CurrentEstimateEps = CurrentEstimate.avg;
        data = data.concat([{
          estmiate: CurrentEstimateEps,
          // estmiate: -0.04,
          fiscalDate: CurrentEstimateFiscalDate
        }]);
      }

      var quarterlyData = {
        // labels: quarterly.map(d => d.reportDate),
        labels: data.map(function (d) {
          return d.fiscalDate;
        }),
        datasets: [{
          label: 'Actual EPS',
          fill: false,
          type: 'line',
          lineTension: 0.3,
          borderWidth: 1,
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderWidth: 1,
          // pointStyle: 'rectRot',
          pointRadius: 3,
          pointBackgroundColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132)',
          // pointHitRadius: 20,
          data: data.map(function (d) {
            return d.eps;
          })
        }, {
          label: 'Estimate EPS',
          fill: false,
          type: 'line',
          lineTension: 0.3,
          borderWidth: 1,
          // borderCapStyle: 'butt',
          borderDash: [10, 5],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderWidth: 1,
          // pointStyle: 'circle',
          pointRadius: 3,
          pointBackgroundColor: '#368BC1',
          backgroundColor: '#368BC1',
          borderColor: '#368BC1',
          // pointHitRadius: 20,
          data: data.map(function (d) {
            return d.estmiate;
          })
        }]
      };
      return _react["default"].createElement("div", {
        style: {
          width: '100%',
          padding: 5,
          fontSize: 8
        }
      }, _react["default"].createElement("div", {
        style: {
          color: 'darkred',
          fontWeight: 'bold'
        }
      }, profile.ticker, " - ", profile.name, _react["default"].createElement("span", {
        style: {
          marginLeft: 5,
          color: 'green'
        }
      }, "EPS Estimates")), CurrentEstimateEps ? _react["default"].createElement("span", {
        style: {
          fontSize: 8
        }
      }, "Current Qtr Estimate (dashed line): ", _react["default"].createElement("b", {
        style: {
          color: 'crimson'
        }
      }, CurrentEstimateEps)) : null, quarterlyData ? _react["default"].createElement(_reactChartjs.Bar, {
        options: options,
        data: quarterlyData,
        height: 180
      }) : null, _react["default"].createElement("div", {
        style: {
          fontSize: 8,
          color: 'gray'
        }
      }, "Generated by ", _react["default"].createElement("span", {
        style: {
          color: 'darkred'
        }
      }, "@earningsfly"), " with ", _react["default"].createElement("span", {
        style: {
          fontSize: 16,
          color: 'red'
        }
      }, "\uD83D\uDE80")));
    }
  }]);

  return Estimates;
}(_react["default"].Component);

exports.Estimates = Estimates;
var _default = Estimates;
exports["default"] = _default;