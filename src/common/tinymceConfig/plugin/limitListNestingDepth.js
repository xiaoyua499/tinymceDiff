/**
 * 限制列表的嵌套深度
 * @param {*} editor 
 * @param {Number} maxDepth 最大层级,默认为3层
 */
export default function limitListNestingDepth(editor, maxDepth=3) {
  editor.on('NodeChange', (e) => {
    // 计算列表嵌套深度的函数
    function getListDepth(list) {
      let depth = 0;
      while (list && (list.tagName === 'OL' || list.tagName === 'UL')) {
        list = list.parentElement.closest('ol, ul'); // 找到上一级的父列表
        depth++;
      }
      return depth;
    }
    const list = e.element.closest('ol, ul'); // 找到最近的列表元素
    // console.log(list);

    if (list) {
      const depth = getListDepth(list);

      // 如果嵌套深度超过设定值，取消进一步的嵌套
      if (depth > maxDepth) {
        editor.execCommand('Outdent');
      }
    }
  });
}