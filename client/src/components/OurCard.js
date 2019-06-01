import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {Redirect} from 'react-router-dom';

const styles = theme => ({
  card: {
    width: 345,
    marginBottom: theme.spacing.unit * 3,
  },
  media: {
    height: 240,
  },
});

class OurCard extends Component {

    constructor(props){
        super(props);
        this.state = {
            redirect: null
        }
    }

    setRedirect(link){
        this.setState({
            redirect: link
        })
    }

    render(){
        const { classes, heading, description, link, media } = this.props;
        const {redirect} = this.state;
        return (
            <React.Fragment>
                {redirect &&
                    <Redirect to={link}/>
                }
                {!redirect && 
                    <Card className={classes.card}>
                    <CardActionArea onClick={() => this.setRedirect(link)}>
                        <CardMedia
                        className={classes.media}
                        image={media}
                        title={heading}
                        />
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {heading}
                        </Typography>
                        <Typography component="p">
                            {description}
                        </Typography>
                        </CardContent>
                    </CardActionArea>
                    <CardActions>
                        <Button size="small" color="primary">
                        Share
                        </Button>
                        <Button size="small" color="primary">
                        Learn More
                        </Button>
                    </CardActions>
                </Card>}
            </React.Fragment>
        );
    }
}

OurCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OurCard);