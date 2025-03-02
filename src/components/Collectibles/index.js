import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import { ProfileLink } from '../../components/ProfileLink';
import ObservedImage from '../../components/ObservedImage';
import { enumerateCollectibleState } from '../../utils/destinyEnums';

import './styles.css';

class Collectibles extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.highlight && this.scrollToRecordRef.current !== null) {
      window.scrollTo({
        top: this.scrollToRecordRef.current.offsetTop + this.scrollToRecordRef.current.offsetHeight / 2 - window.innerHeight / 2
      });
    }
  }

  selfLink = hash => {
    let link = ['/collections'];
    let root = manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.collectionRootNode];

    root.children.presentationNodes.forEach(nP => {
      let nodePrimary = manifest.DestinyPresentationNodeDefinition[nP.presentationNodeHash];              

      nodePrimary.children.presentationNodes.forEach(nS => {
        let nodeSecondary = manifest.DestinyPresentationNodeDefinition[nS.presentationNodeHash];

        nodeSecondary.children.presentationNodes.forEach(nT => {
          let nodeTertiary = manifest.DestinyPresentationNodeDefinition[nT.presentationNodeHash];

          if (nodeTertiary.children.collectibles.length) {
            let found = nodeTertiary.children.collectibles.find(c => c.collectibleHash === hash);
            if (found) {
              link.push(nodePrimary.hash, nodeSecondary.hash, nodeTertiary.hash, found.collectibleHash)
            }
          } else {
            nodeTertiary.children.presentationNodes.forEach(nQ => {
              let nodeQuaternary = manifest.DestinyPresentationNodeDefinition[nQ.presentationNodeHash];

              if (nodeQuaternary.children.collectibles.length) {
                let found = nodeQuaternary.children.collectibles.find(c => c.collectibleHash === hash);
                if (found) {
                  link.push(nodePrimary.hash, nodeSecondary.hash, nodeTertiary.hash, nodeQuaternary.hash, found.collectibleHash)
                }
              }      
            });
          }

        });
      });
    });

    link = link.join('/');
    return link;
  }

  render() {
    const { t, forceDisplay, collectibles } = this.props;
    const inspect = this.props.inspect ? true : false;
    const highlight = parseInt(this.props.match && this.props.match.params.quinary ? this.props.match.params.quinary : this.props.highlight, 10) || false;

    let output = [];

    if (this.props.node) {
      const tertiaryDefinition = manifest.DestinyPresentationNodeDefinition[this.props.node];

      if (tertiaryDefinition.children.presentationNodes.length > 0) {
        tertiaryDefinition.children.presentationNodes.forEach(node => {
          const nodeDefinition = manifest.DestinyPresentationNodeDefinition[node.presentationNodeHash];

          let row = [];
          let rowState = [];

          nodeDefinition.children.collectibles.forEach(child => {
            const collectibleDefinition = manifest.DestinyCollectibleDefinition[child.collectibleHash];

            let state = 0;
            if (this.props.member.data) {
              const characterId = this.props.member.characterId;
              const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
              const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
              let scope = profileCollectibles.collectibles[child.collectibleHash] ? profileCollectibles.collectibles[child.collectibleHash] : characterCollectibles[characterId].collectibles[child.collectibleHash];
              if (scope) {
                state = scope.state;
              }
            }

            rowState.push(state);

            if (collectibles && collectibles.hideInvisibleCollectibles && enumerateCollectibleState(state).invisible && !forceDisplay) {
              return;
            }

            if (collectibles && collectibles.hideCompletedCollectibles && !enumerateCollectibleState(state).notAcquired && !forceDisplay) {
              return;
            }

            // eslint-disable-next-line eqeqeq
            let ref = highlight == collectibleDefinition.hash ? this.scrollToRecordRef : null;

            row.push(
              <li
                key={collectibleDefinition.hash}
                ref={ref}
                className={cx('item', 'tooltip', {
                  completed: !enumerateCollectibleState(state).notAcquired && !enumerateCollectibleState(state).invisible,
                  // eslint-disable-next-line eqeqeq
                  highlight: highlight && highlight == collectibleDefinition.hash
                })}
                data-hash={collectibleDefinition.itemHash}
              >
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
                </div>
                {inspect && collectibleDefinition.itemHash ? <Link to={{ pathname: `/inspect/${collectibleDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
              </li>
            );
          });

          if (row.length === 0) {
            return;
          }

          output.push(
            <li
              key={nodeDefinition.hash}
              className={cx('is-set', {
                completed: rowState.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length === rowState.length
              })}
            >
              <div className='text'>
                <div className='name'>{nodeDefinition.displayProperties.name}</div>
              </div>
              <div className='set'>
                <ul className='list collection-items'>{row}</ul>
              </div>
            </li>
          );
        });
      } else {
        tertiaryDefinition.children.collectibles.forEach(child => {
          const collectibleDefinition = manifest.DestinyCollectibleDefinition[child.collectibleHash];

          let state = 0;
          if (this.props.member.data) {
            const characterId = this.props.member.characterId;
            const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
            const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
            let scope = profileCollectibles.collectibles[child.collectibleHash] ? profileCollectibles.collectibles[child.collectibleHash] : characterCollectibles[characterId].collectibles[child.collectibleHash];
            if (scope) {
              state = scope.state;
            }

            if (collectibles && collectibles.hideInvisibleCollectibles && enumerateCollectibleState(state).invisible && !forceDisplay) {
              return;
            }

            if (collectibles && collectibles.hideCompletedCollectibles && !enumerateCollectibleState(state).notAcquired && !forceDisplay) {
              return;
            }
          }

          // eslint-disable-next-line eqeqeq
          let ref = highlight == collectibleDefinition.hash ? this.scrollToRecordRef : null;

          if (collectibleDefinition.redacted || collectibleDefinition.itemHash === 0) {
            output.push(
              <li
                key={collectibleDefinition.hash}
                ref={ref}
                className={cx('redacted', 'tooltip', {
                  // eslint-disable-next-line eqeqeq
                  highlight: highlight && highlight == collectibleDefinition.hash
                })}
                data-hash='343'
              >
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage}`} />
                </div>
                <div className='text'>
                  <div className='name'>Classified</div>
                  <div className='commonality'>{manifest.statistics.collections && manifest.statistics.collections[collectibleDefinition.hash] ? manifest.statistics.collections[collectibleDefinition.hash] : `0.00`}%</div>
                </div>
              </li>
            );
          } else {
            output.push(
              <li
                key={collectibleDefinition.hash}
                ref={ref}
                className={cx('tooltip', {
                  completed: !enumerateCollectibleState(state).notAcquired,
                  // eslint-disable-next-line eqeqeq
                  highlight: highlight && highlight == collectibleDefinition.hash
                })}
                data-hash={collectibleDefinition.itemHash}
              >
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
                </div>
                <div className='text'>
                  <div className='name'>{collectibleDefinition.displayProperties.name}</div>
                  <div className='commonality'>{manifest.statistics.collections && manifest.statistics.collections[collectibleDefinition.hash] ? manifest.statistics.collections[collectibleDefinition.hash] : `0.00`}%</div>
                </div>
                {inspect && collectibleDefinition.itemHash ? <Link to={{ pathname: `/inspect/${collectibleDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
              </li>
            );
          }
        });
      }
    } else {
      let collectiblesRequested = this.props.hashes.filter(h => h);

      collectiblesRequested.forEach(hash => {
        let collectibleDefinition = manifest.DestinyCollectibleDefinition[hash];
        
        let link = this.selfLink(hash);

        let state = 0;
        if (this.props.member.data) {
          
          const characterId = this.props.member.characterId;

          const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
          const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
        
          let scope = profileCollectibles.collectibles[hash] ? profileCollectibles.collectibles[hash] : characterCollectibles[characterId].collectibles[hash];
          if (scope) {
            state = scope.state;
          }

          if (collectibles && collectibles.hideInvisibleCollectibles && enumerateCollectibleState(state).invisible && !forceDisplay) {
            return;
          }

          if (collectibles && collectibles.hideCompletedCollectibles && !enumerateCollectibleState(state).notAcquired && !forceDisplay) {
            return;
          }

        }

        output.push(
          <li
            key={collectibleDefinition.hash}
            className={cx('tooltip', {
              linked: link && this.props.selfLinkFrom,
              completed: !enumerateCollectibleState(state).notAcquired
            })}
            data-hash={collectibleDefinition.itemHash}
          >
            <div className='icon'>
              <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
            </div>
            <div className='text'>
              <div className='name'>{collectibleDefinition.displayProperties.name}</div>
                  <div className='commonality'>{manifest.statistics.collections && manifest.statistics.collections[collectibleDefinition.hash] ? manifest.statistics.collections[collectibleDefinition.hash] : `0.00`}%</div>
            </div>
            {link && this.props.selfLinkFrom && !inspect ? <ProfileLink to={{ pathname: link, state: { from: this.props.selfLinkFrom } }} /> : null}
            {inspect && collectibleDefinition.itemHash ? <Link to={{ pathname: `/inspect/${collectibleDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
          </li>
        );
      });
    }

    if (output.length === 0 && collectibles && collectibles.hideCompletedCollectibles && !forceDisplay) {
      output.push(
        <li key='lol' className='all-completed'>
          <div className='properties'>
            <div className='text'>{t('All completed')}</div>
          </div>
        </li>
      );
    }

    return output;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    collectibles: state.collectibles
  };
}

export default compose(
  connect(
    mapStateToProps
  ),
  withNamespaces()
)(Collectibles);
