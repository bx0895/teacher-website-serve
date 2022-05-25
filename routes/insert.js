const express = require('express');
const router = express.Router();
const {knex} = require('../plugins/knex')
const assert = require('http-assert')

const INSERT_MAP = {
  't_xuanzeti': 'answer',
  'h_xuanzeti': 'answer',
  't_tiankongti': 'answer',
  'h_tiankongyi':'answer'
}

/*post insert */
router.post('/homework', async (req, res, next) => {
  let { q } = req.body 
  try {
    await knex('homework').insert(q)
    let result = await knex('homework').where(q).select('id')
    res.send(200, {
      message: '插入成功',
      data: { result }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/test', async (req, res, next) => {
  let { q } = req.body 
  try {
    await knex('test').insert(q)
    let result = await knex('test').where(q).select('id')
    res.send(200, {
      message: '插入成功',
      data: { result }
    })
  } catch (err) {
    next(err)
  }
})


router.post('/student_test', async (req, res, next) => {
  let { q, condition } = req.body 
  try {
    let result = await knex('student_test').where(condition).select()
    if (result.length !== 0) {
      q.forEach( async item => {
        await knex('student_test').where({test_id:item.test_id,stu_id:item.stu_id,test_topic_id:item.test_topic_id}).update(item) 
      });
    } else {
     await knex('student_test').insert(q) 
    }
    res.send(200, {
      message: '插入成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/student_homework', async (req, res, next) => {
  let { q, condition } = req.body 
  try {
    let result = await knex('student_homework').where(condition).select()
    if (result.length !== 0) {
      q.forEach(async item => {
        let result = await knex('homework_topic_detail').where({ id: item.hw_topic_id }).column(['topic_type','score', 'answer'])
        let type = result[0].topic_type
        let answer = result[0].answer
        let score = result[0].score
        //自动批改
        if (type === '选择题' || type === '填空题') {
          answer = JSON.parse(answer)
          for (let key in answer) {
            if (item.answer === answer[key]) {
              item.score = score
            }
          }
        }
        
        await knex('student_homework').where({hw_id:item.hw_id,stu_id:item.stu_id,hw_topic_id:item.hw_topic_id}).update(item) 
      });
    } else {
     await knex('student_homework').insert(q) 
    }
    
    res.send(200, {
      message: '插入成功',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/:classify', async (req, res, next) => {
  let { classify } = req.params
  let { q } = req.body 

  try {
     await knex(classify).insert(q)
    res.send(200, {
      message: '插入成功',
    })
  } catch (err) {
    next(err)
  }
})


module.exports = router;