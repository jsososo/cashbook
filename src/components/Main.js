require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReadFile from './ReadFile'
import Line from './Line'
import Pie from './Pie'

export const COLOR_MAP = {
  eatRecords: '0,153,255',
  shoppingRecords: '255,153,0',
  otherRecords: '255,255,0',
  trafficRecords: '0,255,0',
  travelRecords: '0,255,153',
  defaultRecords: '0,255,255',
  studyRecords: '255,0,153',
  amusementRecords: '153,0,255',
  mobileRecords: '255,0,255',
  incomeRecords: '0,0,255',
  outcomeRecords: '255,0,0',
  surplusRecords: '0, 0, 0',
  totalRecords: '153, 153, 153'
};

const MAX = 20000 * 365 * 24 * 3600 * 1000;
//stringify避免指向同一类型
const rawDataStr = JSON.stringify({
  days: {
    type: 'days',
    first: MAX,
    last: 0,
    data: []
  },
  months: {
    type: 'months',
    first: MAX,
    last: 0,
    data: []
  },
  years: {
    type: 'years',
    first: MAX,
    last: 0,
    data: []
  }
});
//初始化所有类型记录
const allData = {
  eatRecords: JSON.parse(rawDataStr),
  trafficRecords: JSON.parse(rawDataStr),
  amusementRecords: JSON.parse(rawDataStr),
  studyRecords: JSON.parse(rawDataStr),
  otherRecords: JSON.parse(rawDataStr),
  shoppingRecords: JSON.parse(rawDataStr),
  travelRecords: JSON.parse(rawDataStr),
  outcomeRecords: JSON.parse(rawDataStr),
  incomeRecords: JSON.parse(rawDataStr),
  defaultRecords: JSON.parse(rawDataStr),
  mobileRecords: JSON.parse(rawDataStr),
  surplusRecords: JSON.parse(rawDataStr),
  totalRecords: JSON.parse(rawDataStr)
};
//中文名对应的类型记录
const dataMap = {
  '餐饮': 'eatRecords',
  '淘宝': 'shoppingRecords',
  '一般': 'otherRecords',
  '交通': 'trafficRecords',
  '衣服鞋包': 'shoppingRecords',
  '零食': 'shoppingRecords',
  '生活用品': 'shoppingRecords',
  '旅游': 'travelRecords',
  '房租': 'defaultRecords',
  '学习': 'studyRecords',
  '水果': 'eatRecords',
  '电影': 'amusementRecords',
  '娱乐': 'amusementRecords',
  '话费': 'mobileRecords',
  '工资': 'incomeRecords',
  '生活费': 'incomeRecords',
  '零花钱': 'incomeRecords',
  '奖金': 'incomeRecords',
  '报销': 'incomeRecords',
  '投资收入': 'incomeRecords',
  '余额变更': 'otherRecords'
};
//英文类型对应的中文名
export const typeMap = {
  eatRecords: '吃的',
  shoppingRecords: '剁手',
  otherRecords: '其他',
  trafficRecords: '交通',
  travelRecords: '旅游',
  defaultRecords: '房租水电',
  studyRecords: '学习',
  amusementRecords: '浪',
  mobileRecords: '话费',
  incomeRecords: '收入',
  outcomeRecords: '支出',
  surplusRecords: '盈余',
  totalRecords: '总额'
};
//英文时间类型对应的中文名
const dateMap = {
  years: '年',
  months: '月',
  days: '日'
};

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      allData: allData,
      drawChartData: null,
      showType: [],
      allType: [],
      allDateType: ['years', 'months', 'days'],
      showDateType: 'months',
      drawPieData: null
    }
  }

  componentWillMount() {
    let allType = [];
    for (let t in typeMap) {
      allType.push(t)
    }
    this.setState({
      allType
    })
  }

  handleData(data) {
    //没有处理的keys
    let emptyKeys = [];
    data['收支记录'].forEach(r => {
      let type = dataMap[r['账目分类']];
      if (type) {
        let [year, month, day] = this.getInfoFromDate(r['时间']);
        //遍历年月日
        [{k: 'years', v: year}, {k: 'months', v: month}, {k: 'days', v: day}].forEach(t => {
          //过滤特大的无意义数据
          if (Math.abs(Number(r['金额']).toFixed(2)) < 800000) {

            if (Number(r['金额']) < 0) {
              //分类项目的支出
              this.caculate(t.k, type, t.v, r['金额']);
              this.caculate(t.k, 'outcomeRecords', t.v, r['金额']);
            } else {
              //所有的收入
              this.caculate(t.k, 'incomeRecords', t.v, r['金额']);
            }

            //年月日进行盈利累加
            this.caculate(t.k, 'surplusRecords', t.v, r['金额'], false);
            //年月日的盈利 = 总量计算，图表页再根据类型进行分类
            allData['totalRecords'] = allData['surplusRecords'];
          }
        })
      } else {
        //空key，未加入计算的分类 (大于0的部分已经全部算入incomeRecords)
        if (emptyKeys.indexOf(r['账目分类']) < 0 && r['金额'] < 0) {
          emptyKeys.push(r['账目分类'])
        }
      }
    });
    this.setState({
      allData,
      emptyKeys,
      drawPieData: this.caculatePieData()
    });
    this.selectType(this.state.showType, 'years')
  }

  caculatePieData() {
    let drawPieData = {
      years: {},
      months: {}
    };
    for (let type in allData) {
      if (type !== 'surplusRecords' && type !== 'totalRecords' && type !== 'outcomeRecords') {
        ['years', 'months'].forEach(timeType => {
          allData[type][timeType].data.forEach((value, index) => {
            if (drawPieData[timeType][index]) {
              drawPieData[timeType][index].push({
                type: type,
                value: value
              })
            } else {
              drawPieData[timeType][index] = [{
                type: type,
                value: value
              }]
            }
          })
        })
      }
    }

    return drawPieData;
  }

  caculate(timeType, type, time, value, needAbs = true) {
    if (needAbs) {
      if (allData[type][timeType]['data'][time]) {
        allData[type][timeType]['data'][time] += Math.abs(value);
      } else {
        allData[type][timeType]['data'][time] = Math.abs(value);
      }
    } else {
      if (allData[type][timeType]['data'][time]) {
        allData[type][timeType]['data'][time] += Number(value);
      } else {
        allData[type][timeType]['data'][time] = Number(value);
      }
    }
    allData[type][timeType].first = (time < allData[type][timeType].first) ? time : allData[type][timeType].first;
    allData[type][timeType].last = (time > allData[type][timeType].last) ? time : allData[type][timeType].last;
  }

  selectType(typeArr, time) {
    let allData = this.state.allData;
    let drawChartData = {
      type: time,
      first: MAX,
      last: 0,
      data: {}
    };
    typeArr.forEach(type => {
      drawChartData.first = Math.min(drawChartData.first, allData[type][time].first);
      drawChartData.last = Math.max(drawChartData.last, allData[type][time].last);
      drawChartData.data[type] = allData[type][time].data;
    });

    this.setState({drawChartData});
  }

  getInfoFromDate(str, type) {
    let arr = str.split('/');
    let day = new Date(arr[0], arr[1] - 1, arr[2], 8);
    switch(type) {
      case 'year':
        return Number(arr[0]);
      case 'month':
        return (day.getFullYear() - 1970) * 12 + day.getMonth();
      case 'day':
        return day.getTime() / (1000 * 3600 * 24);
      default:
        return [
          Number(arr[0]),
          (day.getFullYear() - 1970) * 12 + day.getMonth(),
          day.getTime() / (1000 * 3600 * 24)
        ]
    }
  }

  clickType(type, mode) {
    let { showType, showDateType } = this.state;
    if (mode === 'type') {
      if (showType.indexOf(type) > -1) {
        showType = showType.filter(i => i !== type)
      } else {
        showType.push(type);
      }
      this.setState({
        showType
      })
    } else {
      showDateType = type;
      this.setState({
        showDateType
      })
    }

    this.selectType(showType, showDateType)
  }

  render() {
    return (
      <div className='index'>
        { !this.state.drawChartData &&
          <ReadFile getData={this.handleData.bind(this)}/>
        }
        { this.state.drawChartData &&
        <div>
          <div className='line-container'>
            <div className='type-btn-group'>
              {this.state.allType.map(t => (
                <div
                  key={t}
                  onClick={() => this.clickType(t, 'type')}
                  className={`type-btn ${this.state.showType.indexOf(t) > -1 ? 'active' : ''}`}>
                  {typeMap[t]}
                </div>
              ))}
            </div>
            <div className='type-btn-group'>
              {this.state.allDateType.map(t => (
                <div
                  key={t}
                  onClick={() => this.clickType(t, 'date')}
                  className={`type-btn ${this.state.showDateType === t ? 'active' : ''}`}>
                  {dateMap[t]}
                </div>
              ))}
            </div>
            <Line data={this.state.drawChartData}/>
          </div>
          <Pie data={this.state.drawPieData}/>
        </div>
        }
      </div>
    );
  }
}

export default AppComponent;
