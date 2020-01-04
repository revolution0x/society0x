import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    height: '30px'
  },
  progressBar: {
    height: 8,
  },
  progressBarBuffer: {
    marginTop: '2px'
  },
  milestoneOverlay: {
    position: 'relative'
  },
  milestone: {
    backgroundColor: '#000000',
    height: '25px',
    position: 'absolute',
    zIndex: '10',
    width: '4px',
    transform: 'translateY(-8px)translateX(-50%)',
  },
  milestoneLabel: {
    position: 'absolute',
    transform: 'translateX(-50%)translateY(100%)',
    whiteSpace: 'nowrap',
  },
  milestoneLabelFirst: {
    position: 'absolute',
    transform: 'translateX(0%)translateY(100%)',
    whiteSpace: 'nowrap',
  },
  milestoneLabelFinal: {
    position: 'absolute',
    transform: 'translateX(-100%)translateY(100%)',
    whiteSpace: 'nowrap',
  },
  className: {
    position: 'relative'
  },
  bar1Buffer: {
    backgroundColor: '#737373'
  }
});

export default function LinearBuffer({initCompleted, initBuffer = 0, initMilestones = []}) {
  const classes = useStyles();
  const [completed, setCompleted] = React.useState(initCompleted);
  const [buffer, setBuffer] = React.useState(initBuffer);
  const [milestones, setMilestones] = React.useState(initMilestones);

  React.useEffect(() => {
    if(completed !== initCompleted || buffer !== initBuffer || milestones !== initMilestones){
      setCompleted(initCompleted);
      setBuffer(initBuffer);
      setMilestones(initMilestones);
    }
  }, [initCompleted, initBuffer, initMilestones, completed, buffer, milestones]);

  return (
    <div className={classes.root}>
      <div className={classes.milestoneOverlay}>
        {initMilestones.map((item, index) => {
          let typographyClass = classes.milestoneLabel;
          if(index === (initMilestones.length - 1)) {
            typographyClass = classes.milestoneLabelFinal;
          } else if (index === 0) {
            typographyClass = classes.milestoneLabelFirst;
          }
          let bufferLabelClasses = "buffer-milestone-label";
          if(item.forceVisible) {
            bufferLabelClasses = "buffer-milestone-label-force-visibility";
          }
          return (
            <div key={"buffer-milestone-" + index} className={["buffer-milestone-container"].join(" ")}>
              <div style={{left: `${item.value}%`}} className={classes.milestone}></div>
              <Typography style={{left: `${item.value}%`}} component={"p"} className={[typographyClass, bufferLabelClasses].join(" ")} variant="subtitle2" gutterBottom>
                {item.label}
              </Typography>
            </div>
          )
        })}
      </div>
      <LinearProgress classes={{dashed: classes.progressBarBuffer, bar1Buffer: classes.bar1Buffer }} className={classes.progressBar} variant="buffer" value={completed} valueBuffer={buffer} />
    </div>
  );
}