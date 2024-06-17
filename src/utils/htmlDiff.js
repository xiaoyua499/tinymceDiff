// 引入 diff_match_patch 库
import { diff_match_patch } from 'diff-match-patch'; // 请确保安装了相应的库

export default class HtmlDiff {
  constructor() {
    this.ignore_tag = [];
    this.Diff_Timeout = 0;
    this.del_color = '#F76964'
    this.ins_color = '#1E5FCD'
  }
  /**
   * 输入需要比对的html字符串，返回比对结果
   * @param {string} html1 比对的第一个html
   * @param {string} html2 比对第二个html(以此为基准)
   * @returns {object} 比对结果
   */
  diff_launch(html1, html2) {
    if (!html1) html1 = '';
    if (!html2) html2 = '';
    const fragments1 = this.processHtml(html1);
    const fragments2 = this.processHtml(html2);
    const [htmlStr1, htmlSt2] = this.compareAndPad(fragments1, fragments2)
    // console.log(htmlStr1, htmlSt2);
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
  /**
   * 对传入的html进行加工
   * @param {string} html 需要加工的html
   * @returns {Array} 加工后的html数组
   */
  processHtml(html){
    const htmlJson = this.htmlToJson(html)
    const fragments = []
    htmlJson.forEach(item => {
      const jsonHtml = this.jsonToHtml(item).outerHTML;
      fragments.push(jsonHtml)
    })
    return fragments
  }
  /**
 * 获取html中的闭合标签
 * @param {string} html - 待处理的html字符串
 * @returns {string} - 闭合标签
 */
  getClosingTag(html) {
    const match = html.match(/<[^>]+>/);
    return match ? match[0] : '';
  }
  /**
   * 
   * @param {Array} fragments1 第一个HTML的fragments数组
   * @param {Array} fragments2 第二个HTML的fragments数组
   * @returns {Array} 返回两个数组比较后的结果
   */
  compareAndPad(fragments1, fragments2) {
    let result1 = [];
    let result2 = [];
    let i = 0, j = 0;

    while (i < fragments1.length || j < fragments2.length) {
      let item1 = fragments1[i] !== undefined ? fragments1[i] : '';
      let item2 = fragments2[j] !== undefined ? fragments2[j] : '';

      let outermostTag1 = this.getClosingTag(item1);
      let outermostTag2 = this.getClosingTag(item2);

      if (outermostTag1 === outermostTag2) {
        // 如果最外层标签相同，将 item1 和 item2 分别添加到 result1 和 result2 中
        result1.push(item1);
        result2.push(item2);
        i++;
        j++;
      } else {
        if (!item1 || (outermostTag1 && !outermostTag2)) {
          // 如果 item1 为空，或者 outermostTag1 存在而 outermostTag2 不存在
          // 将空字符串加入 result1，将 item2 加入 result2
          result1.push('');
          result2.push(item2);
          j++;
        } else {
          // 否则，将 item1 加入 result1，将空字符串加入 result2
          result1.push(item1);
          result2.push('');
          i++;
        }
      }
    }

    return [result1, result2];
  }

  /**
   * 将HTML字符串转换为JSON格式
   * @param {string} html - HTML字符串
   * @returns {object} JSON格式的HTML对象
   */
  htmlToJson(html) {
    // 创建一个虚拟的DOM元素来解析HTML字符串
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    // 获取<body>标签
    var bodyElement = doc.querySelector('body');
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

    // 确保返回一个数组
    return jsonData.children || [];
  }
  /**
   * 将JSON格式的HTML对象转换为HTML字符串
   * @param {object} json - JSON格式的HTML对象
   * @returns {string} HTML字符串
   */
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
  /**
   * 检查传入的HTML字符串是否包含<table>标签。
   * @param {string} html - 待处理的html字符串
   * @returns {boolean} - 返回是否包含表格标签
   */
  containsTable(html) {
    return html.includes('<table');
  }
  /**
   * 将表格还原为HTML格式,并保留原来的样式
   * @param {*} html 
   * @param {*} table 
   * @param {*} type 
   * @returns 
   */
  tableToHtml(html, table, type) {
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
        const diff_color = type === 'del' ? this.del_color : this.ins_color
        diffHtml += `<td${cellAttributes} ><${type} style="color: ${diff_color};">${cell.replace(/<td[^>]*>/, '').replace(/<\/td>/, '')}</${type}></td>`;

      }
      diffHtml += '</tr>';
    }
    diffHtml += '</table>';
    return diffHtml;
  }
  tableDiff(html1, html2) {
    let table1 = this.extractTable(html1);
    let table2 = this.extractTable(html2);

    // 如果其中一个表格为空
    if (table1.length > 0 && table2.length === 0) {
      const diffHtml = this.tableToHtml(html1, table1, 'del');
      return { time: 0, diffHtml };
    } else if (table1.length === 0 && table2.length > 0) {

      const diffHtml = this.tableToHtml(html2, table2, 'ins');
      return { time: 0, diffHtml };
    }

    // 确保表格的行数一致
    const maxRows = Math.max(table1.length, table2.length);
    for (let i = 0; i < maxRows; i++) {
      table1[i] = table1[i] || [];
      table2[i] = table2[i] || [];
    }

    // 确保每行的单元格数一致
    table1.forEach((row, rowIndex) => {
      const maxCols = Math.max(row.length, table2[rowIndex].length);
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        table1[rowIndex][colIndex] = table1[rowIndex][colIndex] || '';
        table2[rowIndex][colIndex] = table2[rowIndex][colIndex] || '';
      }
    });

    const diffHtml = this.generateDiffTableHtml(html1, html2, table1, table2);
    return { time: 0, diffHtml };
  }

  generateDiffTableHtml(html1, html2, table1, table2) {
    const tableAttributes = this.getTableAttributes(html2);

    let diffHtml = `<table ${tableAttributes}>`;

    for (let i = 0; i < table1.length; i++) {
      diffHtml += '<tr>';
      for (let j = 0; j < table1[i].length; j++) {
        const cell1 = table1[i][j];
        const cell2 = table2[i][j];

        const cellAttributes = this.getCellAttributes(html2, i, j);

        const cellDiffHtml = this.cellDiff(cell1, cell2);
        diffHtml += `<td ${cellAttributes}>${cellDiffHtml}</td>`;
      }
      diffHtml += '</tr>';
    }

    diffHtml += '</table>';
    return diffHtml;
  }
  getTableAttributes(html) {
    const tableMatch = html.match(/<table([^>]*)>/);
    return tableMatch ? tableMatch[1] : '';
  }
  getCellAttributes(html, rowIndex, colIndex) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    const row = table && table.rows[rowIndex];
    const cell = row && row.cells[colIndex];
    if (cell) {
      const cellAttributes = [];
      for (let attr of cell.attributes) {
        cellAttributes.push(`${attr.name}="${attr.value}"`);
      }
      return cellAttributes.join(' ');
    }
    return '';
  }
  cellDiff(cell1, cell2) {
    var dmp = new diff_match_patch();
    var diffs = dmp.diff_main(cell1, cell2);
    dmp.diff_cleanupSemantic(diffs);

    let diffHtml = '';
    diffs.forEach(([type, text]) => {
      if (type === 0) {
        diffHtml += text;
      } else if (type === -1) {
        diffHtml += `<del style="color: ${this.del_color};">${text}</del>`;
      } else if (type === 1) {
        diffHtml += `<ins style="color: ${this.ins_color};">${text}</ins>`;
      }
    });

    return diffHtml;
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

    // console.log(diff.flat(Infinity), 'diff=============diff');
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

  /**
 * 重置 ignore_tag 标志。
 * 将所有忽略标签的标志设置为 false。
 */
  resetIgnoreTagFlags() {
    this.ignore_tag.forEach(item => item.flag = false);
  }

  /**
   * 检查是否在忽略标签内。
   * @returns {boolean} 如果当前在忽略标签内，返回 true，否则返回 false。
   */
  isInIgnoreTag() {
    return this.ignore_tag.some(item => item.flag);
  }

  /**
   * 更新 ignore_tag 标志。
   * @param {string} html - HTML 字符串。
   * @param {number} index - 当前处理的索引。
   * @param {boolean} isOpeningTag - 是否是开始标签。
   */
  updateIgnoreTagFlags(html, index, isOpeningTag) {
    this.ignore_tag.forEach(item => {
      if (isOpeningTag) {
        if (html.substr(index + 1, item.openTag.length) === item.openTag) {
          item.flag = true;
        }
      } else {
        if (item.flag && html.substring(index - item.closeTag.length, index) === item.closeTag) {
          item.flag = false;
        }
      }
    });
  }

  /**
   * 从 HTML 中提取纯文本，忽略指定的标签。
   * @param {string} html - HTML 字符串。
   * @returns {string} 提取的纯文本。
   */
  convertTextFromHtml(html) {
    let text = '';
    let tagFlag = false;
    this.resetIgnoreTagFlags();
    for (let i = 0; i < html.length; i++) {
      if (!tagFlag && html[i] === '<') {
        tagFlag = true;
        this.updateIgnoreTagFlags(html, i, true);
      } else if (tagFlag && html[i] === '>') {
        tagFlag = false;
        this.updateIgnoreTagFlags(html, i, false);
        continue;
      }
      if (!tagFlag && !this.isInIgnoreTag()) {
        text += html[i];
      }
    }
    return text;
  }

  /**
   * 从 HTML 中提取一个标签和其后的文本。
   * @param {string} html - HTML 字符串。
   * @returns {Object} 包含标签和文本的对象。
   * @returns {string} return.tag - 提取的标签。
   * @returns {string} return.text - 提取的文本。
   */
  getOneTextFromHtml(html) {
    let tag = '';
    let text = '';
    let tagFlag = false;
    this.resetIgnoreTagFlags();
    for (let i = 0; i < html.length; i++) {
      if (!tagFlag && html[i] === '<') {
        tagFlag = true;
        if (text) {
          return { tag, text };
        }
        this.updateIgnoreTagFlags(html, i, true);
      } else if (tagFlag && html[i] === '>') {
        tagFlag = false;
        tag += html[i];
        this.updateIgnoreTagFlags(html, i, false);
        continue;
      }
      if (!tagFlag && !this.isInIgnoreTag()) {
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
      return `<del style="color:${this.del_color}">${diffText}</del>`;
    } else {
      return `<ins style="color:${this.ins_color}">${diffText}</ins>`;
    }
  }
}
