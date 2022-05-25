const express = require('express');
const { getPublicKey } = require('../core/rsaControl')
const router = express.Router();

/*GET key */
router.get('/', async function (req, res, next) {
  try {
    let result = await getPublicKey()
    res.json(200, {
      message: '查询成功',
      data:{
        key: result
      }
  })
  } catch (err) {
    next(err)
  }

});

module.exports = router;
