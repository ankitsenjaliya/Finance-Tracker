let mysql = require('mysql');
let pfMiddleware = {}

let c = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    database: 'projectSoftEng'
});

c.connect();

// Show balance here
pfMiddleware.home = (req, res) => {
    let user = req.user.ID    
    c.query('SELECT *,DATE_FORMAT(createdAt,"%Y-%m-%d") AS date FROM TRANSACTIONS WHERE userId=? ORDER BY createdAt DESC', [user], function (err, transactions) {
        if (err) {
            console.log(err)
        } else {
            let balance = 0
            let expense = 0
            let income = 0
            // let tLength = transactions.length > 5 ? 5 : transactions.length
            // let creditLength = 0
            // let debitLength = 0
            transactions.forEach(function (transaction) {
                let credit = transaction.credit ? parseFloat(transaction.credit) : 0
                let debit = transaction.debit ? parseFloat(transaction.debit) : 0
                balance = balance + credit - debit
                expense = expense + debit
                income = income + credit
            })
            res.render("personalFinance/home.ejs", {
                transactions: transactions,
                date: transactions.createdAt,
                balance: balance.toFixed(2),
                income: income.toFixed(2),
                expense: expense.toFixed(2),
                curr_user : req.user,
                groups: req.groups
            })
            // res.render("personalFinance/index.ejs",{transactions:transactions,balance:balance})
        }
    })
}

pfMiddleware.newExpense = (req, res) => {
    res.render('personalFinance/newExpense')
}

pfMiddleware.newIncome = (req, res) => {
    res.render('personalFinance/newIncome')
}

pfMiddleware.postNewExpense = (req, res) => {
    let user = req.user.ID
    
    let name = req.body.name
    let desc = req.body.description
    let debit = req.body.debit
    let category = req.body.category

    c.query("INSERT INTO TRANSACTIONS(NAME,userId,DEBIT,category) VALUES(?,?,?,?)", [name, user, parseFloat(debit),category], function (err, newTransaction) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/pf/home")
        }
    })
}



pfMiddleware.postNewIncome = (req, res) => {
    let user = req.user.ID
    let name = req.body.name
    let desc = req.body.description
    let credit = req.body.credit

    c.query("INSERT INTO TRANSACTIONS(NAME,userId,CREDIT) VALUES(?,?,?)", [name, user, parseFloat(credit)], function (err, newTransaction) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/pf/home")

        }
    })
}
module.exports = pfMiddleware;