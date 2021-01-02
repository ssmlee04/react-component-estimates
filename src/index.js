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

const calculateMargins = (data) => {
  let divider = 1000;
  let unit = 'thousands';
  let u = 'k';
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
  data = _.sortBy(data.filter(d => d.reportDate), (d) => {
    return -d.reportDate;
  }).reverse();

  return data.map((d, i) => {
    const qq = ~~d.reportDate.slice(5, 7);
    let yy =d.reportDate.slice(0, 4);
    let qtr;
    if (qq <= 3) {
      qtr = 'Q1';
    }
    else if (qq <= 6) {
      qtr = 'Q2';
    }
    else if (qq <= 9) {
      qtr = 'Q3';
    }
    else if (qq <= 12) {
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
    const { profile, imgProp = 'estimates_img', prop = 'earnings_av.data' } = this.props;
    const { copied } = this.state;
    if (!profile) {
      return (
        <div style={{ fontSize: 14 }}>Not available at this time... </div>
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
    }).slice(0, 12);

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
                fontColor: 'orange',
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
        eps: -0.05,
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
          data: data.map(d => d.eps)
        },
        {
          label: 'Estimate EPS',
          fill: false,
          type:'line',
          lineTension: 0.3,
          borderWidth: 1,
          backgroundColor: 'rgba(175,14,14,1)',
          borderColor: 'rgba(175,14,14,1)',
          borderCapStyle: 'butt',
          borderDash: [10,5],
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
          data: data.map(d => d.estmiate)
        },
      ]
    };

    return (
      <div style={{ width: '100%', padding: 5, fontSize: 8 }}>
        <div style={{ color: 'darkred', fontWeight: 'bold' }}>{profile.ticker} - {profile.name}</div>
        {CurrentEstimateEps ? <span style={{ fontSize: 8 }}>Current Qtr Estimate (dashed line): <b style={{ color: 'crimson' }}>{CurrentEstimateEps}</b></span> : null}
        {quarterlyData ? <Bar options={options} data={quarterlyData} height={180} /> : null}
        <div style={{ fontSize: 8, color: 'gray' }}>Generated by <span style={{ color: 'darkred' }}>@earningsfly</span> with <span style={{ fontSize: 16, color: 'red' }}>🚀</span></div>
      </div>
    );
  }
}

export default Estimates;
