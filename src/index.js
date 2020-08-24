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

const calculateYearly = (data) => {
  data = _.sortBy(data.filter(d => d.reportDate), (d) => {
    return -d.reportDate;
  }).reverse();

  const years = {};
  const arr = [];
  data.forEach((d, i) => {
    let yy = d.reportDate.slice(0, 4);
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
  return arr.filter(d => d.c === 4);
};

export class Analyst extends React.Component {
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
    const { profile } = this.props;
    const { copied } = this.state;
    if (!profile) {
      return (
        <div style={{ fontSize: 14 }}>Not available at this time... </div>
      );
    }
    if (profile.estimate_img && profile.estimate_img.url) {
      const btnClass = copied ? 'react-components-show-url btn btn-sm btn-danger disabled font-10' : 'react-components-show-url btn btn-sm btn-warning font-10';
      const btnText = copied ? 'Copied' : 'Copy Img';
      return (
        <div className='react-components-show-button'>
          <img alt={`${profile.ticker} - ${profile.name} earnings estimates`} src={profile.estimate_img.url} style={{ width: '100%' }} />
          <CopyToClipboard text={profile.estimate_img.url || ''}
            onCopy={() => this.setState({ copied: true })}
          >
            <button className={btnClass} value={btnText}>{btnText}</button>
          </CopyToClipboard>
        </div>
      );
    }
    if (!profile) {
      return (
        <div className='font-12'>Not available at this time... </div>
      );
    }
    let data = _.get(profile, 'income_and_revenue.data', []);
    if (!data || !data.length) {
      return (
        <div className='font-12'>Not available at this time... </div>
      );
    }
    data = data.map(d => {
      d.reportDate = d.reportDate.replace(/-/g, '').slice(0, 6);
      return d;
    });
    const yearly = calculateYearly(data);
    const quarterly = calculateMargins(data.slice(0, 12));
    const minQuarterly = quarterly.reduce((t, d) => {
      return Math.min(t, d.rev);
    }, 9999999999999999) / 2;
    const minYearly = yearly.reduce((t, d) => {
      return Math.min(t, d.rev);
    }, 9999999999999999) / 2;
    const unit = data && data[0].unit;

    var optionsQuarterly = {
      tooltips: {
        callbacks: {
                label: function(tooltipItem, data) {
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
                callback: function(label, index, labels) {
                  return formatNumber2(label, 0);
                }
            },
          },
          {
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
              callback: function(label, index, labels) {
                return formatNumber(label, 0);
              }
            },
          },
        ]
      }
    };

    var optionsYearly = {
      tooltips: {
        callbacks: {
                label: function(tooltipItem, data) {
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
          boxWidth: 12,
        }
      },
      scales: {
        xAxes: [ { ticks: {
          autoSkip: false,
          fontSize: 10
        }, barPercentage: 0.2 } ],
        yAxes: [
          {
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
                callback: function(label, index, labels) {
                  return formatNumber2(label, 0);
                }
            },
          },
          {
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
              callback: function(label, index, labels) {
                return formatNumber(label, 0);
              }
            },
          },
        ]
      }
    };

    const yearlyData = {
      labels: yearly.map(d => d.year),
      datasets: [
        {
          label: `Yearly Earnings (${unit})`,
          type:'line',
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
          data: yearly.map(d => d.ni)
        },
        {
          label: `Annual Revenue (${unit})`,
          type:'bar',
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
          data: yearly.map(d => d.rev)
        },
      ]
    };

    const estimate = _.get(profile, 'estimate.data.consensusEPS', null);
    const earningsData = JSON.parse(JSON.stringify(_.get(profile, 'earnings.data', []))).reverse();
    const earningsDataAndEstimate = earningsData.concat([{ fiscalPeriod: 'est', consensusEPS: estimate }]);

    const quarterlyData = {
      // labels: quarterly.map(d => d.reportDate),
      labels: earningsDataAndEstimate.map(d => d.fiscalPeriod),
      datasets: [
        {
          label: 'Actual EPS',
          fill: false,
          type:'line',
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
          data: earningsData.map(d => d.actualEPS)
        },
        {
          label: 'Estimate EPS',
          fill: false,
          type:'line',
          lineTension: 0,
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
          data: earningsDataAndEstimate.map(d => d.consensusEPS)
        },
        {
          label: `Revenue (${unit})`,
          type:'bar',
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
          data: quarterly.slice(0, earningsDataAndEstimate.length - 1).map(d => d.rev)
        },
      ]
    };

    return (
      <div style={{ width: '100%', padding: 5, fontSize: 14 }}>
        <div style={{ color: 'darkred', fontWeight: 'bold' }}>{profile.ticker} - {profile.name}</div>
        {estimate ? <span style={{ fontSize: 10 }}>Current Qtr Estimate (dashed line): <b style={{ color: 'crimson' }}>{estimate}</b></span> : null}
        {quarterlyData ? <Bar options={optionsQuarterly} data={quarterlyData} height={150} /> : null}
        <hr style={{ margin: 1 }} />
        {yearlyData ? <Bar options={optionsYearly} data={yearlyData} height={150} /> : null}
      </div>
    );
  }
}

export default Analyst;
