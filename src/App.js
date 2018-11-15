import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import cx from 'classnames';
import axios from 'axios';

import Globals from './components/Globals';
import db from './components/db';
import ObservedImage from './components/ObservedImage';
import GA from './GA';

import './Core.css';
import './App.css';

import Header from './components/pages/Header';
import Footer from './components/pages/Footer';
import ErrorHandler from './components/pages/ErrorHandler';

// index
import Index from './components/pages/Index/Index';

// progression
import './components/pages/Progression/Progression.css';
import SearchPlayer from './components/pages/SearchPlayer';
import DisplayProfile from './components/pages/Progression/DisplayProfile';

// clans
import './components/pages/Clans/Clans.css';
import SearchGroups from './components/pages/SearchGroups';
import DisplayGroup from './components/pages/Clans/DisplayGroup';

// xur - placeholder
import Xur from './components/pages/Xur/Xur';

class App extends Component {
  constructor() {
    super();
    this.state = {
      manifest: {
        downloading: false,
        version: undefined,
        ready: false
      }
    };
    this.updateViewport = this.updateViewport.bind(this);
    this.getManifest = this.getManifest.bind(this);
    this.manifest = null;
  }

  updateViewport() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.setState({
      viewport: {
        width,
        height
      }
    });
  }

  getManifest = () => {
    axios
      .get('https://api.braytech.org/?request=manifest&table=DestinyDestinationDefinition,DestinyPlaceDefinition,DestinyPresentationNodeDefinition,DestinyRecordDefinition,DestinyProgressionDefinition,DestinyCollectibleDefinition,DestinyChecklistDefinition,DestinyObjectiveDefinition,DestinyActivityDefinition,DestinyActivityModeDefinition', {
        headers: {
          'X-API-Key': Globals.key.braytech
        },
        onDownloadProgress: progressEvent => {
          let state = this.state;
          state.manifest.downloading = {
            loaded: progressEvent.loaded,
            total: progressEvent.total
          };
          this.setState(state);
        }
      })
      .then(response => {
        db.table('manifest')
          .clear()
          .then(() => {
            db.table('manifest').add({
              version: response.data.response.version,
              value: response.data.response.data
            });
          })
          .then(() => {
            db.table('manifest')
              .toArray()
              .then(manifest => {
                this.manifest = manifest[0].value;
                let state = this.state;
                state.manifest.ready = true;
                this.setState(state);
              });
          });
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.updateViewport);

    db.table('manifest')
      .toArray()
      .then(manifest => {
        if (manifest.length > 0) {
          let state = this.state;
          state.manifest.version = manifest[0].version;
          this.setState(state);
        }
      })
      .then(() => {
        fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/`, {
          headers: {
            'X-API-Key': Globals.key.bungie
          }
        })
          .then(response => {
            return response.json();
          })
          .then(response => {
            // console.log(response.Response.mobileWorldContentPaths.en === this.state.manifest.version, response.Response.mobileWorldContentPaths.en, this.state.manifest.version);

            if (response.Response.mobileWorldContentPaths.en !== this.state.manifest.version) {
              this.getManifest();
            } else {
              db.table('manifest')
                .toArray()
                .then(manifest => {
                  this.manifest = manifest[0].value;
                  let state = this.state;
                  state.manifest.ready = true;
                  this.setState(state);
                });
            }
          })
          .catch(error => {
            console.log(error);
          });
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport);
  }

  render() {
    if (!window.ga) {
      GA.init();
    }

    if (!this.state.manifest.ready && this.state.manifest.downloading) {
      return (
        <div className="view" id="loading">
          <ObservedImage className={cx('image')} src="/static/images/braytech.png" />
          <h4>Braytech</h4>
          <div className="download">
            {(this.state.manifest.downloading.loaded / 1048576).toFixed(2)}MB of {(this.state.manifest.downloading.total / 1048576).toFixed(2)}MB
          </div>
        </div>
      );
    } else if (!this.state.manifest.ready) {
      return (
        <div className="view" id="loading">
          <ObservedImage className={cx('image')} src="/static/images/braytech.png" />
          <h4>Braytech</h4>
          <div className="download">PREPARING</div>
        </div>
      );
    } else {
      return (
        <BrowserRouter>
          <>
            <Header />
            <Switch>
              <Route
                path="/"
                exact
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <Index appRoute={route} manifest={this.manifest} viewport={this.state.viewport} />
                  </>
                )}
              />
              <Route
                path="/progression"
                exact
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <div className="view progression-search" id="SearchPlayer">
                      <SearchPlayer {...this.props} {...route} path="/progression" />
                    </div>
                  </>
                )}
              />
              <Route path="/progression/:membershipType/:membershipId/:characterId?/:view?/:primary?/:secondary?/:tertiary?" render={route => <DisplayProfile {...this.props} {...route} manifest={this.manifest} viewport={this.state.viewport} />} />
              <Route
                path="/clans/:membershipType/:membershipId"
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <div className="view clan-search" id="SearchPlayer">
                      <SearchPlayer {...this.props} {...route} path="/clans" />
                      <SearchGroups {...this.props} {...route} />
                    </div>
                  </>
                )}
              />
              <Route
                path="/clans/:groupId"
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <DisplayGroup {...this.props} {...route} manifest={this.manifest} />
                  </>
                )}
              />
              <Route
                path="/clans"
                exact
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <div className="view clan-search" id="SearchPlayer">
                      <SearchPlayer {...this.props} {...route} path="/clans" />
                    </div>
                  </>
                )}
              />
              <Route
                path="/xur"
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <Xur appRoute={route} manifest={this.manifest} viewport={this.state.viewport} />
                  </>
                )}
              />
              <Route
                path="/checklists"
                render={route => (
                  <>
                    <GA.RouteTracker />
                    <Redirect to="/progression" />
                  </>
                )}
              />
              <Route component={ErrorHandler} />
            </Switch>
            <Footer />
          </>
        </BrowserRouter>
      );
    }
  }
}

export default App;
