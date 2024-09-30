export default function contextMenuImage(editor){
  editor.ui.registry.addMenuItem('customInsertImage', {
    text: '插入图片',
    icon: 'image',
    onAction: () => {
      // 创建隐藏的文件输入框
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*'); // 只允许选择图片

      // 监听文件选择事件
      input.onchange = function () {
        let file = this.files[0];
        let reader = new FileReader();

        reader.onload = function () {
          let base64 = reader.result;
          // 将图片插入到编辑器中
          editor.insertContent(`<img src="${base64}" alt="Image" />`);
        };

        // 读取文件为 Base64 格式
        if (file) {
          reader.readAsDataURL(file);
        }
      };

      // 触发文件选择框
      input.click();
    }

  });
}