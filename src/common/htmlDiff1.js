// 在一个名为 HtmlDiff2.js 的文件中保存以下代码

// 引入 diff_match_patch 库
import { diff_match_patch } from 'diff-match-patch'; // 请确保安装了相应的库

export default class HtmlDiff2 {
  constructor() {
    this.ignore_tag = [];
    this.Diff_Timeout = 0;
  }

  diff_launch(html1, html2) {
    var text1 = this.convertTextFromHtml(html1);
    var text2 = this.convertTextFromHtml(html2);

    var dmp = new diff_match_patch();
    dmp.Diff_Timeout = this.Diff_Timeout;
    var ms_start = (new Date).getTime();
    var diff = dmp.diff_main(text1, text2, true);
    var ms_end = (new Date).getTime();

    let time = ms_end - ms_start;

    let diffHtml = this.restoreToHtml(html2, diff)
    return { time, diffHtml }
  }

  restoreToHtml(originalHtml, diffResultList) {
    let diffHtml = ''
    while (true) {
      let { tag, text } = this.getOneTextFromHtml(originalHtml)
      diffHtml += tag
      originalHtml = originalHtml.substr(tag.length + text.length)
      for (let i = 0, len = diffResultList.length; i < len; i++) {
        let diffType = diffResultList[i][0]
        let diffText = diffResultList[i][1]
        if (diffType === -1) {
          diffHtml += this.formatText(diffType, diffText)
          diffResultList.splice(i, 1)
          i--
          len--
          continue
        }
        if (diffText === text) {
          diffHtml += this.formatText(diffType, diffText)
          diffResultList.splice(i, 1)
          break
        }
        if (diffText.length > text.length) {
          diffHtml += this.formatText(diffType, text)
          diffResultList[i][1] = diffText.substr(text.length)
          break
        }
        if (text.length > diffText.length) {
          diffHtml += this.formatText(diffType, diffText)
          text = text.substr(diffText.length)
          diffResultList.splice(i, 1)
          i--
          len--
        }
      }
      if (!originalHtml || !diffResultList || diffResultList.length <= 0) {
        break
      }
    }
    for (let i = 0, len = diffResultList.length; i < len; i++) {
      diffHtml += this.formatText(diffResultList[i][0], diffResultList[i][1])
    }
    return diffHtml + originalHtml
  }

  convertTextFromHtml(html) {
    let text = ''
    let tagFlag = false
    this.ignore_tag.map(item => {
      item.flag = false
    })
    for (let i = 0, len = html.length; i < len; i++) {
      if (!tagFlag && html[i] === '<') {
        tagFlag = true
        this.ignore_tag.map(item => {
          if (html.substr(i + 1, item.openTag.length) == item.openTag) {
            item.flag = true
          }
        })
      } else if (tagFlag && html[i] === '>') {
        tagFlag = false
        this.ignore_tag.map(item => {
          if (item.flag && html.substring(i - item.closeTag.length, i) == item.closeTag) {
            item.flag = false
          }
        })
        continue
      }
      let notDiffFlag = false
      this.ignore_tag.map(item => {
        if (item.flag) {
          notDiffFlag = true
        }
      })
      if (!tagFlag && !notDiffFlag) {
        text += html[i]
      }
    }
    return text
  }

  getOneTextFromHtml(html) {
    let tag = ''
    let text = ''
    let tagFlag = false
    this.ignore_tag.map(item => {
      item.flag = false
    })
    for (let i = 0, len = html.length; i < len; i++) {
      if (!tagFlag && html[i] === '<') {
        tagFlag = true
        if (text) {
          return { tag, text }
        }
        this.ignore_tag.map(item => {
          if (html.substr(i + 1, item.openTag.length) == item.openTag) {
            item.flag = true
          }
        })
      } else if (tagFlag && html[i] === '>') {
        tagFlag = false
        tag += html[i]
        this.ignore_tag.map(item => {
          if (item.flag && html.substring(i - item.closeTag.length, i) == item.closeTag) {
            item.flag = false
          }
        })
        continue
      }
      let notDiffFlag = false
      this.ignore_tag.map(item => {
        if (item.flag) {
          notDiffFlag = true
        }
      })
      if (!tagFlag && !notDiffFlag) {
        text += html[i]
      } else {
        tag += html[i]
      }
    }
    return { tag, text }
  }

  formatText(diffType, diffText) {
    if (diffType === 0) {
      return diffText
    } else if (diffType === -1) {
      return '<del style="background-color: red;">' + diffText + '</del>'
    } else {
      return '<ins style="background-color: green ;"> ' + diffText + '</ins>'
    }
  }
}
