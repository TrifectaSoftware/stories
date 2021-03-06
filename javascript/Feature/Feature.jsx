'use strict'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FeatureObj from './FeatureObj'
import FeatureList from './FeatureList'
import FeatureForm from './FeatureForm'
import Message from '../AddOn/Message'
import Waiting from '../AddOn/Waiting'
import SampleEntry from './SampleEntry'
import ThumbnailOverlay from '../EntryList/ThumbnailOverlay'
import './style.css'

/* global $ */

export default class Feature extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: null,
      currentFeature: null,
      currentEntry: null,
      currentKey: null,
      currentEntryKey: null,
      featureList: [],
      loading: true,
      thumbnailOverlay: false,
      stories: [],
    }
    this.addRow = this.addRow.bind(this)
    this.closeMessage = this.closeMessage.bind(this)
    this.updateFeature = this.updateFeature.bind(this)
    this.updateActive = this.updateActive.bind(this)
    this.loadCurrentFeature = this.loadCurrentFeature.bind(this)
    this.clearStory = this.clearStory.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
    this.clearFeature = this.clearFeature.bind(this)
    this.thumbnailForm = this.thumbnailForm.bind(this)
    this.closeOverlay = this.closeOverlay.bind(this)
    this.updateEntry = this.updateEntry.bind(this)
    this.updateImage = this.updateImage.bind(this)
    this.deleteFeature = this.deleteFeature.bind(this)
  }

  componentDidMount() {
    this.load()
  }

  load() {
    $.ajax({
      url: './stories/Feature',
      dataType: 'json',
      type: 'get',
      success: function (data) {
        if (data.stories == null) {
          const message = {}
          message.text = (
            <span>No stories available for features.
              <a href="stories/Entry/create">Go write some.</a>
            </span>
          )
          message.type = 'warning'
          this.setState({message: message, loading: false})
        } else {
          this.setState({
            featureList: data.featureList,
            stories: data.stories,
            loading: false,
            currentFeature: null,
            currentKey: null,
            currentEntry: null,
            currentEntryKey: null,
          })
        }
      }.bind(this),
      error: function () {
        this.setState({
          loading: false,
          message: {
            text: 'Error: Could not pull feature list',
            type: 'danger'
          }
        })
      }.bind(this)
    })
  }

  updateImage(image) {
    const story = this.state.currentEntry.story
    story.thumbnail = image
    this.updateEntry(story)
  }

  updateEntry(story) {
    let currentEntry = this.state.currentEntry
    currentEntry.story = story

    const currentFeature = this.state.currentFeature
    currentFeature.entries[this.state.currentEntryKey] = currentEntry

    const featureList = this.state.featureList
    featureList[this.state.currentKey] = currentFeature
    this.setState({currentEntry, currentFeature, featureList})
  }

  deleteFeature(key) {
    const feature = this.state.featureList[key]
    $.ajax({
      url: 'stories/Feature/' + feature.id,
      dataType: 'json',
      type: 'delete',
      success: function () {
        this.load()
      }.bind(this),
      error: function () {}.bind(this),
    })
  }

  loadCurrentFeature(key) {
    const feature = this.state.featureList[key]
    if (feature.entries === null || feature.entries === 'null') {
      feature.entries = []
    }
    this.fillEntries(feature)
    if (feature.title === null) {
      feature.title = ''
    }
    this.setState({currentFeature: feature, currentKey: key,})
  }

  unlockBody() {
    $('body').css('overflow', 'inherit')
  }

  closeOverlay() {
    this.setState(
      {thumbnailOverlay: false, currentEntry: null, currentEntryKey: null}
    )
    this.unlockBody()
  }

  thumbnailForm(key) {
    const entry = this.state.currentFeature.entries[key]
    this.setState(
      {thumbnailOverlay: true, currentEntryKey: key, currentEntry: entry}
    )
  }

  fillEntries(feature) {
    this.stackEntries(feature)
    for (let i = 0; i < 4; i++) {
      if (feature.entries[i] === undefined || i >= feature.columns) {
        feature.entries[i] = SampleEntry()
      }
    }
  }

  clearFeature() {
    this.setState({currentFeature: null, currentKey: null})
  }

  /* Moves active entries into clean stack */
  stackEntries(feature) {
    let newEntries = []
    for (let i = 0; i < 4; i++) {
      if (feature.entries[i] === undefined) {
        continue
      }
      let value = feature.entries[i]
      if (value.entryId > 0) {
        newEntries.push(value)
      }
    }
    feature.entries = newEntries
  }

  addRow() {
    $.ajax({
      url: './stories/Feature',
      dataType: 'json',
      type: 'post',
      success: function (data) {
        const feature = FeatureObj
        feature.id = data.featureId
        let featureList = this.state.featureList
        if (featureList === null) {
          featureList = []
        }
        this.fillEntries(feature)
        featureList.push(feature)
        this.setState(
          {currentFeature: FeatureObj, currentKey: data.featureId, featureList: featureList}
        )
      }.bind(this),
      error: function () {}.bind(this),
    })
  }

  updateTitle(title) {
    const feature = this.state.currentFeature
    feature.title = title
    this.setState({currentFeature: feature})
  }

  updateFeature(feature) {
    if (feature.id > 0) {
      const {
        title,
        active,
        entries,
        format,
        columns,
        sorting
      } = feature
      let newEntries = entries.map(function (value) {
        if (value.entryId > 0) {
          return {entryId: value.entryId, x: value.x, y: value.y}
        }
      })
      $.ajax({
        url: './stories/Feature/' + feature.id,
        data: {
          title,
          active,
          entries: newEntries,
          format,
          columns,
          sorting
        },
        dataType: 'json',
        type: 'put',
        success: function (data) {
          feature.entries = data.entries
          this.fillEntries(feature)
          this.updateCurrentFeature(feature)
        }.bind(this),
        error: function () {}.bind(this),
      })
    } else {
      this.updateCurrentFeature(feature)
    }
  }

  updateCurrentFeature(feature) {
    const {featureList} = this.state
    featureList[this.state.currentKey] = feature
    this.setState({currentFeature: feature, featureList: featureList,})
  }

  closeMessage() {
    this.setState({message: null})
  }

  clearStory(key) {
    const feature = this.state.currentFeature
    delete feature.entries[key]
    this.stackEntries(feature)
    this.fillEntries(feature)
    this.updateFeature(feature)
  }

  updateActive(key, value) {
    const feature = this.state.featureList[key]
    feature.active = value
    this.updateFeature(feature)
  }

  message() {
    if (this.state.message !== null) {
      const {message} = this.state
      return <Message type={message.type} message={message.text}>{message.text}</Message>
    }
  }

  getListing() {
    if (this.state.loading === true) {
      return <Waiting/>
    } else if (this.state.currentKey !== null) {
      return <FeatureForm
        stories={this.state.stories}
        thumbnailForm={this.thumbnailForm}
        feature={this.state.currentFeature}
        clearStory={this.clearStory}
        updateTitle={this.updateTitle}
        srcHttp={this.props.srcHttp}
        update={this.updateFeature}/>
    } else {
      return <FeatureList
        list={this.state.featureList}
        srcHttp={this.props.srcHttp}
        updateActive={this.updateActive}
        deleteFeature={this.deleteFeature}
        loadCurrentFeature={this.loadCurrentFeature}/>
    }
  }

  render() {
    let backToList
    if (this.state.currentKey !== null) {
      backToList = <button className="btn btn-default" onClick={this.clearFeature}>
        <i className="fa fa-list"></i>&nbsp;Back to feature list</button>
    }

    let story
    if (this.state.currentEntry !== null) {
      story = this.state.currentEntry.story
    }
    return (
      <div className="feature-admin">
        <ThumbnailOverlay
          thumbnailOverlay={this.state.thumbnailOverlay}
          updateEntry={this.updateEntry}
          updateImage={this.updateImage}
          entry={story}
          close={this.closeOverlay}/> {this.message()}
        <div className="buttons">
          <button className="btn btn-primary mr-1" onClick={this.addRow}>
            <i className="fa fa-plus"></i>&nbsp;Add feature set</button>
          {backToList}
        </div>
        {this.getListing()}
      </div>
    )
  }
}

Feature.propTypes = {
  srcHttp: PropTypes.string
}
