// 引入 diff_match_patch 库
import { diff_match_patch } from 'diff-match-patch'; // 请确保安装了相应的库

export default class HtmlDiff {
  constructor() {
    this.ignore_tag = [];
    this.Diff_Timeout = 0;
  }

  diff_launch(html1, html2) {
    const htmlJson1 = this.htmlToJson(html1)
    const htmlJson2 = this.htmlToJson(html2)
    const fragments1 = []
    const fragments2 = []
    htmlJson1.forEach(item => {
      const jsonHtml = this.jsonToHtml(item).outerHTML;
      fragments1.push(jsonHtml)
    })
    htmlJson2.forEach(item => {
      const jsonHtml = this.jsonToHtml(item).outerHTML;
      fragments2.push(jsonHtml)
    })
    const [htmlStr1, htmlSt2]=this.compareAndPad(fragments1, fragments2)
    console.log(htmlStr1, htmlSt2);
    let diffHtml = '';
    let startTime = new Date().getTime();

    while (htmlStr1.length || htmlSt2.length) {
      const fragment1 = htmlStr1.shift() || '';
      const fragment2 = htmlSt2.shift() || '';

      if (this.containsTable(fragment1) || this.containsTable(fragment2)) {
        diffHtml += this.tableDiff(fragment1, fragment2).diffHtml;
      } else {
        diffHtml += this.textDiff(fragment1, fragment2).diffHtml;
      }
    }

    let endTime = new Date().getTime();
    return { time: endTime - startTime, diffHtml };
  }
  getClosingTag(html) {
    const match = html.match(/<[^>]+>/);
    return match ? match[0] : '';
  }

  compareAndPad(arr1, arr2)  {
    let result1 = [];
    let result2 = [];
    let i = 0, j = 0;

    while (i < arr1.length || j < arr2.length) {
      let item1 = arr1[i] !== undefined ? arr1[i] : '';
      let item2 = arr2[j] !== undefined ? arr2[j] : '';

      let outermostTag1 = this.getClosingTag(item1);
      let outermostTag2 = this.getClosingTag(item2);

      if (outermostTag1 === outermostTag2) {
        result1.push(item1);
        result2.push(item2);
        i++;
        j++;
      } else {
        if (!item1) {
          result1.push('');
          result2.push(item2);
          j++;
        } else if (!item2) {
          result1.push(item1);
          result2.push('');
          i++;
        } else if (outermostTag1 && !outermostTag2) {
          result1.push('');
          result2.push(item2);
          j++;
        } else {
          result1.push(item1);
          result2.push('');
          i++;
        }
      }
    }

    return [result1, result2];
  }



  htmlToJson(html) {

    // 创建一个虚拟的DOM元素来解析HTML字符串
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    // 获取<body>标签
    var bodyElement = doc.querySelector('body');
    // console.log(bodyElement);
    // 定义一个函数来将DOM元素转换为JSON格式
    function domToJson(element) {
      var result = {};
      result.name = element.nodeName.toLowerCase();
      result.attrs = {};
      var attrs = element.attributes;
      for (var i = 0; i < attrs.length; i++) {
        result.attrs[attrs[i].name] = attrs[i].value;
      }
      if (element.childNodes.length > 0) {
        result.children = [];
        for (var i = 0; i < element.childNodes.length; i++) {
          var child = element.childNodes[i];
          if (child.nodeType === Node.TEXT_NODE) {
            result.text = child.nodeValue.trim();
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            result.children.push(domToJson(child));
          }
        }
      }
      return result;
    }

    // 将整个HTML文档转换为JSON
    const jsonData = domToJson(bodyElement);

    // 打印JSON数据
    // console.log(JSON.stringify(jsonData.children, null, 2));
    return jsonData.children;

  }
  jsonToHtml(json) {
    var element = document.createElement(json.name);
    for (var key in json.attrs) {
      element.setAttribute(key, json.attrs[key]);
    }
    if (json.text) {
      element.textContent = json.text;
    }
    if (json.children && json.children.length > 0) {
      var self = this; // 保存 this 的引用
      json.children.forEach(function (childJson) {
        var childElement = self.jsonToHtml(childJson);
        element.appendChild(childElement);
      });
    }
    return element;
  }

  containsTable(html) {
    return html.includes('<table');
  }
  tableToHtml(html, table, color) {
    // 提取原始表格的样式属性
    const tableMatch = html.match(/<table([^>]*)>/);
    const tableAttributes = tableMatch ? tableMatch[1] : '';
    let diffHtml = `<table${tableAttributes}>`;
    for (let i = 0; i < table.length; i++) {
      let row = table[i] || [];
      diffHtml += '<tr>';
      for (let j = 0; j < row.length; j++) {
        let cell = row[j] || '';
        // 提取单元格的样式属性
        const cellMatch = cell.match(/<td([^>]*)>/);
        const cellAttributes = cellMatch ? cellMatch[1] : '';
        diffHtml += `<td${cellAttributes} style="background-color: ${color};">${cell.replace(/<td[^>]*>/, '').replace(/<\/td>/, '')}</td>`;
      }
      diffHtml += '</tr>';
    }
    diffHtml += '</table>';
    return diffHtml;
  }
  tableDiff(html1, html2) {
    let table1 = this.extractTable(html1);
    let table2 = this.extractTable(html2);
    if (table1.length > 0 && table2.length > 0) {
      // 若表格中有一个为空，则按简单文本比对
      return this.textDiff(html1, html2);
    } else if (table1.length > 0 && table2.length == 0) {
      const diffHtml = this.tableToHtml(html1, table1, 'red');
      return { time: 0, diffHtml };
    } else {
      const diffHtml = this.tableToHtml(html2, table2, 'green');
      return { time: 0, diffHtml };
    }
  }

  extractTable(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    let table = doc.querySelector('table');

    let tableData = [];
    if (table) {
      table.querySelectorAll('tr').forEach(row => {
        let rowData = [];
        row.querySelectorAll('td, th').forEach(cell => {
          rowData.push(cell.innerHTML);
        });
        tableData.push(rowData);
      });
    }
    return tableData;
  }

  textDiff(html1, html2) {
    var text1 = this.convertTextFromHtml(html1);
    var text2 = this.convertTextFromHtml(html2);

    var dmp = new diff_match_patch();
    dmp.Diff_Timeout = this.Diff_Timeout;
    var ms_start = (new Date).getTime();
    var diff = dmp.diff_main(text1, text2, true);
    var ms_end = (new Date).getTime();

    let time = ms_end - ms_start;

    let diffHtml = this.restoreToHtml(html2, diff);
    return { time, diffHtml };
  }

  restoreToHtml(originalHtml, diffResultList) {
    let diffHtml = '';
    while (true) {
      let { tag, text } = this.getOneTextFromHtml(originalHtml);
      diffHtml += tag;
      originalHtml = originalHtml.substr(tag.length + text.length);
      for (let i = 0, len = diffResultList.length; i < len; i++) {
        let diffType = diffResultList[i][0];
        let diffText = diffResultList[i][1];
        if (diffType === -1) {
          diffHtml += this.formatText(diffType, diffText);
          diffResultList.splice(i, 1);
          i--;
          len--;
          continue;
        }
        if (diffText === text) {
          diffHtml += this.formatText(diffType, diffText);
          diffResultList.splice(i, 1);
          break;
        }
        if (diffText.length > text.length) {
          diffHtml += this.formatText(diffType, text);
          diffResultList[i][1] = diffText.substr(text.length);
          break;
        }
        if (text.length > diffText.length) {
          diffHtml += this.formatText(diffType, diffText);
          text = text.substr(diffText.length);
          diffResultList.splice(i, 1);
          i--;
          len--;
        }
      }
      if (!originalHtml || !diffResultList || diffResultList.length <= 0) {
        break;
      }
    }
    for (let i = 0, len = diffResultList.length; i < len; i++) {
      diffHtml += this.formatText(diffResultList[i][0], diffResultList[i][1]);
    }
    return diffHtml + originalHtml;
  }

  convertTextFromHtml(html) {
    let text = '';
    let tagFlag = false;
    this.ignore_tag.map(item => {
      item.flag = false;
    });
    for (let i = 0, len = html.length; i < len; i++) {
      if (!tagFlag && html[i] === '<') {
        tagFlag = true;
        this.ignore_tag.map(item => {
          if (html.substr(i + 1, item.openTag.length) === item.openTag) {
            item.flag = true;
          }
        });
      } else if (tagFlag && html[i] === '>') {
        tagFlag = false;
        this.ignore_tag.map(item => {
          if (item.flag && html.substring(i - item.closeTag.length, i) === item.closeTag) {
            item.flag = false;
          }
        });
        continue;
      }
      let notDiffFlag = false;
      this.ignore_tag.map(item => {
        if (item.flag) {
          notDiffFlag = true;
        }
      });
      if (!tagFlag && !notDiffFlag) {
        text += html[i];
      }
    }
    return text;
  }

  getOneTextFromHtml(html) {
    let tag = '';
    let text = '';
    let tagFlag = false;
    this.ignore_tag.map(item => {
      item.flag = false;
    });
    for (let i = 0, len = html.length; i < len; i++) {
      if (!tagFlag && html[i] === '<') {
        tagFlag = true;
        if (text) {
          return { tag, text };
        }
        this.ignore_tag.map(item => {
          if (html.substr(i + 1, item.openTag.length) === item.openTag) {
            item.flag = true;
          }
        });
      } else if (tagFlag && html[i] === '>') {
        tagFlag = false;
        tag += html[i];
        this.ignore_tag.map(item => {
          if (item.flag && html.substring(i - item.closeTag.length, i) === item.closeTag) {
            item.flag = false;
          }
        });
        continue;
      }
      let notDiffFlag = false;
      this.ignore_tag.map(item => {
        if (item.flag) {
          notDiffFlag = true;
        }
      });
      if (!tagFlag && !notDiffFlag) {
        text += html[i];
      } else {
        tag += html[i];
      }
    }
    return { tag, text };
  }

  formatText(diffType, diffText) {
    if (diffType === 0) {
      return diffText;
    } else if (diffType === -1) {
      return '<del style="background-color: red;">' + diffText + '</del>';
    } else {
      return '<ins style="background-color: green;"> ' + diffText + '</ins>';
    }
  }
}
