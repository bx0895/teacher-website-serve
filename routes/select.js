const express = require('express');
const router = express.Router();
const {knex} = require('../plugins/knex')
const assert = require('http-assert')
const { getTreeData } = require('../core/questionContral')

const SELECT_MAP = {
  'teacher': ['id','tea_id', 'name', 'phone', 'email'],
  'admin': ['id','adm_id', 'name'],
  'student': ['id', 'stu_id', 'name', 'phone', 'email', 'cla_id'],
  'class': ['id', 'cla_name', 'tea_id'],
  'notice': ['id', 'title', 'content', 'start_time', 'end_time', 'cla_id', 'tea_id'],
  'course_info': ['id', 'tea_id', 'course_intro', 'teacher_intro', 'before_course', 'course_plan', 'test_method', 'course_book'],
  'question': ['id', 'stu_id', 'question', 'time', 'name'],
  'forum': ['id','tea_id','title','start_time','end_time'],
  'h_xuanzeti': ['title', 'content', 'difficulty', 'knowledge', 'chapter', 'analysis', 'deleted', 'tea_id', 'answer'],
  't_xuanzeti': ['title', 'content', 'difficulty', 'knowledge', 'chapter', 'analysis', 'deleted', 'tea_id', 'answer'],
  'h_tiankongti': ['title', 'content', 'difficulty', 'knowledge', 'chapter', 'analysis', 'deleted', 'tea_id', 'answer'],
  't_tiankongti': ['title', 'content', 'difficulty', 'knowledge', 'chapter', 'analysis', 'deleted', 'tea_id', 'answer'],
  't_jiandati': ['title','content','difficulty','knowledge','chapter','analysis','deleted','tea_id','answer'],
}


/*post class info */
router.post('/class', async (req, res, next) => {
  let { q } = req.body
  try {
    let result
    if (q === undefined) {
      result = await knex('CLASS_TEACHER').select()
    } else {
      result = await knex('CLASS_TEACHER').where(q).select()
    }
    
    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/student', async (req, res, next) => {
  let { q } = req.body
  try {
    let result
    if (q === undefined) {
      result = await knex('STUDENT_INFO').select()
    } else {
      result = await knex('STUDENT_INFO').where(q).select()
    }

    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/tiku', async (req, res, next) => {
  let { q, table } = req.body
  if (table === 'homework') {
    table = ['h_xuanzeti', 'h_tiankongti', 'h_jiandati', 'h_bianchengti']
  } 
  if (table === 'test') {
    table = ['t_xuanzeti', 't_tiankongti', 't_jiandati', 't_bianchengti']
  } 
  try {
    let result,choice,filling,shortQues,programme
    if (q === undefined) {
      choice = await knex(table[0]).where('deleted', 0).select()
      filling = await knex(table[1]).where('deleted', 0).select()
      shortQues = await knex(table[2]).where('deleted', 0).select()
      programme = await knex(table[3]).where('deleted',0).select()
      // result = await knex(table).where('deleted',0).select()
    } else {
      choice = await knex(table[0]).where(q).select()
      filling = await knex(table[1]).where(q).select()
      shortQues = await knex(table[2]).where(q).select()
      programme = await knex(table[3]).where(q).select()
    }

    result = [choice, filling, shortQues, programme]

    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/question', async (req, res, next) => {
  let { q } = req.body
  try {
    let question, reply
    if (q === undefined) {
      question = await knex('question').select()
      reply = await knex('reply').select()
    } else {
      question = await knex('question').where(q).select()
      reply = await knex('reply').select()
    }
    let result = getTreeData(question,reply)
    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/homework', async (req, res, next) => {
  let { q } = req.body
  try {
    let result
    if (q === undefined) {
      result = await knex('homework').leftJoin('class_teacher', 'homework.cla_id', 'class_teacher.cla_id').select()

    } else {
      result = await knex('homework').leftJoin('class_teacher', 'homework.cla_id', 'class_teacher.cla_id').where(q).select()
    }
    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/test', async (req, res, next) => {
  let { q } = req.body
  try {
    let result
    if (q === undefined) {
      result = await knex('test').leftJoin('class_teacher', 'test.cla_id', 'class_teacher.cla_id').select()

    } else {
      result = await knex('test').leftJoin('class_teacher', 'test.cla_id', 'class_teacher.cla_id').where(q).select()
    }
    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/group/:classify', async (req, res, next) => {
  let { q } = req.body
  let { classify } = req.params
  try {
    let result,exam=[]
    let student = await knex('student').where('cla_id', q.cla_id).select('stu_id', 'name')

    if (classify === 'homework') {
      exam = await knex('stu_hw_count').where('hw_id', q.hw_id).select('stu_id', 'hw_id', 'submit_time', 'correct_time', 'total_point')      
    }
    if (classify === 'test') {
      exam = await knex('stu_test_count').where('test_id', q.test_id).select('stu_id', 'test_id', 'submit_time', 'correct_time', 'total_point')      
    }

    student.forEach(item => {
      item.submit_time = null
      item.correct_time = null
      item.total_point = null
      if (exam.length !== 0) {
      exam.forEach(ele => {
        if (item.stu_id === ele.stu_id) {
          item.submit_time = ele.submit_time
          item.correct_time = ele.correct_time
          item.total_point = ele.total_point
        }
      })        
      }
    })
    result = student
    
    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

//获取试卷和作业题目
router.post('/topic_detail', async (req, res, next) => {
  let { q, table } = req.body
  let column = []
  let topicTable

  if (table === 'homework') {
    topicTable = 'homework_topic'
    table = ['h_xuanzeti', 'h_tiankongti', 'h_jiandati', 'h_bianchengti']
    column = ['homework_topic.id', 'hw_id', 'topic_id', 'topic_type', 'score', 'title', 'content', 'answer']
    proColumn = ['homework_topic.id', 'hw_id', 'topic_id', 'topic_type', 'score', 'title', 'content', 'answer','submit']
  } 
  if (table === 'test') {
    topicTable = 'test_topic'
    table = ['t_xuanzeti', 't_tiankongti', 't_jiandati', 't_bianchengti']
    column = ['test_topic.id', 'test_id', 'topic_id', 'topic_type', 'score', 'title', 'content', 'answer']
    proColumn = ['test_topic.id', 'test_id', 'topic_id', 'topic_type', 'score', 'title', 'content', 'answer','submit']
  } 

  try {
    let result, choice, filling, shortQues, programme
    
    if (q === undefined) {
      //选择题
      choice = await knex(topicTable).innerJoin(table[0], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[0]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[0]}.type`)
      }).where(q).column(column)
      //填空题
      filling = await knex(topicTable).innerJoin(table[1], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[1]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[1]}.type`)
      }).where(q).column(column)
      //简答题
      shortQues = await knex(topicTable).innerJoin(table[2], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[2]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[2]}.type`)
      }).where(q).column(column)
      //编程题
      programme = await knex(topicTable).innerJoin(table[3], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[3]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[3]}.type`)
      }).where(q).column(proColumn)

    } else {
      //选择题
      choice = await knex(topicTable).innerJoin(table[0], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[0]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[0]}.type`)
      }).where(q).column(column)
      //填空题
      filling = await knex(topicTable).innerJoin(table[1], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[1]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[1]}.type`)
      }).where(q).column(column)
      //简答题
      shortQues = await knex(topicTable).innerJoin(table[2], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[2]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[2]}.type`)
      }).where(q).column(column)
      //编程题
      programme = await knex(topicTable).innerJoin(table[3], function() {
        this.on(`${topicTable}.topic_id`, '=', `${table[3]}.id`).andOn(`${topicTable}.topic_type`, '=', `${table[3]}.type`)
      }).where(q).column(proColumn)
    }
    result = [choice, filling, shortQues, programme]

    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/homeworkScore', async (req, res, next) => {
  let { q,table } = req.body
  try {
    let result
    if (q === undefined) {
      result = await knex(table).select().column(SELECT_MAP[classify])

    } else {
      result = await knex(classify).where(q).select().column(SELECT_MAP[classify])
    }

    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})


router.post('/:classify', async (req, res, next) => {
  let { classify } = req.params
  let { q } = req.body
  try {
    let result
    if (q === undefined) {
      result = await knex(classify).select().column(SELECT_MAP[classify])

    } else {
      result = await knex(classify).where(q).select().column(SELECT_MAP[classify])
    }

    res.send(200, {
      message: '查询成功',
      data: {
        result
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router;