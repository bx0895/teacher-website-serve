const express = require('express');
const router = express.Router();
const {knex} = require('../plugins/knex')
const assert = require('http-assert')

/* POST  register*/

const REGISTER_MAP = {
  'admin': 'adm_id',
  'teacher': 'tea_id',
  'student': 'stu_id',
}

router.post('/:classify',async function (req, res, next) {
  let data = req.body.q
  let { classify } = req.params
  let idName = REGISTER_MAP[classify]
  let id = data[idName]
  let isClassify = classify in REGISTER_MAP
  assert(isClassify, 400, "请求错误")
  try {
    //查询是否已存在id
    let result = await knex(classify).where(idName, id).select()
    if (result.length !== 0) {
      assert(false,422,'该账户已存在')
    }

  //向数据库中插入数据
  await knex(classify).insert(data)
    res.send(200, {
      message: '注册成功'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router;