const express = require('express');
const router = express.Router();
const {sendToken} = require('../core/sendToken')
const {knex} = require('../plugins/knex')
const assert = require('http-assert')
const { encrypt, decrypt } = require('../core/util/util')
/* POST  register*/

const LOGIN_MAP = {
  'admin': 'adm_id',
  'teacher': 'tea_id',
  'student': 'stu_id'
}

router.post('/', async function (req, res, next) {
  let data = req.body
  let { loginType, userId, pwd } = data
  let idName = LOGIN_MAP[loginType]
  try {
    if (!userId || userId === '')
      assert(false, 422, '账号不能为空')
      if (!pwd || pwd === '')
      assert(false, 422, '密码不能为空')
    let result = await knex(loginType).where(idName, userId).select()
    if (result.length === 0) {
      assert(false, 422, '该账户不存在，请先注册')
    }
    let id = result[0][idName]
    let password = result[0]['pwd']
    //验证密码 
    assert.equal(pwd,decrypt(password), 422, '用户密码错误')
    //签发token
    let token = await sendToken(id)
    res.send(200, {
      message: '登录成功',
      data: {
        userId: id,
        token: token
      }
    })
  } catch (err) {
    next(err)
  }

})

module.exports = router;