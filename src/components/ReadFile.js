import React from 'react'
import XLSX from 'xlsx'

export default class ReadFile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showError: false
    }
  }

  readFile(e) {
    let [files, fileReader, data, binaryData, workbook, _this] = [
      e.target.files,
      new FileReader(),
      {},
      null,
      null,
      this
    ];

    fileReader.onload = e => {
      try {
        binaryData = e.target.result;
        workbook = XLSX.read(binaryData, {type: 'binary'});

        for (let sheet in workbook.Sheets) {
          //遍历每张表
          data[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
        }

        _this.props.getData(data)
      } catch (error) {
        console.log(error);
        console.log('出错了emmmmmm, 一定是你的错，不怪我');
        _this.setState({
          showError: true
        });
      }
    }

    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
  }

  render() {
    return (
      <div className='import-box'>
        <input type='file' onChange={this.readFile.bind(this)}/>
        <div className='txt'>
          上传excel文件，文件内容这里以口袋记账导出数据为基准
        </div>
        {this.state.showError && <div className='error-txt'>出错了emmmmmm, 一定是你的错，不怪我</div>}
      </div>
    )
  }
}
