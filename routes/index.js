var express = require('express');
var router = express.Router();
var User = require('../models/user')
const fs = require("fs");
var UploadPDF = require('../models/UploadPDF');
const { compile } = require('ejs');
const { append, header } = require('express/lib/response');

var enroled,resource_count;
router.get('/', function (req, res, next) {
	User.findOne({},function(err,data){
		if (data) {
			enroled=data.unique_id;
		} else {
			enroled=0;
		}
	}).sort({_id: -1}).limit(1);
	UploadPDF.findOne({},function(err,data){
		if (data) {
			resource_count=data.resource_id;
			console.log(resource_count);
		} else {
			resource_count=0;
		}
	}).sort({_id: -1}).limit(1);
	return res.render('index.ejs', {"enroled":enroled,"resource_count":resource_count});
});

router.get('/registration', function (req, res, next) {
	return res.render('registration.ejs');
});

router.post('/registration', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.phone || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({phone:personInfo.phone},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							phone:personInfo.phone,
							username: personInfo.username,
							school: personInfo.school,
							class: personInfo.class,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.redirect("/login");
				}else{
					res.send({"Success":"phone is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({phone:req.body.phone},function(err,data){
		if(data){
			// if(data.admin)
			// 	// role=true;
			// else
				// role=false;
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				// 
				res.redirect('/profile');
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This phone Is not regestered!"});
		}
	});
});

var admin;
// code here 
const ITEMS_PER_PAGE_ADMIN = 10;
router.get('/profile', function(req, res, next) {

	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			admin=data;
		}
	});

    const page_admin = +req.query.page || 1;
	let totalItems_admin;
    User.find()
	.countDocuments()
	.then(numberOfResources => {
		totalItems_admin = numberOfResources;
		return User.find()
						.skip((page_admin-1)*ITEMS_PER_PAGE_ADMIN)
						.limit(ITEMS_PER_PAGE_ADMIN);
	}).then(clients => {
		res.render('data.ejs', {
			"name":admin.username,"phone":admin.phone,"standard":admin.class,"school":admin.school,"role":admin.unique_id,
			clients: clients,
			currentPage: page_admin,
			hasNextPage: (ITEMS_PER_PAGE_ADMIN*page_admin)<totalItems_admin,
			hasPreviousPage: page_admin>1,
			nextPage: page_admin + 1,
			previousPage: page_admin - 1,
			lastPage: Math.ceil(totalItems_admin/ITEMS_PER_PAGE_ADMIN)
		});
	}).catch(err => {
		console.log(err);
	});
})

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});


const ITEMS_PER_PAGE = 10;
router.get('/resources', function(req, res, next) {
    const page = +req.query.page || 1;
	let totalItems;
    UploadPDF.find().countDocuments().then(numberOfResources => {
		totalItems = numberOfResources;
		return UploadPDF.find().skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
	})
	.then(resources => {
		if(req.session.userId)
		{
			res.render('resources.ejs', {
				resources: resources,
				currentPage: page,
				hasNextPage: (ITEMS_PER_PAGE*page)<totalItems,
				hasPreviousPage: page>1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
			});
		}else{
			res.send("You must be signed in to view resources");
		}
		
	}).catch(err => {
		console.log(err);
	})
})

router.get('/admin', function (req, res, next) {
	UploadPDF.find({}, (err,items) => {
		if(err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			if(req.session.userId==1)
				res.render('admin.ejs',{ items: items });
			else
				res.send("You must be admin to visit this page.")
			
		}
	})
});

router.post("/uploadPdf",(req,res,next)=>{
	UploadPDF.findOne({},function(err,data){
		if (data) {
			temp = data.resource_id + 1;
		} else {
			temp=1;
		}
		console.log("Count is "+ temp)
		var obj = {
			resource_id: temp,
			name: req.body.name,
			desc: req.body.desc,
			standard: req.body.standard,
			url: req.body.url,
		}
		UploadPDF.create(obj,function(err,result){
			if(err){
				console.log(err);
			}else{
				console.log("Saved To database");
				res.redirect('/admin');
			}
		});
	}).sort({_id: -1}).limit(1);;
  })

module.exports = router;