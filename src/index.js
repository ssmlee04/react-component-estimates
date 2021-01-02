import React from 'react';
import _ from 'lodash';
import { Bar } from 'react-chartjs-2';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './../index.css';

const formatNumber = (number, toFix = 2) => {
  if (number < 0) {
    return '-' + formatNumber(-number, toFix);
  }
  if (number > 1000000000) {
    return (number/1000000000).toFixed(toFix)+'';
  }
  if (number > 1000000) {
    return (number/1000000).toFixed(toFix)+'';
  }
  if (number > 1000) {
    return (number/1000).toFixed(toFix)+'';
  }
  return number;
};

const formatNumber2 = (number, toFix = 2) => {
  if (number < 0) {
    return '-' + formatNumber(-number, toFix);
  }
  if (number > 1000000000) {
    return (number/1000000000).toFixed(toFix);
  }
  if (number > 1000000) {
    return (number/1000000).toFixed(toFix);
  }
  if (number > 1000) {
    return (number/1000).toFixed(toFix);
  }
  return number;
};

export class Estimates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { profile } = this.props;
    if (!profile) return true;
    if (nextState.copied) return true;
    if (profile.ticker !== nextProps.profile.ticker) return true;
    return false;
  }

  render() {
    const { profile, imgProp = 'estimates_av_img', prop = 'earnings_av.data' } = this.props;
    const { copied } = this.state;
    if (!profile) {
      return (
        <div style={{ fontSize: 8 }}>Not available at this time... </div>
      );
    }
    if (profile[imgProp] && profile[imgProp].url) {
      const btnClass = copied ? 'react-components-show-url btn btn-sm btn-danger disabled font-10' : 'react-components-show-url btn btn-sm btn-warning font-10';
      const btnText = copied ? 'Copied' : 'Copy Img';
      return (
        <div className='react-components-show-button'>
          <img alt={`${profile.ticker} - ${profile.name} earnings estimates`} src={profile[imgProp].url} style={{ width: '100%' }} />
          <CopyToClipboard text={profile[imgProp].url || ''}
            onCopy={() => this.setState({ copied: true })}
          >
            <button className={btnClass} value={btnText}>{btnText}</button>
          </CopyToClipboard>
        </div>
      );
    }
    let data = _.get(profile, prop, []);
    if (!data || !data.length) {
      return (
        <div className='font-8'>Not available at this time... </div>
      );
    }
    data = data.map(d => {
      d.fiscalDate = d.fiscalDate.replace(/-/g, '').slice(0, 6);
      return d;
    }).sort((a, b) => a.fiscalDate > b.fiscalDate).slice(-12);

    var options = {
      legend: {
        labels: {
          fontSize: 8,
          boxWidth: 12,
        }
      },
      scales: {
        xAxes: [ { ticks: {
          autoSkip: false,
          fontSize: 10
        }, barPercentage: 0.4 } ],
        yAxes: [
          {
            type: 'linear',
            display: true,
            labels: {
              show: true
            },
            ticks: {
              fontSize: 10,
                callback: function(label, index, labels) {
                  return formatNumber2(label, 0);
                }
            },
          },
        ]
      }
    };

    const estimatesLastFiscalDate = _.last(data).fiscalDate
    const CurrentEstimate = _.get(profile, 'estimates_yh.earnings_0q', {});
    const CurrentEstimateFiscalDate = CurrentEstimate.endDate && CurrentEstimate.endDate.replace(/-/g, '').slice(0, 6);
    let CurrentEstimateEps;
    if (CurrentEstimateFiscalDate > estimatesLastFiscalDate) {
      CurrentEstimateEps = CurrentEstimate.avg
      data = data.concat([{
        estmiate: CurrentEstimateEps,
        // estmiate: -0.04,
        fiscalDate: CurrentEstimateFiscalDate,
      }])
    }

    const quarterlyData = {
      // labels: quarterly.map(d => d.reportDate),
      labels: data.map(d => d.fiscalDate),
      datasets: [
        {
          label: 'Actual EPS',
          fill: false,
          type:'line',
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
          data: data.map(d => d.eps)
        },
        {
          label: 'Estimate EPS',
          fill: false,
          type:'line',
          lineTension: 0.3,
          borderWidth: 1,
          // borderCapStyle: 'butt',
          borderDash: [10,5],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderWidth: 1,
          // pointStyle: 'circle',
          pointRadius: 3,
          pointBackgroundColor: 'rgb(66, 33, 199)',
          backgroundColor: 'rgb(66, 33, 199)',
          borderColor: 'rgba(66, 33, 199)',
          // pointHitRadius: 20,
          data: data.map(d => d.estmiate)
        },
      ]
    };

    return (
      <div style={{ width: '100%', padding: 5, fontSize: 8 }}>
        <div style={{ color: 'darkred', fontWeight: 'bold' }}>{profile.ticker} - {profile.name}<span style={{ marginLeft: 5, color: 'green' }}>EPS Estimates</span></div>
        {CurrentEstimateEps ? <span style={{ fontSize: 8 }}>Current Qtr Estimate (dashed line): <b style={{ color: 'crimson' }}>{CurrentEstimateEps}</b></span> : null}
        {quarterlyData ? <Bar options={options} data={quarterlyData} height={180} /> : null}
        <div style={{ fontSize: 8, color: 'gray' }}>Generated by <span style={{ color: 'darkred' }}>@earningsfly</span> with <span style={{ fontSize: 16, color: 'red' }}>🚀</span></div>
      </div>
    );
  }
}

export default Estimates;
