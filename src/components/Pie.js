import React from 'react';
import RC2 from 'react-chartjs2';
import {COLOR_MAP, typeMap} from'./Main';

export default class Pie extends React.Component {
  constructor(props) {
    super(props);

    let [allData, options] = this.handleData(props.data);
    this.state = {
      allData,
      options,
      selectOptions: options[0]
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data) {
      let [allData, options] = this.handleData(newProps.data);

      this.setState({
        allData,
        options,
        selectOptions: options[0]
      })
    }
  }

  handleData(rawData) {
    let pieData = {};
    ['months', 'years'].forEach(timeType => {
      for (let index in rawData[timeType]) {
        let data = rawData[timeType][index];
        data.map(d => {
          if (pieData[this.changeNumToData(index, timeType)]) {
            pieData[this.changeNumToData(index, timeType)].labels.push(typeMap[d.type]);
            pieData[this.changeNumToData(index, timeType)].datasets[0].data.push(Number((d.value).toFixed(2)));
            pieData[this.changeNumToData(index, timeType)].datasets[0].backgroundColor.push(`rgb(${COLOR_MAP[d.type]})`);
          } else {
            pieData[this.changeNumToData(index, timeType)] = {
              labels: [typeMap[d.type]],
              datasets: [{
                data: [Number((d.value).toFixed(2))],
                backgroundColor: [`rgb(${COLOR_MAP[d.type]})`]
              }]
            }
          }
        });
      }
    });
    let options = [];
    for (let option in pieData) {
      options.push(option);
    }

    return [pieData, options];
  }

  changeNumToData(num, type) {
    switch (type) {
      case 'years':
        return Number(num);
      case 'months':
        return (1970 + parseInt(num / 12) + num % 12 / 100 + 0.01).toFixed(2);
    }
  }

  render() {
    return (
      <div className='pie-container'>
        <select onChange={e => this.setState({selectOptions: e.target.value})}>
          {this.state.options.map(o => (
            <option value={o} key={o}>{o}</option>
          ))}
        </select>
        <RC2 type='pie' data={this.state.allData[this.state.selectOptions]}/>
      </div>
    )
  }
}
