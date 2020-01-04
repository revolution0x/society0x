import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import OurChartVX from './OurChartVX';
import { tokenValueFormatDisplay } from '../../../utils';
import Loading from '../Loading';
import { withParentSize } from '@vx/responsive';

const styles = theme => ({
    outerContainer: {
        display: 'flex',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
    },
    center: {
        flexDirection: 'column',
        display: 'flex',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    innerContainer: {
        flex: 1,
        display:'flex'
    },
    chart: {
        flexDirection: 'column',
        display:'flex',
        color: 'white',
        borderRadius: '4px',
        width: '100%'
    },
    vxChartTitle: {
        color: 'white',
        fontWeight: '500'
    },
    vxChartSubtitle: {
        color: 'white'
    },
    disclaimer: {
        color: 'black',
        opacity: 0.6
    },
    spacer: {
        flex: 1
    },
    titleBar: {
        display: 'flex',
        flexDirection:'row',
        alignItems: 'center',
        padding: '15px',
    },
    leftTitles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    rightTitles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    vxPriceIncrease: {
        color: 'limegreen'
    },
    vxPriceDecrease: {
        color: 'red'
    }
});

class OurChartContainerVX extends React.Component {

    render() {
        const { classes, margin, primaryValueSubtitle = false, chartTitle, chartSubtitle, isConsideredMobile, chartData, parentWidth, parentHeight, isChartLoading, chartCurrency } = this.props;
        let currentPrice = 0;
        let diffPrice = 0;
        let hasIncreased = true;
        let prices = [];
        let percentDiff = 0;

        let useMargin = {
            top: 15,
            bottom: 40,
            left: 0,
            right: 0
        }

        if (margin) {
            useMargin = margin;
        }

        if (chartData && chartData.length  > 0) {
            prices = Object.keys(chartData).map(key => {
                return {
                    xAxisValue: chartData[key].xAxisValue,
                    yAxisValue: chartData[key].yAxisValue
                };
            })
            let indexOfFirstNonZeroValue = prices.findIndex(priceObj=> priceObj.yAxisValue > 0);
            let firstPrice = prices[indexOfFirstNonZeroValue].yAxisValue;
            currentPrice = prices[prices.length - 1].yAxisValue;
            percentDiff = ((currentPrice * 100) / firstPrice) - 100;
            diffPrice = currentPrice - firstPrice;
            hasIncreased = diffPrice >= 0;
        }
        return (
            <div className={classes.outerContainer}>
                <Loading isLoading={isChartLoading} width={parentWidth} height={parentHeight}/>
                <div className={classes.center}>
                    <div className={classes.chart + " elevation-shadow-two our-gradient"} style={{ width: '100%', height: '500px' }}>
                        <div className={classes.titleBar}>
                            <div className={classes.leftTitles}>
                                <div>
                                    <Typography className={classes.vxChartTitle + " no-padding-bottom"} variant="h5" component="h2">
                                        {chartTitle}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography className={classes.vxChartSubtitle + " no-padding-top"} component="p">
                                        {chartSubtitle}
                                    </Typography>
                                </div>
                            </div>
                            <div className={classes.spacer}/>
                            <div className={classes.rightTitles}>
                                <div>
                                    <Typography className={classes.vxChartTitle + " no-padding-bottom"} variant="h5" component="h2">
                                        {tokenValueFormatDisplay(currentPrice, 2, chartCurrency)}
                                    </Typography>
                                </div>
                                <div>
                                    {!primaryValueSubtitle &&
                                        <Typography className={classes.vxChartSubtitle + " no-padding-top " + (hasIncreased ? classes.vxPriceIncrease : classes.vxPriceDecrease)} component="p">
                                            {hasIncreased ? ("+ " + tokenValueFormatDisplay(percentDiff, 2, "%")) : ("- " + tokenValueFormatDisplay(percentDiff * -1, 2, "%"))}
                                        </Typography>
                                    }
                                    {primaryValueSubtitle}
                                </div>
                            </div>
                        </div>
                        <div className={classes.innerContainer}>
                            <OurChartVX isConsideredMobile={isConsideredMobile} chartCurrency={chartCurrency} margin={useMargin} data={prices} />
                        </div>
                    </div>
                </div>
                {/* <Typography className={classes.disclaimer} gutterBottom component="p">
                    {chartData.disclaimer}
                </Typography> */}
            </div>
        )
    }
}

OurChartContainerVX.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    margin: PropTypes.object
};
    
export default withParentSize(withStyles(styles, { withTheme: true })(OurChartContainerVX));