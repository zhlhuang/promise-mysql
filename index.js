var promise = require("promise")
var mysql = require("mysql")

function mysqlBase(){
    this.config={
            host:'127.0.0.1',
            user:'root',
            password:'root',
            database:'test',
            port:3306
        }
    // creat the connection for mysql
    this.conn=mysql.createConnection(this.config)
}

/**
 * set the config for mysql 
 * @param {Object} config
 */

mysqlBase.prototype.configure =function(config){
    this.config=config
    // change the mysql connect
    this.conn=mysql.createConnection(this.config)
}


/**
 * select  data by sql  or this.sql
 * @param {string} sql 
 */

mysqlBase.prototype.select=promise.denodeify(function(sql,callback){
    this.conn.connect()
    this.conn.query(sql,function(err,data){
        callback(err,data)
    })
    this.conn.end()
})

module.exports=mysqlBase;

