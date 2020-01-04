import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    loadingContainer: {
        position: "absolute",
        zIndex: "10",
        left: "50%",
        top: "50%",
        transform: "translateY(-50%)translateX(-50%)"
    }
});

class Loading extends React.Component {
    render() {
        const { classes, width, height, isLoading } = this.props;
        const containerFitToParent = {
            height:height,
            width:width,
            position:"absolute",
            zIndex: "5"
        }

        if (isLoading) {
            return (
                <div style={containerFitToParent}>
                    <div className={classes.loadingContainer}>
                        <div className={"sk-folding-cube"}>
                            <div className="sk-cube1 sk-cube"></div>
                            <div className="sk-cube2 sk-cube"></div>
                            <div className="sk-cube4 sk-cube"></div>
                            <div className="sk-cube3 sk-cube"></div>
                        </div>
                    </div>
                </div>
            );
        }else{
            return <div></div>
        }
    }
}

Loading.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Loading);