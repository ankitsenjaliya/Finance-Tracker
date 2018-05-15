let mysql = require('mysql');
let groupMiddleware = {}
console.log("groupMiddleware")

let c = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    database: 'projectSoftEng'
});

c.connect();

// Get new group page
groupMiddleware.getNewGroup = (req, res) => {
    if (req.isAuthenticated()) {
        res.render('group/new')
    } else {
        console.log("not logged in")
    }
};


// Post new group
groupMiddleware.createGroup = (req, res) => {

    c.query('INSERT INTO groups(name,description,createdByUser) VALUES(?,?,?)', [req.body.name, req.body.description, req.user.ID], function (err, newGroup) {
        if (err) {
            console.log(err)
        } else {
            c.query('INSERT INTO groupMembers(groupId,userId) values(?,?)', [newGroup.insertId, req.user.ID], function (err, newMembers) {
                if (err) {
                    console.log(err)
                } else {
res.redirect("/pf/home")
                    console.log(newMembers)
                }
            })
        }
    })
}

// Add new members get page
groupMiddleware.addNewMember = (req, res) => {
    res.render('group/addMember', {
        groupId: req.params.id
    })
}

groupMiddleware.postMember = (req, res) => {
    console.log(req.params.id)
    let groupId = req.params.id
    let email = req.body.email
    c.query("SELECT ID FROM user WHERE email=?", [email], function (err, newUserId) {
        c.query("INSERT INTO groupMembers(groupId,userId) VALUES(?,?)", [groupId, newUserId[0].ID], function (err, newMember) {
            if (err) {
                console.log(err)
            } else {
                res.redirect('back')
            }
        })
    })
}

groupMiddleware.getAllGroups = (req, res) => {
    // Get list of all groups by  
    let user = req.user.ID
    c.query("SELECT * FROM GROUPMEMBERS LEFT JOIN GROUPS ON GROUPMEMBERS.GROUPID = GROUPS.ID WHERE userId = ?", [user],
        function (err, foundGroups) {
            if (err) {
                console.log(err)
            } else {
                res.render("group/index", {
                    groups: foundGroups
                })
            }
        })
}

// Add new bill
groupMiddleware.newbill = (req, res) => {
    // :id is groupId
    res.render("group/newbill", {
        groupId: req.params.id
    })
}

// Post new Bill
groupMiddleware.postbill = (req, res) => {
    let name = req.body.name
    let paidBy = req.user.ID
    let amount = req.body.amount
    let user = req.user.ID
    let groupId = req.params.id
    // insert new bill
    c.query("INSERT INTO BILL (name,paidByUserId,amount,groupId) VALUES(?,?,?,?)", [name, paidBy, amount, groupId], function (err, newBill) {
        if (err) {
            console.log(err)
        } else {
            console.log(newBill)

            // Find other group members 
            c.query("SELECT userId from groupMembers where groupId=?", [groupId], function (err, members) {
                let totalMembers = members.length
                let splitAmount = parseFloat(amount / totalMembers)
                members.forEach(function (member) {
                    if (member.userId != user) {
                        console.log("memberss" + member.userId)
                        c.query("INSERT INTO oweToUser(userId,oweToUserId,billId,amount) values(?,?,?,?)", [user, member.userId, newBill.insertId, splitAmount], function (err, newOwedAmount) {
                            if (err) {
                                console.log(err)
                            }
                        })
                    }
                })
                res.redirect("back")
            })
        }
    })
}

groupMiddleware.getBalance = (req, res) => {
    console.log("getting balance")
    let user = req.user.ID
    c.query("select * from oweToUser where oweToUserId=?", [user], function (err, owestoUsers) {
        if (err) {
            console.log(err)
        } else {
            let owestouserArray = []
            owestoUsers.forEach((owesto) => {
                let doesExists = false
                owestouserArray.forEach((owestoObj) => {
                    if (owestoObj.userId == owesto.userId) {
                        doesExists = true
                        owestoObj.amount += owesto.amount
                    }
                })
                if(doesExists == false){
                    let owestoObj = {}
                    owestoObj.userId = owesto.userId
                    owestoObj.amount = owesto.amount
                    owestouserArray.push(owestoObj)
                }
            })
            res.send(owestouserArray)
        }
    })
}
groupMiddleware.findGroup = (req,res) => {
    let groupId = req.params.id
    let userId = req.user.ID
    c.query("select * from groupMembers left join groups on groups.ID = groupMembers.groupId join user on groupMembers.userId = user.ID where groupId=?",[groupId],(err,foundGroupMembers)=>{
        c.query('select *,DATE_FORMAT(createdAt,"%Y-%m-%d") AS date from BILL left join user on BILL.paidByUserId = user.ID where groupId = ?  ORDER BY createdAt DESC',[groupId],(err,foundBill)=>{
            if(err){
                console.log(err)
            }else{
                c.query("select * from oweToUser left join user on oweToUser.userId=user.ID where oweToUserId=?", [userId], function (err, owestoUsers) {
                    if (err) {
                        console.log(err)
                    } else {
                        let owestouserArray = []
                        owestoUsers.forEach((owesto) => {
                            let doesExists = false
                            owestouserArray.forEach((owestoObj) => {
                                if (owestoObj.userId == owesto.userId) {
                                    doesExists = true
                                    owestoObj.amount += owesto.amount
                                }
                            })
                            if(doesExists == false){
                                let owestoObj = {}
                                owestoObj.userId = owesto.userId
                                owestoObj.amount = owesto.amount
                                owestoObj.name = owesto.nickname
                                owestouserArray.push(owestoObj)
                            }
                        })
                        res.render("group/index",{
                            groups : req.groups,
                            groupMembers : foundGroupMembers,
                            bills : foundBill,
                            groupId: groupId,
                            owestoArr : owestouserArray
                        })
                    }
                })
                
            }
        })
    })
}
groupMiddleware.getGroupsHome = (req, res, next) => {
    if (req.user) {
        // Get all group members and store them in request
        // let user = 2     
        let user = req.user.ID
        c.query("SELECT * FROM groupMembers LEFT JOIN groups ON groupMembers.groupId = groups.ID WHERE userId = ?", [user],
            function (err, foundGroups) {
if(err){
console.log(err)
}
                    req.groups = foundGroups
                    next()
            })

    } else {
        next()
    }
}
module.exports = groupMiddleware
