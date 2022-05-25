const express = require('express');
const router = express.Router();
const {knex} = require('../plugins/knex')
const assert = require('http-assert')
const { encrypt, decrypt } = require('../core/util/util')

const LOGIN_MAP = {
  'admin': 'adm_id',
  'teacher': 'tea_id',
  'student': 'stu_id'
}

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

/*post update */
router.post('/password', async (req, res, next) => {
  let {id,q,table} = req.body
  try {
    let result = await knex(table).where(LOGIN_MAP[table], id).select('pwd')
    let pwd = result[0].pwd

    assert.equal(q.pwd, decrypt(pwd), 422, '原密码错误')

    await knex(table).where(LOGIN_MAP[table], id).update('pwd',q.newPwd)
    res.send(200, {
      message: '修改成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/course_info', async (req, res, next) => {
  let { id, updateData } = req.body 
  try {
    let result = await knex('course_info').where('tea_id', id).select()
    if (result.length === 0) {
      await knex('course_info').insert({'tea_id':id})
    }
     await knex('course_info').where('tea_id', id).update(updateData)
    res.send(200, {
      message: '修改成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/topic', async (req, res, next) => {
  const { id, table, updateData } = req.body
  try {
    await knex(table).where('id',id).update(updateData)
    res.send(200, {
      message: '更新成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/tiku', async (req, res, next) => {
  const { id, table, updateData } = req.body
  console.log(updateData)
  try {
    await knex(table).where('id',id).update(updateData)
    res.send(200, {
      message: '更新成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/student_homework', async (req, res, next) => {
  const { q, time, updateData } = req.body

  try {
    await knex('student_homework').where(q).update(updateData)
    await knex('student_homework').where({hw_id:q.hw_id,stu_id:q.stu_id}).update('correct_time',time)
    res.send(200, {
      message: '更新成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/student_test', async (req, res, next) => {
  const { q, time, updateData } = req.body

  try {
    await knex('student_test').where(q).update(updateData)
    await knex('student_test').where({test_id:q.test_id,stu_id:q.stu_id}).update('correct_time',time)
    res.send(200, {
      message: '更新成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/:classify', async (req, res, next) => {
  let { classify } = req.params
  let { id, updateData } = req.body 
  if (classify === 'class') {
    delete updateData.name
  }
  if (classify === 'student') {
    delete updateData.cla_name
  }
  try {
     await knex(classify).where('id', id).update(updateData)
    res.send(200, {
      message: '修改成功',
    })
  } catch (err) {
    next(err)
  }
})



module.exports = router;