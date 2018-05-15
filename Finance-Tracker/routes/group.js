let express = require("express"),
router = express.Router(),
middlewareObj = require("../middleware/index"),
groupMiddleware = require("../middleware/group");


router.get("/group/new",groupMiddleware.getNewGroup)
router.post("/newGroup",groupMiddleware.createGroup)
router.get("/group/:id/addMember",groupMiddleware.addNewMember)
router.post("/group/:id/newMember",groupMiddleware.postMember)
router.get("/group/index",groupMiddleware.getAllGroups)
router.get("/group/:id/newbill",groupMiddleware.newbill)
router.post("/group/:id/bill",groupMiddleware.postbill)
router.get("/group/getbalance",groupMiddleware.getBalance)
router.get("/group/:id",groupMiddleware.findGroup)
// router.get("/group/payback",groupMiddleware.getPayback)
// router.post("/group/payback",groupMiddleware.payback)

module.exports = router;