import React, { Component } from 'react'
import { Mixin, InputNumber, Slider, Loading, Button } from "@components"
import { COLORS } from '@constants'
import { classNames, _, formatNumber, isEqual } from '@utils'
import MainModal from './components/MainModal'
import ScrollPannel from './components/ScrollPanel'
import styles from './index.less'


export default class View extends Component {
  startInit = () => {
    this.getAllDetail()
  }

  getAllDetail = () => {
    this.getBuyDetail()
    this.getSellDetail()
  }

  getBuySellDetail = (payload = {}) => {
    const { dispatch, modelName, } = this.props
    return dispatch({
      type: `${modelName}/getBuySellDetail`,
      payload
    })
  }

  getBuyDetail = () => {
    const { price, amount } = this.state.buy
    const { model: { maxLimitPrice } } = this.props
    this.getBuySellDetail({
      price: this.isLimitPrice() ? price : Number(maxLimitPrice),
      amount,
      side: '2'
    }).then(res => {
      if (res) {
        const { marginDisplay, orderValueDisplay } = res
        const { buy } = this.state
        this.changeState({
          buy: {
            ...buy,
            marginDisplay,
            orderValueDisplay
          }
        })
      }
    })
  }

  getSellDetail = () => {
    const { price, amount } = this.state.sell
    const { model: { minLimitPrice } } = this.props
    this.getBuySellDetail({
      price: this.isLimitPrice() ? price : Number(minLimitPrice),
      amount,
      side: '1'
    }).then(res => {
      if (res) {
        const { marginDisplay, orderValueDisplay } = res
        const { sell } = this.state
        this.changeState({
          sell: {
            ...sell,
            marginDisplay,
            orderValueDisplay
          }
        })
      }
    })
  }


  state = {
    side: '',
    orderChannel: 0,// 限价还是市价
    buy: {
      marginDisplay: '', //保证金
      orderValueDisplay: '',//委托价值
      price: '',
      amount: '',
      ensureMoney: ''
    },
    sell: {
      marginDisplay: '', //保证金
      orderValueDisplay: '',//委托价值
      price: '',
      amount: '',
      ensureMoney: ''
    }
  }

  componentDidUpdate(prevProps) {
    const { model: { clickSelectOne: prevClickSelectOne } = {} } = prevProps
    const { model: { clickSelectOne } = {} } = this.props
    if (!isEqual(prevClickSelectOne, clickSelectOne) && clickSelectOne) {
      const { type, price, amount } = clickSelectOne
      if (type) {
        this.changeState({
          sell: {
            ...this.state.sell,
            price,
          },
          buy: {
            ...this.state.buy,
            price,
          }
        })
      }
    }
  }

  isLimitPrice = () => {
    const { orderChannel } = this.state
    return orderChannel === 0
  }

  changeState = (payload, callback) => {
    this.setState(payload, () => {
      _.isFunction(callback) && callback()
    })
  }

  renderInputItem = (config = {}) => {
    const { label_name, label_desc, intro_desc, intro_price, value, onChange, step, max, min } = config
    return (
      <div className={styles.priceitem} >
        <div className={styles.priceinput} >
          <div className={styles.label} >
            <div className={styles.label_name} >{label_name}</div >
            <div className={styles.label_desc} >{label_desc}</div >
          </div >
          <InputNumber className={styles.input_number} value={value} step={step} max={max} min={min}
                       onChange={onChange} />
        </div >
        {
          intro_desc && intro_price ? (
            <div className={styles.introduction} >
              <div className={styles.introduction_desc} >{intro_desc}</div >
              <div className={styles.introduction_price} >{intro_price}</div >
            </div >
          ) : null
        }

      </div >
    )
  }

  renderEnsureMoney = (config = {}) => {
    const { isLogin, } = this.props
    const { label_action, label_action_price, label_available, label_available_price } = config
    const marks = {
      0: '',
      [label_available_price * 0.25]: '',
      [label_available_price * 0.5]: '',
      [label_available_price * 0.75]: '',
      [label_available_price]: '',
    }
    const props = {
      marks: marks,
      max: label_available_price,
      defaultValue: 1,
      step: 0.1,
      included: true,
      disabled: isLogin ? false : true,
      dotStyle: {
        marginLeft: 'unset',
        backgroundColor: 'rgba(53,61,79,1)',
        border: 'none',
        bottom: '-1px',
      },
      railStyle: {
        height: '3px',
        backgroundColor: 'rgba(53,61,79,1)',
      },
      handleStyle: {
        display: isLogin ? '' : 'none',
        marginTop: '-6px',
        marginLeft: '-3px',
        width: '14px',
        height: '14px',
        border: `solid 4px ${COLORS.yellow}`,
        backgroundColor: 'white'
      },
      trackStyle: {
        height: '3px',
        width: '100px',
        backgroundColor: COLORS.yellow
      },
      activeDotStyle: {
        backgroundColor: isLogin ? COLORS.yellow : 'rgba(53,61,79,1)'
      }
    }
    return (
      <div className={styles.ensuremoney} >
        <Slider  {...props} />
        <div className={styles.description} >
          <div >
            <span >{label_action}</span >
            <span >{label_action_price}</span ></div >
          <div >
            <span >{label_available}</span >
            <span >{label_available_price}</span >
          </div >
        </div >
      </div >
    )
  }

  renderSubmit = (config = {}) => {
    const {
      configSubmit: { label_text, label_desc, label_price, className = {}, onSubmit, loading } = {},
      configPrice: { value: valuePrice } = {},
      configAmount: { value: valueAmount } = {}
    } = config
    const { isLogin, routerGoLogin, routerGoRegister } = this.props
    const { orderChannel } = this.state
    const { isLimitPrice } = this
    return <Button
      loading={loading}
      className={classNames(
        styles.submit,
        isLogin && (isLimitPrice() ? (valuePrice && valueAmount) : valueAmount) ? styles.haslogin : styles.notlogin,
        className
      )}
      onClick={() => {
        if (_.isFunction(onSubmit)) onSubmit()
      }}
    >
      {
        isLogin ? (
          <>
            <span className={styles.text} >
        {
          label_text
        }
      </span >
            <span >
        {
          label_desc
        }
      </span >
            <span >
        {
          label_price
        }
      </span >
          </>
        ) : (
          <>
            <div onClick={() => {
              routerGoLogin()
            }} >
              登录
            </div >
            <div className={styles.center} >或</div >
            <div onClick={() => {
              routerGoRegister()
            }} >
              注册
            </div >
          </>
        )
      }
    </Button >
  }

  renderArea = (config = {}) => {
    const { configPrice = {}, configAmount = {}, configEnsure = {}, configSubmit = {}, ...rest } = config
    return (
      <div style={{}} className={styles.area} >
        {
          this.renderInputItem({ ...configPrice, ...rest })
        }
        {
          this.renderInputItem({ ...configAmount, ...rest })
        }
        {
          this.renderEnsureMoney({ ...configEnsure, ...rest })
        }
        {
          this.renderSubmit(config)
        }
      </div >
    )
  }

  render() {
    const { renderArea, changeState, isLimitPrice, getBuyDetail, getSellDetail } = this
    const {
      dispatch, loading, modelName, RG, model: {
        minVaryPrice = '', minPriceMovementDisplay = '', minDealAmount = '',
        minDealAmountDisplay = '', maxLimitPrice = '', minLimitPrice = '', availableMoney = '',
      }, modal: { name } = {}, openModal
    } = this.props
    const { side, buy, sell } = this.state


    // 限价或者市价
    const configPrice = {
      label_name: isLimitPrice() ? '限价' : '市价',
      label_desc: `最小单位${minPriceMovementDisplay}`,
      intro_desc: '最高允许买价',
      intro_price: maxLimitPrice,
      value: isLimitPrice() ? buy.price : '',
      step: minVaryPrice,
      min: 0,
      onChange: (value) => {
        changeState({
          buy: {
            ...buy,
            price: value
          }
        }, () => {
          getBuyDetail()
        })

      }
    }
    // 数量
    const configAmount = {
      label_name: '数量',
      label_desc: `最小单位${minDealAmountDisplay}`,
      value: buy.amount,
      min: 0,
      onChange: (value) => {
        changeState({
          buy: {
            ...buy,
            amount: value
          }
        }, () => {
          getBuyDetail()
        })
      },
      step: minDealAmount
    }
    // 保证金
    const configEnsure = {
      label_action: '预估占用保证金',
      label_action_price: buy.marginDisplay,
      label_available: '可用金额',
      label_available_price: Number(availableMoney)
    }
    // 交易按钮
    const configSubmit = {
      loading: side === '2' && loading.effects[`${modelName}/postSideOrder`],
      label_text: '买入',
      label_desc: '委托价值',
      label_price: buy.orderValueDisplay,
      className: RG ? styles.buy : styles.sell,
      onSubmit: () => {
        changeState({
          side: '2'
        })
        dispatch({
          type: `${modelName}/postSideOrder`,
          payload: {
            side: '2',
            method: isLimitPrice() ? 'order.put_limit' : 'order.put_market',
            price: String(buy.price),
            amount: String(buy.amount)
          }
        })
      }
    }
    const configBuy = {
      name: 'buy',
      configPrice,
      configAmount,
      configEnsure,
      configSubmit
    }
    const configSell = {
      name: 'sell',
      configPrice: {
        ...configPrice,
        ...{
          intro_desc: '最低允许卖价',
          intro_price: minLimitPrice,
          value: isLimitPrice() ? sell.price : '',
          step: minVaryPrice,
          min: 0,
          onChange: (value) => {
            changeState({
              sell: {
                ...sell,
                price: value
              }
            })
            getSellDetail({
              price: value,
              amount: sell.amount
            })
          }
        }
      },
      configAmount: {
        ...configAmount,
        ...{
          value: sell.amount,
          onChange: (value) => {
            changeState({
              sell: {
                ...sell,
                amount: value
              }
            })
            getSellDetail({
              price: sell.price,
              amount: value
            })
          }
        }
      },
      configEnsure: {
        ...configEnsure,
        ...{
          label_action_price: sell.marginDisplay,
        }
      },
      configSubmit: {
        ...configSubmit,
        ...{
          loading: side === '1' && loading.effects[`${modelName}/postSideOrder`],
          label_text: '卖出',
          label_price: sell.orderValueDisplay,
          className: RG ? styles.sell : styles.buy,
          onSubmit: () => {
            changeState({
              side: '1'
            })
            dispatch({
              type: `${modelName}/postSideOrder`,
              payload: {
                side: '1',
                method: isLimitPrice() ? 'order.put_limit' : 'order.put_market',
                price: String(sell.price),
                amount: String(sell.amount)
              }
            })
          }
        }
      }
    }
    return (
      <Mixin.Child that={this} >
        <div
          className={
            classNames(
              {
                view: true
              },
              styles.buySell
            )
          }
        >
          <ScrollPannel
            scroller={false}
            header={
              <div className={styles.buysellheader} >
                <ul className={classNames(
                  styles.tab,
                  styles.buyselltab
                )} >
                  <li
                    className={classNames(
                      isLimitPrice() ? 'active' : null
                    )}
                    onClick={() => {
                      changeState({
                        orderChannel: 0,
                      }, () => {
                        this.getAllDetail()
                      })
                    }}
                  >
                    限价
                  </li >
                  <li
                    className={classNames(
                      !isLimitPrice() ? 'active' : null
                    )}
                    onClick={() => {
                      changeState({
                        orderChannel: 1,
                      }, () => {
                        this.getAllDetail()
                      })
                    }}
                  >
                    市价
                  </li >
                </ul >
                <ul className={styles.right} >
                  <li >计算器</li >
                  <li onClick={
                    () => {
                      openModal({ name: 'fee' })
                    }
                  } >费用
                  </li >
                </ul >
              </div >
            }
          >
            <div className={styles.content} >
              {
                renderArea(configBuy)
              }
              {
                renderArea(configSell)
              }
            </div >
          </ScrollPannel >
        </div >
        {
          name === 'fee' ? (<RenderModal {...this.props} {...this.state}  />) : null
        }
      </Mixin.Child >
    )
  }
}

class RenderModal extends Component {
  state = {
    fee: {}
  }

  componentDidMount() {
    const { dispatch, modelName } = this.props
    dispatch({
      type: `${modelName}/getMarketFee`
    }).then(res => {
      if (res) {
        this.changeState({
          fee: res
        })
      }
    })
  }

  changeState = (payload) => {
    this.setState(payload)
  }

  render() {
    const { changeState } = this
    const { dispatch, modelName, closeModal, model: { marketName } } = this.props
    const {
      fee: {
        makerFeeRateDisplay = '', takerFeeRateDisplay = '',
        liquidationFeeRateDisplay = '', deliveryRateDisplay = ''
      } = {}
    } = this.state
    const props = {
      ...this.props,
      title: marketName
    }
    return (
      <MainModal {...props} className={styles.buySellFee_Modal} >
        <ul >
          <li >
            <div >流动性提供方(挂单)手续费率:</div >
            <div >{makerFeeRateDisplay}</div >
          </li >
          <li >
            <div >流动性提供方(吃单)手续费率:</div >
            <div >{takerFeeRateDisplay}</div >
          </li >
          <li >
            <div >强平手续费率:</div >
            <div >{liquidationFeeRateDisplay}</div >
          </li >
          <li >
            <div >交割手续费率:</div >
            <div >{deliveryRateDisplay}</div >
          </li >
        </ul >
      </MainModal >
    )
  }
}

