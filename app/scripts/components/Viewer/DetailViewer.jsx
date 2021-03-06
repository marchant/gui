

"use strict";

import _ from "lodash";
import React from "react";
import { Nav, Button } from "react-bootstrap";

import { Link, History, RouteContext } from "react-router";

import viewerMode from "./mixins/viewerMode";
import viewerCommon from "./mixins/viewerCommon";
import viewerUtil from "./viewerUtil";

import ToggleSwitch from "../ToggleSwitch";


const DetailNavSection = React.createClass(

  { contextTypes: { location: React.PropTypes.object }

  , propTypes:
      { selectedItem: React.PropTypes.oneOfType(
                        [ React.PropTypes.number
                        , React.PropTypes.string
                        ]
                      )
      , activeKey           : React.PropTypes.string
      , disclosureThreshold : React.PropTypes.number
      , entries             : React.PropTypes.array.isRequired
      , initialDisclosure   : React.PropTypes.string.isRequired
      , searchString        : React.PropTypes.string.isRequired
      , sectionName         : React.PropTypes.string.isRequired

      , keyUnique           : React.PropTypes.string.isRequired
      , keyPrimary          : React.PropTypes.string.isRequired
      , keySecondary        : React.PropTypes.string.isRequired

      , routeParam          : React.PropTypes.string.isRequired
      , routeNewItem        : React.PropTypes.string
      }

  , mixins: [ History, RouteContext ]

  , getDefaultProps: function () {
      return { disclosureThreshold: 1
             , itemIconTemplate : null
             };
    }

  , getInitialState: function () {
      return { disclosure: this.props.initialDisclosure };
    }

  , isUnderThreshold: function () {
      return this.props.entries.length <= this.props.disclosureThreshold;
    }

  , createItem: function ( rawItem, index ) {

      let itemIcon = null;

      const searchString   = this.props.searchString;
      const selectionValue = rawItem[ this.props.keyUnique ];

      var primaryText   = rawItem[ this.props.keyPrimary ];
      var secondaryText = rawItem[ this.props.keySecondary ];

      if ( searchString.length ) {
        primaryText   = viewerUtil.markSearch( primaryText, searchString );
        secondaryText = viewerUtil.markSearch( secondaryText, searchString );
      }

      if ( this.props.itemIconTemplate ) {
        itemIcon =
          <div className="viewer-detail-nav-item-text">
            <this.props.itemIconTemplate { ...rawItem } />
          </div>;
      } else {

        itemIcon = <div>
          <viewerUtil.ItemIcon
            primaryString  = { rawItem[ this.props.keySecondary ] }
            fallbackString = { rawItem[ this.props.keyPrimary ] }
            seedNumber     = { String( rawItem[ this.props.keyPrimary ] )
                             + String( rawItem[ this.props.keySecondary ] )
                             }
            fontSize       = { 1 } />
          <div className="viewer-detail-nav-item-text">
            <strong className="primary-text">
              { primaryText }
            </strong>
            <small className="secondary-text">
              { secondaryText }
            </small>
          </div>
        </div>;
      }
      var basePath =
        this.context.location.pathname.replace( "/"
                                              + this.props.params[ this.props.routeParam ]
                                              , ""
                                              )
                                      // remove the routeNewItem in case you're
                                      // clicking from there.
                                      .replace( "/"
                                              + this.props.routeNewItem
                                              , ""
                                              );
      var itemPath = basePath + "/" + selectionValue;
      return (
        <li
          role      = "presentation"
          key       = { index }
          className = "disclosure-target"
        >
          <Link
            to      = { itemPath }
            onClick = { this.props.handleItemSelect
                                  .bind( null, selectionValue )
                      }
          >
            { itemIcon }
          </Link>
        </li>
      );
    }

  , toggleDisclosure: function () {
      this.setState(
        { disclosure: this.state.disclosure === "open"
                    ? "closed"
                    : "open"
        }
      );
    }

  , render: function () {
      return (
        <Nav
          stacked
          bsStyle   = "pills"
          className = { "disclosure-" + this.isUnderThreshold()
                                      ? "default"
                                      : this.state.disclosure
                      }
          activeKey = { this.props.selectedKey }
        >
          <h5 className = "viewer-detail-nav-group disclosure-toggle"
              onClick   = { this.toggleDisclosure }>
            { this.props.sectionName }
          </h5>
          { this.props.entries.map( this.createItem ) }
        </Nav>
      );
    }

});

// Detail Viewer
const DetailViewer = React.createClass(

  { contextTypes: { location: React.PropTypes.object }

  , mixins: [ viewerCommon, viewerMode, History, RouteContext ]

  , propTypes:
    { collapsedInitial: React.PropTypes.instanceOf( Set )
    , routeNewItem: React.PropTypes.string
    , textNewItem: React.PropTypes.string
    }

  , getDefaultProps () {
      return { collapsedInitial: new Set() }
    }

  , createAddEntityButton: function () {
      let addEntityButton = null;
      let basePath =
        this.context.location.pathname.replace( "/"
                                              + this.props.params[ this.props.routeParam ]
                                              , ""
                                              )
                                      // remove the routeNewItem in case you're
                                      // already there
                                      .replace( "/"
                                              + this.props.routeNewItem
                                              , ""
                                              );

      let addEntityPath = basePath + "/" + this.props.routeNewItem;

      if ( this.props.textNewItem && this.props.routeNewItem ) {
        addEntityButton = (
          <Link to        = { addEntityPath }
                className = "viewer-detail-add-entity">
            <Button bsStyle   = "default"
                         className = "viewer-detail-add-entity">
              { this.props.textNewItem }
            </Button>
          </Link>
        );

      }

      return addEntityButton;
    }

  // Sidebar navigation for collection

  , render: function () {
      const FILTERED_DATA = this.props.filteredData;
      var groupedNavItems   = null;
      var remainingNavItems = null;
      var editorContent     = null;

      if ( FILTERED_DATA["grouped"] ) {
        groupedNavItems = FILTERED_DATA.groups.map( function ( group, index ) {
          let disclosureState;

          if ( this.props.collapsedInitial.size > 0 ) {
            disclosureState = this.props.collapsedInitial.has( group.key )
                            ? "closed"
                            : "open";
          } else {
            disclosureState = "open";
          }

          if ( group.entries.length ) {
            return (
              <DetailNavSection
                key               = { index }
                initialDisclosure = { disclosureState }
                sectionName       = { group.name }
                entries           = { group.entries }
                { ...this.props }
              />
            );
          } else {
            return null;
          }
        }.bind( this ) );
      }

      if ( FILTERED_DATA.remaining.entries.length ) {
        remainingNavItems = (
          <DetailNavSection
            initialDisclosure = "closed"
            sectionName       = { FILTERED_DATA.remaining.name }
            entries           = { FILTERED_DATA.remaining.entries }
            { ...this.props }
          />
        );
      }

      // Check if we're adding or editing an entity
      if ( this.context.location.pathname.endsWith( this.props.routeNewItem )
        || typeof this.props.params[ this.props.routeParam ] !== "undefined"
         ) {
        editorContent = React.cloneElement( this.props.children
                                          , this.props
                                          );
      } else {
        editorContent = (
          <div className="viewer-item-info">
            <h3 className="viewer-item-no-selection">
              {"No active selection"}
            </h3>
          </div>
        );
      }

      return (
        <div className = "viewer-detail">
          <div className = "viewer-detail-sidebar">
            { this.createAddEntityButton() }
            <div className = "viewer-detail-nav well">
              { groupedNavItems }
              { remainingNavItems }
            </div>
          </div>
          { editorContent }
        </div>
      );
    }

});

export default DetailViewer;
