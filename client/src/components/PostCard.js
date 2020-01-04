import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export default function PostCard({style, image}) {
  return (
    <Card style={style}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          height="420"
          image={image}
          style={{pointerEvents: 'none'}}
          title="Contemplative Reptile"
        />
      </CardActionArea>
      <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Apeiron
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            The apeiron is central to the cosmological theory created by Anaximander, a 6th-century BC pre-Socratic Greek philosopher whose work is mostly lost. From the few existing fragments, we learn that he believed the beginning or ultimate reality (arche) is eternal and infinite, or boundless (apeiron), subject to neither old age nor decay, which perpetually yields fresh materials from which everything we can perceive is derived. Apeiron generated the opposites (hot–cold, wet–dry, etc.) which acted on the creation of the world (cf. Heraclitus). Everything is generated from apeiron and then it is destroyed by going back to apeiron, according to necessity. He believed that infinite worlds are generated from apeiron and then they are destroyed there again. - Wikipedia
          </Typography>
        </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          Share
        </Button>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}