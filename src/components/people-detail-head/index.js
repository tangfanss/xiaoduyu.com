import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loadPeopleList } from '../../actions/people';
import { getPeopleListByName } from '../../reducers/people';

// components
import Meta from '../meta';
import Follow from '../follow';
import Loading from '../ui/loading';
import ReportMenu from '../report-menu';

// styles
import CSSModules from 'react-css-modules';
import styles from './style.scss';

// import To from '../../common/to';

class StringToColor {

  static intToRGB(i){
    let c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }

  static convertStringToColor(str) {
    let hashCode = (str) => { // java String#hashCode
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };

    return StringToColor.intToRGB(hashCode(str));
  }

}

@connect(
  (state, props) => ({
    list: getPeopleListByName(state, props.id)
  }),
  dispatch => ({
    loadPeopleList: bindActionCreators(loadPeopleList, dispatch)
  })
)
@CSSModules(styles)
export class PeopleDetailHead extends React.Component {

  static propTypes = {
    // 用户id
    id: PropTypes.string.isRequired
  }

  // 服务端渲染
  // 加载需要在服务端渲染的数据

  static loadData({ store, match }) {
    return new Promise(async (resolve, reject) => {

      const { id } = match.params;

      const [ err, data ] = await loadPeopleList({
        name: id,
        filters: {
          variables: {
            _id: id,
            blocked: false
          }
        }
      })(store.dispatch, store.getState);

      // 没有找到帖子，设置页面 http code 为404
      if (err || !data || data.length == 0) {
        resolve({ code: 404, text: '该用户不存在' });
      } else {
        resolve({ code: 200 });
      }

    })
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {

    let { id, loadPeopleList, list, notFoundPgae } = this.props;
    let err;

    if (!list || !list.data) {

      [ err, list ] = await loadPeopleList({
        name:id,
        filters: {
          variables: { _id: id, blocked: false }
        }
      });

    }

    if (list && list.data && !list.data[0]) {
      notFoundPgae('该用户不存在');
    }

  }

  render() {

    const { id, list, body } = this.props;
    const { loading, data } = list || {};
    const people = data && data[0] ? data[0] : null;

    if (loading || !people) return (<Loading />);

    return (
      <div>
        <Meta title={people.nickname} />

        <div styleName="header">

          <div styleName="profile">
            <div styleName="actions">
              <Follow user={people} />
              <ReportMenu user={people} />
            </div>
            <img styleName="avatar" src={people.avatar_url.replace('thumbnail/!50', 'thumbnail/!300')} />
            <div styleName="nickname">
              {people.nickname}
              {Reflect.has(people, 'gender') && people.gender != null ?
                <span styleName={people.gender == 1 ? 'male' : 'female'}></span>
                : null}
            </div>
            <div>{people.brief}</div>
          </div>

          <div styleName="tab">
            <NavLink exact to={`/people/${people._id}`}>
                <span>{people.posts_count > 0 ? people.posts_count : 0}</span>帖子
              </NavLink>
            <NavLink exact to={`/people/${people._id}/follow/posts`}>
                <span>{people.follow_posts_count > 0 ? people.follow_posts_count : 0}</span>关注的帖子
              </NavLink>
            <NavLink exact to={`/people/${people._id}/comments`}>
              <span>{people.comment_count > 0 ? people.comment_count : 0}</span>评论
              </NavLink>
            <NavLink exact to={`/people/${people._id}/follow/topics`}>
              <span>{people.follow_topic_count > 0 ? people.follow_topic_count : 0}</span>话题
              </NavLink>
            <NavLink exact to={`/people/${people._id}/follow/peoples`}>
              <span>{people.follow_people_count > 0 ? people.follow_people_count : 0}</span>关注的人
              </NavLink>
            <NavLink exact to={`/people/${people._id}/fans`}>
              <span>{people.fans_count > 0 ? people.fans_count : 0}</span>粉丝
              </NavLink>
          </div>

        </div>

        <div>
          {body || '空'}
        </div>
      </div>
    )

  }

}

export default PeopleDetailHead;
