import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import FundsIcon from '@material-ui/icons/EmojiNature';
import FundPage from "./FundPage";
import Fab from '@material-ui/core/Fab';
import {Link} from 'react-router-dom';
import {getFundListUrlSlugs} from "../../services/society0x";

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing(2),
    },
    fab: {
        width: '100%',
        maxWidth: '300px',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(5),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    segmentContainer: {
        paddingBottom: theme.spacing(5),
    },
})

class FundsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundListUrlSlugs: [],
        };
    }

    componentDidMount = async () => {
        try {
            let fundListUrlSlugs = await getFundListUrlSlugs();
            if(fundListUrlSlugs && fundListUrlSlugs.length > 0){
                this.setState({
                    fundListUrlSlugs: fundListUrlSlugs,
                })
            }
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        const {classes} = this.props;
        const { fundListUrlSlugs } = this.state;
        return (
            <React.Fragment>
                <div className="text-align-center">
                    <Link to={'/create/fund'} className={["no-decorate", classes.link].join(" ")}>
                        <Fab color="primary" variant="extended" className={classes.fab}>
                            <FundsIcon className={classes.extendedIcon} />
                            Start A New Fund
                        </Fab>
                    </Link>
                    {fundListUrlSlugs.map(item => {
                        return (
                            <div key={`fund-list-${item}`} className={classes.segmentContainer}>
                                <FundPage isPreview={true} fundUrlSlug={item} isLinkToFund={true}/>
                            </div>
                        )
                    })}
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(FundsPage);