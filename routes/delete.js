const express = require('express');
const router = express.Router();
const {knex} = require('../plugins/knex')
const assert = require('http-assert')

const HOMEWORK_MAP = {
  '选择题': 'h_xuanzeti',
  '填空题': 'h_tiankongti',
  '简答题': 'h_jiandati',
  '编程题': 'h_bianchengti',
}
const TEST_MAP = {
  '选择题': 't_xuanzeti',
  '填空题': 't_tiankongti',
  '简答题': 't_jiandati',
  '编程题': 't_bianchengti',
}
/* 删除教师，删除对应外键引用值 */ 
router.post('/teacher', async (req, res, next) => {
  let { row } = req.body
  try {
    await knex('class').where('tea_id', row.tea_id).update('tea_id', null)
    await knex('teacher').where('id',row.id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/class', async (req, res, next) => {
  let { row } = req.body
  try {
    await knex('student').where('cla_id', row.cla_id).update('cla_id', null)
    await knex('class').where('id',row.cla_id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/topic', async (req, res, next) => {
  let { id,table } = req.body
  try {
    await knex(table).where('id',id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})


router.post('/question', async (req, res, next) => {
  let { id } = req.body
  try {
    await knex('reply').where('ques_id',id).delete()
    await knex('question').where('id',id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/homework', async (req, res, next) => {
  let { id } = req.body
  try {
    await knex('homework').where('id',id).delete()
    await knex('homework_topic').where('hw_id',id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/test', async (req, res, next) => {
  let { id } = req.body
  try {
    await knex('test').where('id',id).delete()
    await knex('test_topic').where('test_id',id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})


/* 删除 */ 
router.post('/:classify', async (req, res, next) => {
  let { classify } = req.params
  let { id } = req.body
  try {
    await knex(classify).where('id',id).delete()
    res.send(200, {
      message: '删除成功',
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router;