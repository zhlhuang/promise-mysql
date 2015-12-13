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
    this.SqlGroup=''
    this.Sqlorder=''
    this.Sqljoin=''
    this.SqlPage=''
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

mysqlBase.prototype.field = function(fields) {
    this.fields = fields;
    return this; //返回this之后，我们就可以用连贯操作
};

/**
 * add query sql where 
 * @param {Object} or {string } where 
 *  string='id = 26' or  {id:26}
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

/**
 * join  
 * @param join (sql)  eg: qc_xxx on qc_xxx.user_id=user.id
 * @return {Object} this 
 */

mysqlBase.prototype.join = function(join) {
    this.Sqljoin = " join " + join
    return this
}


mysqlBase.prototype.group = function(group) {
    this.SqlGroup = " GROUP  BY " + group
    return this
}
mysqlBase.prototype.order = function(order) {
    this.Sqlorder = " ORDER BY " + order
    return this
}


/**
 * page  
 * @param pagenow pagesize
 * @return {Object} this 
 */

mysqlBase.prototype.page = function(pagenow, pagesize) {
    pagenow = pagenow ? pagenow : 1;
    pagesize = pagesize ? pagesize : 10;
    this.SqlPage = " limit " + (pagenow - 1) * pagesize + "," + pagesize;
    return this;
}


/**
 * return format sql to query
 * @return {string}
 */

mysqlBase.prototype.getSql = function() {
	return this.sql + this.Sqljoin + this.sqlWhere + this.SqlGroup + this.Sqlorder + this.SqlPage;
};


/**
 * return select data by getSql  
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
 * select one row
 */
mysqlBase.prototype.find=promise.denodeify(function(callback){
    this.sql = 'select ' + this.fields + ' from ' + this.table;
	this.conn.connect();
	this.conn.query(this.getSql(), function(err, rows, field) {
		callback(err, rows[0]) //仅返回一条数据
	});
	this.conn.end();
})

/**
 * update 
 * @param {Object} data  the data we need update 
 *  eg: data={"sex":"m","age":18}
 */

mysqlBase.prototype.update = promise.denodeify(function(data, callback) {
	if (!data)
		return
	var Setsql = 'set ';
	for (var key in data) {
		Setsql += key + "='" + data[key] + "',"
	}
	Setsql = Setsql.substring(0, Setsql.length - 1) //remove last ','
	this.sql = "update " + this.table + " " + Setsql

// 	console.log(this.getSql());
	this.conn.connect()
	this.conn.query(this.getSql(), function(err, rows, field) {
		if (err)
			callback(err)
		else
			callback(err, rows["affectedRows"]) // return affectedRow
	})
	this.conn.end()
})

/**
 * INSERT data 
 * @param {Object} data   the data we need insert 
 *  eg :{username:"zhlhuang",pasword:"xxxxxx"}
 * return insertId is Primary key
 */

mysqlBase.prototype.add = promise.denodeify(function(data, callback) { //添加
	if (!data)
		return
	var keySql = ''
	var valueSql = ''
	for (var key in data) {
		keySql += ' `' + key + '`,'
		valueSql += "'" + data[key] + "',"
	}
	keySql = keySql.substring(0, keySql.length - 1) 
	valueSql = valueSql.substring(0, valueSql.length - 1) 
	var addSql = " (" + keySql + ") VALUES (" + valueSql + ") "  //concat String

	this.sql = "INSERT INTO " + this.table + addSql

	this.conn.connect()
	this.conn.query(this.sql, function(err, rows, field) {
		// console.log(rows)
		if (err)
			callback(err)
		else
			callback(err, rows["insertId"]) //返回插入的id
	})
	this.conn.end()

})

module.exports=mysqlBase;

