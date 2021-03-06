import React from 'react'
import { connect } from 'dva'
import { _ } from '@utils'


@connect(({ user: model, loading, dispatch }) => ({
  model,
  modelName: 'user',
  loading, dispatch
}))
export class MixinParent extends React.Component {

  constructor(props) {
    super(props)
    const { that } = this.props
    that.childInitStacks = []
  }

  componentDidMount() {
    const { model: { userInfo } = {}, dispatch, modelName } = this.props
    const getCurrentUser = new Promise((resolve, reject) => {
      resolve()
    })
    getCurrentUser.then(res => {
      this.startInit()
    }).catch((error) => {
      console.log('用户信息获取失败或者父startInit调用出错通常是由于子startInit调用出错', error)
    })
  }


  startInit = () => {
    const { that = {} } = this.props
    const { startInit } = that
    if (_.isFunction(startInit)) {
      startInit && startInit()
    }
  }

  render() {
    const { children } = this.props
    return (
      <>
        {children}
      </>
    )
  }
}

export class MixinChild extends React.Component {
  constructor(props) {
    super(props)
    const { that = {} } = this.props
    that._isMounted = true
    that.changeState = (payload = {}, callback) => {
      if (that._isMounted) {
        that.setState(payload, () => {
          _.isFunction(callback) && callback()
        })
      }
    }
    // if (!that.props.that.childInitStacks) that.props.that.childInitStacks = []
  }

  componentDidMount() {
    this.startInit()
  }

  componentWillUnmount() {
    this.props.that._isMounted=false
    // this.startUnMount()
  }

  startInit = () => {
    const { that = {} } = this.props
    const [startInit, childInitStacks] = [_.get(that, 'startInit'), _.get(that, 'props.that.childInitStacks')]
    if (_.isFunction(startInit) && _.isArray(childInitStacks)) {
      childInitStacks.push(() => {
        startInit()
      })
    }
  }

  startUnMount = () => {
    const { that = {} } = this.props
    that._isMounted = false
    // return Promise.resolve()
    // if (that.interval) {
    //   return new Promise((resolve) => {
    //     if (_.isArray(that.interval)) {
    //       that.interval.map(item => clearTimeout(item))
    //     } else {
    //       clearTimeout(that.interval)
    //     }
    //     that.interval = null
    //     resolve()
    //   })
    // } else {
    //   return Promise.resolve()
    // }
  }

  render() {
    const { children } = this.props
    return (
      <>
        {children}
      </>
    )
  }
}

export default {
  Parent: MixinParent,
  Child: MixinChild
}




