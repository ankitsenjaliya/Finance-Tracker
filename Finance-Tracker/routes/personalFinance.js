let express = require("express"),
router = express.Router(),
middlewareObj = require("../middleware/index"),
pfMiddlewareObj = require("../middleware/personalFinance")

router.get('/pf/home',pfMiddlewareObj.home)
router.get('/pf/expense',pfMiddlewareObj.newExpense)
router.get('/pf/income',pfMiddlewareObj.newIncome)
router.post('/pf/expense',pfMiddlewareObj.postNewExpense)
router.post('/pf/income',pfMiddlewareObj.postNewIncome)

module.exports = router;