import React, { useRef,useImperativeHandle, useState } from 'react';

const Comprosser=()=> {
    const [wid,setWid] = useState("300")
    const [hei,setHei] = useState("300")
    const refContainer = useRef(null);
    const refCanvas = useRef(null);
    const handleChange = e => {
        e.persist() // 为了看到原生file的内容，不加这句，原生file内容会被react隐藏
        //  = [0]
        const fileLists  = refContainer.current.value
        for(let key in e.target.files){
            // console.log(e)
            console.log(e.target.files[key])
        
            // 设定标准上限为1MB，进行压缩处理
            compress(e.target.files[key], 10, (data) => {
              console.log(data)
            })

        }
      }
    
      // 异步读取图片的promise
      const loadImageAsync = (url) => {
        return new Promise(function (resolve, reject) {
          const image = new Image()
    
          image.onload = function () {
            resolve(image)
          };
    
          image.onerror = function () {
            reject(new Error('Could not load image at ' + url))
          };
    
          image.src = url
        })
      }
    
      // 异步转换成base64编码的promise
      const fileToImgAsync = (file) => {
        return new Promise(function (resolve, reject) {
          const reader = new FileReader()
    
          reader.onload = function (e) {
            resolve(e.target.result);
          };
    
          reader.onerror = function () {
            reject(new Error('readAsDataURL:fail'))
          };
    
          reader.readAsDataURL(file)
        });
      }
    
      const downloadFileByBlob = (blobUrl, filename) => {
     
        const a = document.createElement('a')
        a.download = filename
        a.style.display = 'none'
        a.href = blobUrl
        // 触发点击
        document.body.appendChild(a)
        a.click()
        // 然后移除
        document.body.removeChild(a)
      }
    
      // async 搭配 promise 使用
      const compress = async (file, maxSizeKB, succFunc) => {

        if (file.size > maxSizeKB * 1024) {
          let rate = 0 // 压缩率
    
          // 文件转图片
          const dataUrl = await fileToImgAsync(file)
    
          // 图片转画布
          const image = await loadImageAsync(dataUrl)
          // console.log(dataUrl, image)
    
          // 文件大小KB, file.size给的是字节Byte
          const fileSizeKB = file.size / 1024
          console.log(fileSizeKB)
    
          // 当图片大小超标，才进行压缩
          if (fileSizeKB > maxSizeKB) {
            // 计算压缩率
            rate = (fileSizeKB - maxSizeKB) / fileSizeKB
            console.log('压缩率：', rate)
            console.log('压缩后文件大小：', fileSizeKB * (1 - rate), 'kb')
          }
    
          // 纠正因子,不加会导致压缩出的文件太小
          const factor = 0.2
    
          // 画布执行压缩
          let canvas = document.createElement('canvas')
          let context = canvas.getContext('2d')
          const cvWidth = image.width * (1 - rate + factor)
          const cvHeight = image.height * (1 - rate + factor)
          console.log(image.width, image.height, cvWidth, cvHeight)
    
          canvas.height = cvHeight
          canvas.width = cvWidth
          context.clearRect(0, 0, cvWidth, cvHeight)
          context.drawImage(image, 0, 0, cvWidth, cvWidth)
    
          // 导出图片
          canvas.toBlob((blob) => {
    
            // 方式一：下载到本地
            const blobUrl = window.URL.createObjectURL(blob)
            downloadFileByBlob(blobUrl, file.name)
    
            // 方式二：生成网页可读取的对象
            // const newImage = new File([blob], file.name, { type: file.type });
            // succFunc(newImage)
          });
        }
      }
    // 需求设想：默认宽高，可设置宽高，可文件夹压缩
  return (
    <div>
        <canvas id="canvas" ref={refCanvas} width={wid} height={hei}></canvas>
      <input type="file" 
      id="input"
      ref={refContainer} 
      onChange={handleChange} multiple webkitdirectory="true"/>
    </div>
  );
}

export default Comprosser;
