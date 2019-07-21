import React from 'react';
import blockies from "blockies-identicon";

export default class BlockiesIdenticon extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getSeed();
    this.canvas = React.createRef();
  }
  getSeed(props = {}) {
    return {
        seed: this.props.seed || props.seed || "seed",
        color: this.props.color || props.color || "#7d7d7d",
        bgcolor: this.props.bgcolor || props.bgcolor || "#000",
        size: this.props.size || props.size || 15,
        scale: this.props.scale || props.scale || 3,
        spotcolor: this.props.spotcolor || props.spotcolor || "#fff"
    }
  }
  componentDidMount() {
    this.draw(this.getSeed(this.props))
  }
  componentDidUpdate(prevProps) {
    if(JSON.stringify(prevProps) !== JSON.stringify(this.props)){
        this.draw(this.getSeed(this.props));
    }
  }
  draw(props) {
    blockies.render(props, this.canvas.current);
  }
  render() {
    return (
        <React.Fragment>
            <canvas ref={this.canvas}/>
        </React.Fragment>
    )
  }
}