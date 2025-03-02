import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import Matches from '../../../components/PGCRs/Matches';
import ParentModeLinks from '../ParentModeLinks';

class All extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount() {
    
  }

  render() {
    const { t, member } = this.props;
    const offset = parseInt(this.props.offset);

    return (
      <div className={cx('view', 'root')} id='multiplayer'>
        <div className='module-l1'>
          <div className='module-l2'>
            <div className='content head'>
              <div className='page-header'>
                <div className='name'>{t('Post Game Carnage Reports')}</div>
              </div>
            </div>
          </div>
          <div className='module-l2'>
            <ParentModeLinks />
          </div>
        </div>
        <div className='module-l1' id='matches'>
          <div className='content'>
            <div className='sub-header'>
              <div>Recent activities</div>
            </div>
            <Matches mode={false} characterId={member.characterId} limit='20' offset={offset} root='/reports/all' />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    PGCRcache: state.PGCRcache
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(All);
