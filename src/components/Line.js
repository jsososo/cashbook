import React, {Component} from 'react';
import RC2 from 'react-chartjs2';
import {COLOR_MAP, typeMap} from'./Main';

class Line extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rawData: null,
      data: null,
      options: {
        key: [],
        value: []
      },
      selectedOptions: 0
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data) {
      this.setState({
        rawData: newProps.data,
        data: this.getData(newProps.data, this.state.options.value[this.state.selectedOptions])
      });
    }
  }

  getData(rawData, options) {
    //labels：坐标；  datasets：数据
    let data = {
      labels: [],
      datasets: []
    };

    this.setOptions(rawData);
    //给每一条线加入固定的类型（线的名称、背景色等）
    for (let t in rawData.data) {
      data.datasets.push({
        label: typeMap[t],
        backgroundColor: `rgba(${COLOR_MAP[t]},0.1)`,
        borderColor: `rgba(${COLOR_MAP[t]},1)`,
        data: []
      })
    }

    //根据options是否开启筛选
    let {first, last} = rawData;
    if (options && options !== 'all') {
      [first, last] = options;
    }
    //从第一天开始，循环到最后一天，避免空位不能被forEach循环到
    for (let y = first; y <= last; y++) {
      //横坐标加入
      data.labels.push(this.numberToDate(y, rawData.type));
      for (let type in rawData.data) {

        rawData.data[type][y] = Number(rawData.data[type][y]);
        let value = Number((Number(rawData.data[type][y])).toFixed(2));
        value = isNaN(value) ? 0 : Number(value.toFixed(2));

        //筛选出datasets中所对应的那条线
        let filterData = data.datasets.filter(d => d.label === typeMap[type])[0];
        //填充数据，总额（totalRecords）需要累加
        if (filterData && type !== 'totalRecords') {
          filterData.data.push(value);
        } else if (filterData && type === 'totalRecords') {
          let l = filterData.data.length;
          if (l) {
            //累加
            filterData.data.push(Number((Number(filterData.data[l - 1]) + value).toFixed(2)));
          } else {
            filterData.data.push(value);
          }
        }
      }
    }

    return data
  }

  setOptions(rawData) {
    //设置select选择器的options
    let options = {
      key: [],
      value: []
    };
    let [f, l] = [rawData.first, rawData.last];
    switch (rawData.type) {
      case 'months':
        options.key.push('全部');
        options.value.push('all');
        while(f < l) {
          let year = parseInt(f / 12 + 1970);
          options.key.push(year);
          options.value.push([(year - 1970) * 12, (year - 1969) * 12]);
          f += 12;
        }
        break;
      case 'days':
        options.key.push('全部');
        options.value.push('all');
        let [dateF, dateL] = [new Date(f * 1000 * 3600 * 24), new Date(l * 1000 * 3600 * 24)];
        while(dateF.getFullYear() < dateL.getFullYear() || (dateF.getFullYear() === dateL.getFullYear() && dateF.getMonth() < dateL.getMonth())) {
          options.key.push(dateF.getFullYear() + '.' + (dateF.getMonth() + 1));
          let _f = dateF.getTime() / (1000 * 3600 * 24);
          dateF.setMonth(dateF.getMonth() + 1);
          let _l = dateF.getTime() / (1000 * 3600 * 24);
          options.value.push([_f, _l]);
        }
        break;
    }
    this.setState({
      options
    });
  }

  numberToDate(number, type) {
    let [date, str] = [new Date(), ''];
    switch(type) {
      case 'days':
        date.setTime(number * 1000 * 3600 * 24);
        str = `${date.getMonth() + 1}.${date.getDate()}`;
        if (str === '1.1') {
          str = `${date.getFullYear()}.${str}`;
        }
        return str;
      case 'months':
        let str = number % 12 + 1;
        if (str === 1) {
          str = `${parseInt(number / 12) + 1970}.${str}`;
        }
        return str;

      case 'years':
        return number;
    }
  }

  handleSelected(value) {
    this.setState({
      selectedOptions: value,
      data: this.getData(this.state.rawData, this.state.options.value[value])
    })
  }

  render() {
    return (
      <div className='line-chart-container'>
        { this.state.options.key.length > 1 &&
          <select onChange={(e) => this.handleSelected(e.target.value)}>
            {this.state.options.key.map((k, index) => (
                <option key={index} value={index}>{k}</option>
              )
            )}
          </select>
        }
        <RC2 data={this.state.data} type='line' />
      </div>
    );
  }
}

export default Line;