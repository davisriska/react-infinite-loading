import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './style.css';

/**
 * Infinite Loading
 * @type {Object}
 */
class Infinite extends Component {
  constructor(props) {
    super(props);
    const { elementScroll, scrollHeight, loading, isLoading, asLoading, scrollThreshold } = this.props;
    this.state = {
      elementScroll: elementScroll,
      scrollHeight: scrollHeight,
      loading: loading,
      isLoading: isLoading,
      asLoading: asLoading,
      scrollThreshold: scrollThreshold
    }
    this.isScrollWatching = false;
    this.onPageScroll = this.throttle(this.onPageScroll).bind(this);
    this.onResize = this.throttle(this.onResize).bind(this);
  }
  componentDidMount() {
    this.enableScrollWatch(); // 开始绑定
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (prevProps.loading !== this.props.loading) {
        this.setState({loading: this.props.loading});
      }
      if (prevProps.elementScroll !== this.props.elementScroll) {
        this.setState({elementScroll: this.props.elementScroll});
      }
      if (prevProps.scrollHeight !== this.props.scrollHeight) {
        this.setState({scrollHeight: this.props.scrollHeight});
      }
    }
  }
  componentWillUnmount() {
    this.bindScrollWatchEvents(false);
  }
  // bind event start
  enableScrollWatch() {
    if ( this.isScrollWatching ) {
      return;
    }
    this.updateTop();
    this.updateScroller();
    this.isScrollWatching = true;
    this.bindScrollWatchEvents(true);
  }
  // bind scroll event
  bindScrollWatchEvents(isBind) {
    const addRemove = isBind ? 'addEventListener' : 'removeEventListener';
    this.scroller[addRemove]('scroll', this.onPageScroll);
    window[ addRemove ]( 'resize', this.onResize );
  }
  // processing scroll event
  onPageScroll() {
    const { loading } = this.state;
    const distance = this.getBottomDistance();
    if(distance <= this.state.scrollThreshold && !loading) {
      this.scrollThreshold();
    }
  }
  // on resize
  onResize() {
    this.updateTop();
  }
  scrollThreshold() {
    this.setState({loading: true});
    //this.handleLoading();
    this.props.handleLoading();
  }
  // get element/wndow bottom distance
  getBottomDistance() {
    if(this.state.elementScroll) {
      return this.getElementBottomDistance();
    } else {
      return this.getWindowBottomDistance();
    }
  }
  getElementBottomDistance() {
    const bottom = this.scroller.scrollHeight;
    const scrollY = this.scroller.scrollTop + this.scroller.clientHeight;
    return bottom - scrollY;
  }
  getWindowBottomDistance() {
    const bottom = this.scroller.scrollHeight;
    const scrollY = this.windowHeight + window.pageYOffset;
    return bottom - scrollY;
  }
  updateTop() {
    this.windowHeight = window.innerHeight;
    var rect = this.element.getBoundingClientRect();
    this.top = rect.top + window.pageYOffset;
  }
  updateScroller() {
    // if elementScroll equal true, scroller => element, equal false scroller => window
    if(!this.state.elementScroll) {
      this.scroller = window;
    }
  }
  throttle(fn, threshold) {
    threshold = threshold || 200;
    let last, timeout;

    return function() {
      let now = +new Date();
      let args = arguments;
      let trigger = function() {
        last = now;
        fn.apply( this, args );
      }.bind( this );
      if ( last && now < last + threshold ) {
        // hold on to it
        clearTimeout( timeout );
        timeout = setTimeout( trigger, threshold );
      } else {
        trigger();
      }
    };
  }
  // https://codepen.io/nhembram/pen/BzARvk?editors=1000
  getLoadingElement() {
    return (
      <div className="infinite-loading">
        <ul className="loading">
          <li className="blue"/>
          <li className="green"/>
          <li className="yellow"/>
          <li className="pink"/>
        </ul>
      </div>
    )
  }
  render() {
    const { children } = this.props;
    const { loading, isLoading, asLoading, scrollHeight } = this.state;

    return (
      <div className="infinite" ref={(e) => this.element = this.scroller = e} style={{height: scrollHeight}}>
        {children}
        {isLoading && loading ? (asLoading ? asLoading : this.getLoadingElement()) : null}
      </div>
    )
  }
}
Infinite.defaultProps = {
  scrollHeight: 'auto',
  elementScroll: false,
  isLoading: true,
  scrollThreshold: 200
};
Infinite.propTypes = {
  loading: PropTypes.bool,
  isLoading: PropTypes.bool,
  asLoading: PropTypes.node,
  elementScroll: PropTypes.bool,
  scrollHeight: PropTypes.any.isRequired,
  scrollThreshold: PropTypes.number,
  handleLoading: PropTypes.func,
  children: PropTypes.node
};
export default Infinite;
