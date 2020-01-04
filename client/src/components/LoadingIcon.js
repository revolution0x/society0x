import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropagateLoader from 'react-spinners/PropagateLoader';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '15px'
    },
    innerContainer: {
        width: '168px',
        paddingRight: '15px',
    },
    alignment: {
        left: '50%',
        position: 'relative',
    }
}));

export default function LoadingIcon() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.innerContainer}>
                <div className={classes.alignment}>
                    <PropagateLoader color={"white"}></PropagateLoader>
                </div>
            </div>
        </div>
    );
}