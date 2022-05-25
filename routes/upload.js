const express = require('express')
const router = express.Router()
const assert = require('http-assert')
const multer = require('Multer')
const {
  uploadPath,
  uploadURL,
  maxFileSize
} = require('../config')
const path = require('path')
const fs = require('fs')
const {
  knex
} = require('../plugins/knex')

const FILE_TYPE = {
  'images': 'images',
  'courseware': 'courseware',
  'homework': 'homework',
  'test':'test'
}

const storage = multer.diskStorage({
  destination (req, res, cb) {
    //获取文件类型
    let fileType = FILE_TYPE[req.params['classify'].trim()] ?? 'other'
    let {uid} = req.body
    let filePath
    if (uid) {
      //文件夹名字拼接上教师编号，给每个教师单独创建一个文件存放上传资源
      filePath = path.join(uploadPath, fileType, uid)
    }
    filePath = path.join(uploadPath, fileType)
    //文件路径存在则进入路径，否则创建
    fs.existsSync(filePath) || fs.mkdirSync(filePath)
    cb(null, filePath)
  },
  filename(req, file, cb) {
    const {ext,base,name} = path.parse(file.originalname)
    cb(null, name + ext)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize
  }
})

router.post('/:classify', upload.any(), async (req, res, next) => {
  try {
    let fileType = FILE_TYPE[req.params['classify'].trim()] ?? ''
    assert(fileType, 400, '文件上传分类不正确')
    let {uid} = req.body
    let fileURLs = req.files.map(item => {
      let { destination,filename} = item
      if (fileType === 'courseware') {
        let data = {
          name: filename,
          path: path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://'),
          tea_id: uid || ''
        }
        return data
      }
      if (fileType === 'homework' || fileType === 'test') {
        let data = {
          answer: filename,
          file: path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://'),
        }
        return data
      }
      return path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://')
    })
    //存储课件信息
    if (fileType === 'courseware') {
      await knex(fileType).insert(fileURLs)
    }
    //存储作业或者考试文件信息
    if (fileType === 'homework' || fileType === 'test') {
      await knex(`student_${fileType}`).where(req.body).update(fileURLs[0])
    }
    let resultData = {
      message: '上传成功',
      data: {
        fileURL: fileURLs
      }
    }
    if (fileType === 'images') {
      let data = fileURLs
      resultData = {
        "errno": 0,
        data
      }
    }
    res.send(200, resultData)
  } catch (err) {
    next(err)
  }
})

module.exports = router