'use strict'
import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class Panel extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <ul className="nav nav-tabs nav-justified">
        <li role="presentation"><a>Unpublished</a></li>
        <li role="presentation"><a>Published</a></li>
      </ul>
    )
  }
}

Panel.propTypes = {}
