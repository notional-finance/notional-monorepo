import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
} from 'recharts';
import { getStyles, getDateString } from '@notional-finance/utils';
import { FormattedMessage } from 'react-intl';
import XAxisDateTick from './components/XAxisDateTick';
import CustomDot from './components/CustomDot';
import YAxisTick from './components/YAxisTick';

const ChartWrapper = styled('div')(
  ({ theme }) => `
  padding-top: 32px;
  display: inline-block;
  width: 100%;

  .recharts-surface {
    overflow: visible;
  }

  /* Hack alert!  Overriding CSS from 3rd party lib.
     Don't do that if possible... */
  .recharts-yAxis {
    .recharts-cartesian-axis-tick-line {
      display: none;
    }

    .recharts-cartesian-axis-tick-value {
      tspan {
        letter-spacing: 0.03em;
        font-size: 12px;
      }
    }
  }

  /* Hack alert!  Overriding CSS from 3rd party lib.
    Don't do that if possible... */
  .recharts-xAxis {
    .recharts-cartesian-axis-tick {
      margin-top: 10px;
    }
    svg { fill: ${theme.palette.background.paper}; }
    .x-axis-label {
      letter-spacing: 0.03em;
      font-size: 12px;
      fill: ${theme.palette.primary.main};
      font-weight: 600;
    }

    .is-selected {
      font-weight: 600;
    }
  }

  .dot-group {
    .dot-border {
      fill: ${theme.palette.common.white};
    }

    .dot-interior {
      fill: ${theme.palette.primary.main};
    }

    .dot-border-selected {
      fill: ${theme.palette.primary.accent};
    }

    .dot-interior-selected {
      fill: ${theme.palette.common.white};
    }
  }

  .recharts-cartesian-grid-horizontal {
    line {
      stroke: ${theme.palette.primary.accent};
      opacity: 0.75;
    }
  }

  .tooltip {
    background: ${theme.palette.common.white};
    padding: 5px 10px;
    min-width: 85px;
    text-align: center;
    box-shadow: ${theme.shadows.standard};

    & > span {
      margin: 0;
      display: block;
      font-size: 14px;
      font-weight: 500;
    }
  }
`
);

const ONE_WEEK = 86400 * 7;

class Chart extends Component {
  getMarketData() {
    const { currency, markets } = this.props;
    let marketData;

    if (markets && markets.length) {
      marketData = markets
        .map((market) => {
          const obj = {
            maturity: market.maturity,
            marketKey: market.marketKey,
          };
          // This is the displayed currency
          obj[currency] = parseFloat(market.midRate.substring(0, market.midRate.length - 1), 10);

          return obj;
        })
        .filter((v) => !Number.isNaN(v[currency]));
    }

    return marketData;
  }

  getSelectedMaturity = (selectedMarketKey) => {
    try {
      return parseInt(selectedMarketKey.split(':')[2], 10);
    } catch {
      return null;
    }
  };

  getYAxisTicks = (marketData) => {
    const { currency, gridHeight } = this.props;
    const maxRate = Math.max(...marketData.map((m) => m[currency]));
    const maxTick = maxRate * 1.5;

    const ticks = new Array(6).fill(0).map((_, i) => {
      if (i < 5) return (i * maxTick) / 5;
      return maxTick;
    });

    // The grid height has an offset of 5 from the bottom and a margin at top
    // and bottom of 5. We do this manual calculation to ensure an extra line is
    // not automatically drawn by recharts.
    const height = gridHeight - 10;
    const lines = ticks.map((t) => height - (t / maxTick) * height + 15);
    return { ticks, lines, maxTick };
  };

  selectMaturity = (marketKey) => {
    const { setSelectedMarket, unsetSelectedMarket, selectedMarketKey, lockSelection } = this.props;
    // Disable further selection if the confirmation modal is open
    if (lockSelection) return;
    if (marketKey === selectedMarketKey) unsetSelectedMarket();
    else setSelectedMarket(marketKey);
  };

  renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { currency } = this.props;
      const { maturity } = payload[0].payload;
      const midRate = payload[0].payload[currency];

      return (
        <div className="tooltip">
          <span className="maturity-rate">
            <FormattedMessage defaultMessage={'Maturity'} />: {getDateString(maturity)}
          </span>
          <span className="maturity-rate">
            <FormattedMessage defaultMessage={'Interest Rate'} />: {midRate}%
          </span>
        </div>
      );
    }

    return null;
  };

  render() {
    const { currency, chartHeight, selectedMarketKey, gridHeight } = this.props;
    const marketData = this.getMarketData();
    const selectedMaturity = this.getSelectedMaturity(selectedMarketKey);

    if (marketData && marketData.length) {
      const { ticks, lines, maxTick } = this.getYAxisTicks(marketData);
      return (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ComposedChart data={marketData}>
              {/* Tooltips are don't have a click handler which makes the dot a little hard to click
               * when the chart is rendered. If we want to add it we have to add a custom tooltip
               * react element.
               */}
              <Tooltip content={this.renderTooltip} position={{ y: 0 }} />
              <XAxis
                id="maturity"
                dataKey="maturity"
                scale="time"
                type="number"
                axisLine={false}
                domain={[(dataMin) => dataMin - ONE_WEEK, (dataMax) => dataMax + ONE_WEEK]}
                tick={
                  <XAxisDateTick
                    selectedMaturity={selectedMaturity}
                    marketData={marketData}
                    onClick={this.selectMaturity}
                  />
                }
              />
              <YAxis
                yAxisId="line"
                orientation="left"
                ticks={ticks}
                tick={<YAxisTick lines={lines} values={ticks} />}
                interval={0}
                unit="%"
                axisLine={false}
                domain={[0, maxTick]}
              />
              <Area
                type="monotone"
                dataKey={currency}
                strokeWidth={2}
                stroke={getStyles('aqua')}
                isAnimationActive={false}
                yAxisId="line"
                fillOpacity={1}
                fill="url(#shade)"
                dot={
                  <CustomDot selectedMaturity={selectedMaturity} onClick={this.selectMaturity} />
                }
              />
              <CartesianGrid
                vertical={false}
                horizontal
                height={gridHeight}
                horizontalPoints={lines}
              />
              <defs>
                <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2BCAD0" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8BC1E5" stopOpacity={0.5} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );
    }

    return <div />;
  }
}

Chart.propTypes = {
  currency: PropTypes.string.isRequired,
  markets: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  chartHeight: PropTypes.number,
  gridHeight: PropTypes.number,
  selectedMarketKey: PropTypes.string,
  setSelectedMarket: PropTypes.func.isRequired,
  unsetSelectedMarket: PropTypes.func.isRequired,
  lockSelection: PropTypes.bool.isRequired,
};

Chart.defaultProps = {
  chartHeight: 300,
  gridHeight: 260,
  selectedMarketKey: '',
};

export default Chart;
