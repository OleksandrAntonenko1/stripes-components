
import React, { cloneElement } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import classNames from 'classnames';
import css from './Dropdown.css';
import omit from '../../util/omitProps';

const propTypes = {
  disabled: PropTypes.bool,
  open: PropTypes.bool,
  onToggle: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectItem: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  tether: PropTypes.object,
  pullRight: PropTypes.bool,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const defaultProps = {
  open: false,
  tag: 'div',
  tether: {
    attachment: 'top center',
    renderElementTo: null,
    targetAttachment: 'bottom center',
    optimizations: {
      gpu: false,
    },
    constraints: [{
      to: 'window',
      attachment: 'together',
    },
    {
      to: 'scrollParent',
      pin: true,
    },
    ],
  },
};

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
    this._focusInDropdown = false;

    this._toggle = null;
  }

  componentDidMount() {
    console.log(this._toggle);
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.open && this.props.open) {
      this._focusInDropdown = this._menu.node ? this._menu.node.contains(document.activeElement) : false;
    }
  }

  componentDidUpdate(prevProps) {
    const { open } = this.props;
    const prevOpen = prevProps.open;

    if (!open && prevOpen) {
      if (this._focusInDropdown) {
        this._focusInDropdown = false;
        this.focus();
      }
    }
  }

  handleKeyDown(e) {
    if (this.props.disabled) {
      return;
    }

    switch (e.keyCode) {
      case 40: // down
        if (!this.props.open) {
          this.handleToggle(e);
        } else if (this._menu.focusNext) {
          this._menu.focusNext();
        }
        e.preventDefault();
        break;
      case 27: // escape
      case 9: // tab
        this.handleClose(e);
        break;
      default:
    }
  }

  focus() {
    const toggle = this._toggle;

    if (toggle && toggle.focus) {
      toggle.focus();
    }
  }

  handleClose(e) {
    if (!this.props.open) {
      return;
    }

    this.handleToggle(e);
  }

  handleToggle(e) {
    if (this.props.disabled) {
      return e && e.preventDefault();
    }
    if (e) { e.stopPropagation(); }
    return this.props.onToggle(e);
  }

  handleTab(e, shift) {
    this.handleToggle(e);
    const domNode = ReactDOM.findDOMNode(this._toggle);
    domNode.focus();
  }

  renderChildren() {
    const {
      open,
      pullRight,
      disabled,
      id,
      children,
    } = this.props;

    return React.Children.map(children, (child) => {
      switch (child.props['data-role']) {
        case 'toggle': {
          return cloneElement(child, {
            ref: (node) => { 
              this._toggle = node;
              const {ref} = child;
              if (typeof ref === 'function') {
                ref(node);
              } 
              console.log('toggle refd.');
            },
            disabled,
            onClick: this.handleToggle,
            onKeyDown: this.handleKeyDown,
            'aria-expanded': open,
            'aria-haspopup': true,
          });
        }
        case 'menu': {
          if(this.props.open) {
            if (this.props.onSelectItem) {
              return cloneElement(child, {
                open,
                pullRight,
                labelledBy: id,
                className: css.DropdownMenuTether,
                onToggle: this.handleToggle,
                onTab: this.handleTab,
                onSelectItem: this.props.onSelectItem,
                ref: (node) => { this._menu = node; },
              });
            }
            return cloneElement(child, {
              open,
              pullRight,
              labelledBy: id,
              className: css.DropdownMenuTether,
              onToggle: this.handleToggle,
              onTab: this.handleTab,
              ref: (c) => { this._menu = c; },
            });
          }
          return null;
        }
        default: {
          return child;
        }
      }
    }, this);
  }

  render() {
    const atSmallMedia = matchMedia('maxWidth: 800px').matches;

    const {
      className,
      tag: Tag,
      open,
      group,
      tether,
      ...attributes
    } = omit(this.props, ['onToggle', 'onSelectItem', 'pullRight', 'dropdown']);
    const classes = classNames(
      className,
      {
        [css.btnGroup]: group,
        [css.show]: open,
        [css.dropdown]: !group,
      },
    );

    if(atSmallMedia) {

    }

    const mergedTetherProps = Object.assign({}, Dropdown.defaultProps.tether, tether);

    return (
      <Tag
        {...attributes}
        className={classes}
        ref={(c) => { this._dropdown = c; }}
      >
        
          <TetherComponent
            {...mergedTetherProps}
          >
            {this.renderChildren()}
          </TetherComponent>
      </Tag>
    );
  }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

export default Dropdown;
