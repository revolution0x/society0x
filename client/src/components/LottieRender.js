import React from 'react'
import Lottie from 'react-lottie';

export default class LottieRender extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isStopped: false, isPaused: false};
  }

  render() {

    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: this.props.lottieJSON,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return <div style={{pointerEvents: 'none'}}>
      <Lottie options={defaultOptions}
              height={this.props.height}
              width={this.props.width}
              isStopped={this.state.isStopped}
              isPaused={this.state.isPaused}/>
    </div>
  }
}