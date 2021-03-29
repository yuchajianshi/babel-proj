/**
 * 修改资料页面
 */

import React from 'react'
import { Image, View, Text, TextInput, ScrollView } from '@tencent/hippy-react'
import PropTypes from 'prop-types'
import Navigator from '../../components/Navigator'
import style from './components/style'
import Toast from '../../components/Toast/'
import client from '../../common/client'
import Request from '../../network/Request'
import console from '../../common/console'
import Comm from '../../network/comm'
import util from '../../common/util'
import BabyCard from './components/BabyCard'
import Dialog from '../../components/Dialog/'
import { LoadingCircle } from '../../components/Loading/'

/**
 * 该页面可接收如下参数：
 * name: 宝宝名字
 * age: 宝宝年龄
 * birthtime: 宝宝生日(epoch时间)
 * avatar: 宝宝头像
 * kid: 宝宝id
 */
export default class Account extends React.Component {
  static defaultProps = {
    babyInfos: [
      {
        avatar: 'https://y.gtimg.cn/music/common/upload/t_cm3_photo_publish/1802095.png',
        kid: '',
        name: ''
      }
    ]
  }

  constructor(props) {
    super(props)
    this.curBabyIndex = 0
    this.state = {
      babyInfos: props.babyInfos,
      loading: false
    }
  }

  componentDidMount() {
    // this.loadUserInfo()
    client.listen(res => {
      if (res.from == 'clip') {
        // 裁剪页面选择了新的头像
        this.state.babyInfos[this.curBabyIndex].avatar = res.params.picurl
        this.setState({babyInfos: this.state.babyInfos})
      }
    })
  }

  onScrollEndDrag(e) {
    if (this.refs.child0 && this.refs.child1) {
      let interval = this.refs.child1.layout.x - this.refs.child0.layout.x
      this.curBabyIndex = Math.round(e.contentOffset.x / interval)
      this.scroll && this.scroll.scrollTo(this.curBabyIndex * interval, 0, true)
    }
  }

  onClickDelete() {
    this.confirm && this.confirm.show()
  }

  async onConfirm() {
    let res = await Comm.deleteBaby(this.state.babyInfos[this.curBabyIndex].kid)
    if (res && res.code == -1) {
      client.toast(res.message)
    } else {
      client.toast('删除成功!')
      this.state.babyInfos.splice(this.curBabyIndex, 1)
      this.setState({ babyInfos: this.state.babyInfos }, () => {
        if (this.curBabyIndex == this.state.babyInfos.length) {
          this.curBabyIndex = 0
          this.scroll.scrollTo(0, 0, false)
        }
      })
      client.notice({
        from: 'account',
        to: ['main', 'setting'],
        instanceId: this.props.__instanceId__,
        params: {}
      })
    }
  }

  showLoading(show) {
    this.setState({loading: !!show})
  }

  render() {
    return (
      <View
        style={style.container}
        onTouchDown={() => {
          this.textInput && this.textInput.blur()
        }}
      >
        <Navigator title={'编辑资料'} />
        <View style={style.edit}>
          <ScrollView
            ref={r => (this.scroll = r)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            onScrollEndDrag={e => this.onScrollEndDrag(e)}
          >
            {this.state.babyInfos.map((item, index) => (
              <BabyCard
                first={index == 0 ? true : false}
                last={index == this.state.babyInfos.length - 1 ? true : false}
                ref={`child${index}`}
                name={item.name}
                birthtime={item.birthtime}
                avatar={item.avatar}
                kid={item.kid}
                key={item.kid}
                showLoading={show => this.showLoading(show)}
              ></BabyCard>
            ))}
          </ScrollView>
        </View>
        {this.state.babyInfos && this.state.babyInfos.length > 1 && this.state.babyInfos[0].kid && (
          <Text style={style.button_delete__text} onClick={() => this.onClickDelete()}>
            删除宝宝信息
          </Text>
        )}
        <Toast ref={toast => (this.toast = toast)} mode={'error'} />
        <Dialog
          ref={confirm => (this.confirm = confirm)}
          title={'提示'}
          config={{
            text: '确认删除宝宝吗？',
            btns: [
              { type: 2, text: '取消' },
              { type: 1, text: '确认' }
            ]
          }}
          onConfirm={() => this.onConfirm()}
        ></Dialog>
        {this.state.loading && <LoadingCircle></LoadingCircle>}
      </View>
    )
  }
}
