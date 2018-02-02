/*eslint eqeqeq: ["error", "always", {"null": "ignore"}]*/

import React from 'react';
import PropTypes from 'prop-types';
import Mousetrap from 'mousetrap';

import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import '../styles/PlaySlider.css';

const propTypes = {
  disabled: PropTypes.bool,
  disabledMessage: PropTypes.string,
  end: PropTypes.number.isRequired,
  loopDuration: PropTypes.number,
  maxFrames: PropTypes.number,
  onChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  reversed: PropTypes.bool,
  start: PropTypes.number.isRequired,
  step: PropTypes.number,
  values: PropTypes.array.isRequired,
};

const defaultProps = {
  onChange: () => {},
  loopDuration: 15000,
  maxFrames: 100,
  orientation: 'horizontal',
  reversed: false,
  disabled: false,
  disabledMessage: 'Slider is disabled',
};

export default class PlaySlider extends React.PureComponent {
  constructor(props) {
    super(props);

    const range = props.end - props.start;
    const frames = Math.min(props.maxFrames, range / props.step);
    const intervalMilliseconds = props.loopDuration / frames;
    const width = range / frames;
    let increment;
    if (width < props.step) {
      increment = props.step;
    } else {
      increment = width - (width % props.step);
    }

    this.state = { intervalId: null, intervalMilliseconds, increment };

    this.onChange = this.onChange.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.pause = this.pause.bind(this);
    this.handleStep = this.handleStep.bind(this);
    this.getPlayClass = this.getPlayClass.bind(this);
    this.formatter = this.formatter.bind(this);
  }
  componentDidMount() {
    Mousetrap.bind(['space'], this.handlePlay);
  }
  componentWillUnmount() {
    Mousetrap.unbind(['space']);
  }
  onChange(event) {
    this.props.onChange({ values: event.target.value });
    if (this.state.intervalId != null) {
      this.pause();
    }
  }
  getPlayClass() {
    if (this.state.intervalId == null) {
      return 'fa fa-play fa-lg slider-button';
    }
    return 'fa fa-pause fa-lg slider-button';
  }
  handlePlay() {
    if (this.props.disabled) {
      return;
    }
    if (this.state.intervalId != null) {
      this.pause();
    } else {
      const id = setInterval(this.handleStep, this.state.intervalMilliseconds);
      this.setState({ intervalId: id });
    }
  }
  pause() {
    clearInterval(this.state.intervalId);
    this.setState({ intervalId: null });
  }
  handleStep() {
    if (this.props.disabled) {
      return;
    }
    let values = this.props.values.map(value => value + this.state.increment);
    if (values[1] > this.props.end) {
      const cr = values[0] - this.props.start;
      values = values.map(value => value - cr);
    }
    this.props.onChange({ values });
  }
  formatter(values) {
    if (this.props.disabled) {
      return this.props.disabledMessage;
    }

    let parts = values;
    if (!Array.isArray(values)) {
      parts = [values];
    } else if (values[0] === values[1]) {
      parts = [values[0]];
    }
    return parts.map(value => (new Date(value)).toUTCString()).join(' : ');
  }
  render() {
    return (
      <div className="row play-slider">
        <div className="col-8 col-sm-1 padded">
          <i
            className={this.getPlayClass()}
            onClick={this.handlePlay}
          />
          <i
            className="fa fa-step-forward fa-lg slider-button "
            onClick={this.handleStep}
          />
        </div>
        <div className="col-4 col-sm-11 padded">
          <ReactBootstrapSlider
            change={this.onChange}
            disabled={this.props.disabled ? 'disabled' : 'enabled'}
            formatter={this.formatter}
            max={this.props.end}
            min={this.props.start}
            orientation={this.props.orientation}
            reversed={this.props.reversed}
            step={this.props.step}
            value={this.props.values}
          />
        </div>
      </div>
    );
  }
}

PlaySlider.propTypes = propTypes;
PlaySlider.defaultProps = defaultProps;
