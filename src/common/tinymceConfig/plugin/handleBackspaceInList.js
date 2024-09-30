export default function handleBackspaceInList(editor) {
  editor.on('keydown', function (event) {
    if (event.key === 'Backspace') {
      const selectedNode = editor.selection.getNode(); // 获取当前选中的节点

      // 确认当前选中的节点是一个列表项
      if (selectedNode.nodeName === 'LI') {
        const range = editor.selection.getRng(); // 获取当前光标的范围
        const startOffset = range.startOffset; // 获取光标在节点中的起始位置
        // 判断光标是否在文本的开头
        if (startOffset === 0) {
          event.preventDefault();
          // console.log(123);

          editor.execCommand('Outdent');
          // 阻止默认删除行为
        } else {
          console.log('删除列表项中的文本内容');
          // 在列表项中间或末尾，执行默认删除行为
        }
      }
    }
  });
}