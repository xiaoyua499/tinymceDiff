import contextMenuImage from './plugin/contextMenuImage'
import handleBackspaceInList from './plugin/handleBackspaceInList'
import limitListNestingDepth from './plugin/limitListNestingDepth'
import imageZoom from './plugin/imageZoom'
const tinymceInit = {
  plugins: ["table", "lists", "image",'imageZoom'],
  toolbar: "table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol|bullist numlist|contextMenuImage",
  contextmenu: 'customInsertImage', 
  image_caption: true,
  images_upload_handler: function (blobInfo, success, failure) {
    // 将图片转换为Base64
    const reader = new FileReader();
    reader.readAsDataURL(blobInfo.blob());
    reader.onload = () => {
      success(reader.result); // 将Base64数据传递到成功回调中
    };
    reader.onerror = (error) => {
      failure('图片上传失败: ' + error);
    };
  },
  setup: function (editor) {
    // 自定义右键菜单项
    contextMenuImage(editor)
    //删除键删除列表项缩进
    handleBackspaceInList(editor)
    //限制列表的嵌套深度
    limitListNestingDepth(editor)
    //双击图片查看功能
    imageZoom()
  }
}

export default tinymceInit