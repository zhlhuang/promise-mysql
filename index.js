var promise = require("promise")
var mysql = require("mysql")
var util = require("util")

function mysqlBase(table){
    this.config={
            host:'127.0.0.1',
            user:'root',
            password:'root',
            database:'test',
            port:3306
        }
    // creat the connection for mysql
    this.conn=mysql.createConnection(this.config)
    this.sql = ''// sql for query 
    this.fields ='*' // the fields we need ,default is all
    this.table=table // table name
    
    this.sqlWhere=' ' // query where 
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
 * return format sql to query
 * @return {string}
 */


mysqlBase.prototype.getSql = function() {
	return this.sql +this.sqlWhere 
};


/**
 * select  data by sql  or this.sql
 * @param {string} sql 
 */

mysqlBase.prototype.select=promise.denodeify(function(callback){
    this.sql="select "+ this.fields+" from " + this.table
    // console.log(this.getSql())
    this.conn.connect()
    this.conn.query(this.getSql(),function(err,data){
        callback(err,data)
    })
    this.conn.end()
})


/**
 * add query sql where 
 * @param {Object} or {string } where 
 * if we can string='id = 26' or  {id:26}
 * @return {Object} this 
 */


mysqlBase.prototype.where = function(where) {
	this.sqlWhere = " WHERE 1"
	if (util.isObject(where)) { // isObject
		for (var key in where) {
			this.sqlWhere += " AND " + key + " = '" + where[key] + "'"
		}
	} else { //no Object 
		this.sqlWhere += " AND " + where
	}
	return this  // return this Object 
};


module.exports=mysqlBase;

