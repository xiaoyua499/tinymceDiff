import { diff_match_patch } from 'diff-match-patch';

export default class HtmlDiff {
  constructor() {
    this.ignore_tag = [];
    this.Diff_Timeout = 1.0;  // 设置比对超时时间
    this.del_color = '#F76964';
    this.ins_color = '#1E5FCD';
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
    const tableRegex = /<table[\s\S]*?<\/table>/g;
    let tableHtml1 = html1.match(tableRegex) || [];
    let tableHtml2 = html2.match(tableRegex) || [];

    let textHtml1 = html1.replace(tableRegex, '@table@');
    let textHtml2 = html2.replace(tableRegex, '@table@');
    if (tableHtml1 || tableHtml2) {
      textHtml1 = textHtml1.replace(/&nbsp;/g, '');
      textHtml2 = textHtml2.replace(/&nbsp;/g, '');
    }
    console.log(tableHtml1, tableHtml2);
    // 比对表格部分
    let tableDiffs = [];
    const maxLength = Math.max(tableHtml1.length, tableHtml2.length);
    for (let i = 0; i < maxLength; i++) {
      const table1 = tableHtml1[i] || '';
      const table2 = tableHtml2[i] || '';
      const tableDiff = this.tableDiff(table1.replace(/&nbsp;/g, ''), table2.replace(/&nbsp;/g, '')).diffHtml;
      tableDiffs.push(tableDiff);
    }

    // 比对其他内容部分
    let diffHtml = this.textDiff(textHtml1, textHtml2).diffHtml;

    // 替换表格占位符
    tableDiffs.forEach(tableDiff => {
      diffHtml = diffHtml.replace('@table@', tableDiff);
    });

    return diffHtml;
  }


  tableToHtml(html, table, type) {
    const tableMatch = html.match(/<table([^>]*)>/);
    const tableAttributes = tableMatch ? tableMatch[1] : '';
    let diffHtml = `<table${tableAttributes}>`;

    for (const row of table) {
      diffHtml += '<tr>';
      for (const cell of row) {
        const cellMatch = cell.match(/<td([^>]*)>/);
        const cellAttributes = cellMatch ? cellMatch[1] : '';
        console.log(cellAttributes);
        const diff_color = type === 'del' ? this.del_color : this.ins_color;
        diffHtml += `<td${cellAttributes}><${type} style="color: ${diff_color};">${cell.replace(/<td[^>]*>/, '').replace(/<\/td>/, '')}</${type}></td>`;
      }
      diffHtml += '</tr>';
    }

    diffHtml += '</table>';
    return diffHtml;
  }

  tableDiff(html1, html2) {
    const table1 = this.extractTable(html1);
    const table2 = this.extractTable(html2);

    if (table1.length > 0 && table2.length === 0) {
      return { time: 0, diffHtml: this.tableToHtml(html1, table1, 'del') };
    } else if (table1.length === 0 && table2.length > 0) {
      return { time: 0, diffHtml: this.tableToHtml(html2, table2, 'ins') };
    }

    const maxRows = Math.max(table1.length, table2.length);
    for (let i = 0; i < maxRows; i++) {
      table1[i] = table1[i] || [];
      table2[i] = table2[i] || [];
    }

    table1.forEach((row, rowIndex) => {
      const maxCols = Math.max(row.length, table2[rowIndex].length);
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        table1[rowIndex][colIndex] = table1[rowIndex][colIndex] || '';
        table2[rowIndex][colIndex] = table2[rowIndex][colIndex] || '';
      }
    });

    return { time: 0, diffHtml: this.generateDiffTableHtml(html1, html2, table1, table2) };
  }

  generateDiffTableHtml(html1, html2, table1, table2) {
    console.log(html1, html2, table1, table2);
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
    console.log(diffHtml);
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
      return Array.from(cell.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');
    }
    return '';
  }

  cellDiff(cell1, cell2) {
    // 使用特殊标识符来替换标签的前半部分和后半部分
    const startTagPlaceholder = '@STARTTAG@';
    const endTagPlaceholder = '@ENDTAG@';

    // 保存标签和内容的数组
    let tags = [];

    // 替换标签并保存
    const replaceTags = (text) => {
      return text.replace(/<[^>]+>/gi, (match) => {
        tags.push(match);
        return match.startsWith('</') ? endTagPlaceholder : startTagPlaceholder;
      });
    };
    const cleanCell1 = replaceTags(cell1);
    const cleanCell2 = replaceTags(cell2);
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(cleanCell1, cleanCell2);

    // 在生成结果时还原标签
    let tagIndex = 0;
    let result = diffs.map(([type, text]) => {
      if (text === startTagPlaceholder || text === endTagPlaceholder) {
        return text;
      }
      if (type === 0) {
        return text;
      }
      const tag = type === -1 ? 'del' : 'ins';
      const color = type === -1 ? this.del_color : this.ins_color;
      return `<${tag} style="color: ${color};">${text}</${tag}>`;
    }).join('');

    // 替换回特殊标识符为原始的标签
    result = result.replace(new RegExp(startTagPlaceholder, 'g'), () => tags[tagIndex++])
      .replace(new RegExp(endTagPlaceholder, 'g'), () => tags[tagIndex++]);

    return result;
  }

  extractTable(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    const tableData = [];
    if (table) {
      table.querySelectorAll('tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('td, th').forEach(cell => rowData.push(cell.innerHTML));
        tableData.push(rowData);
      });
    }
    return tableData;
  }

  textDiff(html1, html2) {
    const text1 = this.convertTextFromHtml(html1);
    const text2 = this.convertTextFromHtml(html2);

    const dmp = new diff_match_patch();
    dmp.Diff_Timeout = this.Diff_Timeout;
    const ms_start = new Date().getTime();
    const diffs = dmp.diff_main(text1, text2, true);
    const ms_end = new Date().getTime();

    dmp.diff_cleanupSemantic(diffs);

    const diffHtml = this.restoreToHtml(html2, diffs);
    return { time: ms_end - ms_start, diffHtml };
  }

  restoreToHtml(originalHtml, diffResultList) {
    let diffHtml = '';

    while (true) {
      let { tag, text } = this.getOneTextFromHtml(originalHtml);
      diffHtml += tag;
      originalHtml = originalHtml.substr(tag.length + text.length);

      text = text.replace(/@br@/g, '<br/>');

      for (let i = 0, len = diffResultList.length; i < len; i++) {
        const [diffType, diffText] = diffResultList[i];
        if (diffType === -1) {
          diffHtml += this.formatText(diffType, diffText);
          diffResultList.splice(i, 1);
          i--;
          len--;
          continue;
        }

        let formattedDiffText = diffText.replace(/@br@/g, '<br/>');
        if (formattedDiffText === text) {
          diffHtml += this.formatText(diffType, formattedDiffText);
          diffResultList.splice(i, 1);
          break;
        }

        if (formattedDiffText.length > text.length) {
          diffHtml += this.formatText(diffType, text);
          diffResultList[i][1] = formattedDiffText.substr(text.length);
          break;
        }

        if (text.length > formattedDiffText.length) {
          diffHtml += this.formatText(diffType, formattedDiffText);
          text = text.substr(formattedDiffText.length);
          diffResultList.splice(i, 1);
          i--;
          len--;
        }
      }

      if (!originalHtml || !diffResultList.length) break;
    }

    diffResultList.forEach(([diffType, diffText]) => {
      diffHtml += this.formatText(diffType, diffText);
    });

    return diffHtml + originalHtml.replace(/@br@/g, '<br/>');
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
      if (isOpeningTag && html.substr(index + 1, item.openTag.length) === item.openTag) {
        item.flag = true;
      } else if (item.flag && html.substring(index - item.closeTag.length, index) === item.closeTag) {
        item.flag = false;
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
        if (text) return { tag, text };
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
    if (diffText === '@br@') return '';
    diffText = diffText.replace(/@br@/g, '');
    if (diffType === 0) return diffText;
    const tag = diffType === -1 ? 'del' : 'ins';
    const color = diffType === -1 ? this.del_color : this.ins_color;
    return `<${tag} style="color:${color}">${diffText}</${tag}>`;
  }
}
