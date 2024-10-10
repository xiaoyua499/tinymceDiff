export default function imageZoom() {
  tinymce.PluginManager.add('imageZoom', function (editor) {
    let modal, modalImg, zoomInButton, zoomOutButton, closeButton, zoomControls;
    let scale = 1; // 初始缩放比例

    // 创建模态框并添加到文档中
    const createModal = () => {
      modal = document.createElement('div');
      modal.style.display = 'flex'; // 显示模态框
      modal.style.position = 'fixed';
      modal.style.zIndex = '1000';
      modal.style.left = '0';
      modal.style.top = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      document.body.appendChild(modal);

      // 模态框中的图片
      modalImg = document.createElement('img');
      modalImg.style.maxWidth = '90%';
      modalImg.style.maxHeight = '90%';
      modalImg.style.transition = 'transform 0.3s ease';
      modal.appendChild(modalImg);

      // 控制放大缩小的按钮
      zoomControls = document.createElement('div');
      zoomControls.style.position = 'absolute';
      zoomControls.style.bottom = '20px';
      zoomControls.style.display = 'flex';
      zoomControls.style.justifyContent = 'center';
      zoomControls.style.width = '100%';

      zoomInButton = document.createElement('button');
      zoomInButton.innerText = '放大';

      zoomOutButton = document.createElement('button');
      zoomOutButton.innerText = '缩小';

      closeButton = document.createElement('button');
      closeButton.innerText = '关闭';

      zoomControls.appendChild(zoomInButton);
      zoomControls.appendChild(zoomOutButton);
      zoomControls.appendChild(closeButton);
      modal.appendChild(zoomControls);

      // 绑定事件
      addEventListeners();
    };

    // 事件绑定
    const addEventListeners = () => {
      // 放大图片
      zoomInButton.addEventListener('click', zoomInHandler);

      // 缩小图片
      zoomOutButton.addEventListener('click', zoomOutHandler);

      // 关闭模态框并销毁
      closeButton.addEventListener('click', destroyModal);

      // 点击模态框外部区域关闭并销毁
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          destroyModal();
        }
      });
    };

    // 放大处理
    const zoomInHandler = () => {
      scale += 0.1; // 增加缩放比例
      modalImg.style.transform = `scale(${scale})`;
    };

    // 缩小处理
    const zoomOutHandler = () => {
      if (scale > 0.1) {
        scale -= 0.1; // 减小缩放比例
        modalImg.style.transform = `scale(${scale})`;
      }
    };

    // 销毁模态框
    const destroyModal = () => {
      if (modal) {
        // 移除事件监听器
        zoomInButton.removeEventListener('click', zoomInHandler);
        zoomOutButton.removeEventListener('click', zoomOutHandler);
        closeButton.removeEventListener('click', destroyModal);
        modal.removeEventListener('click', destroyModal);

        // 从 DOM 中移除模态框
        modal.remove();
        modal = null;
      }
    };

    // 监听图片的双击事件
    editor.on('dblclick', function (e) {
      const target = e.target;
      if (target.nodeName === 'IMG') {
        if (!modal) {
          createModal(); // 双击时创建模态框
        }
        modalImg.src = target.src; // 设置模态框图片的来源
        scale = 1; // 每次打开时重置缩放比例
        modalImg.style.transform = `scale(${scale})`;
      }
    });

    // 当 TinyMCE 实例被销毁时，清理事件监听和 DOM 元素
    editor.on('remove', function () {
      destroyModal(); // 清除绑定的事件和 DOM
    });
  });
}