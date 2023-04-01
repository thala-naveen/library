var express = require('express');
const upload = require('./multer');
const pool = require('./pool');
var router = express.Router();
var fs=require('fs')
const csv = require("fast-csv");
var session = require('express-session');
const { render } = require('ejs');
const nodemailer = require("nodemailer");
var aes256 = require('aes256');
const logger = require("./logger");
const e = require('express');

router.get('/delete_admin',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('delete from library.admin where adminemail=?',[req.query.adminemail],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                req.session.adminmsg="server error"
                res.redirect('/admin/showaddadmin')
              
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} deleted admin ${req.query.adminemail}`)
                req.session.adminmsg="admin deleted"
                res.redirect('/admin/showaddadmin')
            }
        })
    }
    else
        res.redirect('/')
})

router.post('/add_admin',function(req,res){
    if(req.session.adminemail)
    {
        var key = "secret key"
        var encryptedpass = aes256.encrypt(key, req.body.password);
        pool.query('insert into library.admin(adminemail,adminpassword) values(?,?)',[req.body.adminemail,encryptedpass],function(error,result){
            if(error)
            {
                if(error.toString().includes('Duplicate'))
                    req.session.adminmsg="admin already exist"
                else
                    req.session.adminmsg="server error"

                    res.redirect('/admin/showaddadmin')
            }
            else
            {
                req.session.adminmsg='admin added'
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added admin ${req.body.adminemail}`)
                res.redirect('/admin/showaddadmin')
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/showaddadmin',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.admin',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered addadmins page`)
                res.render('addadmins',{adminemail:req.session.adminemail,msg:req.session.adminmsg,admindata:result})
            }
        })
    }
    else    
        res.redirect('/')
})

router.get('/get_remarked_students',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select count(*) as remarkedstudents from library.userdetails where remark is not null',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/get_total_Notice',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select count(*) as totalnotice from library.notice',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/get_total_lostbooks',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select sum(loststatus) as lostbooks FROM library.books where loststatus>=1',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else    
        res.redirect('/')
})


router.get('/get_total_professors',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select count(*) as totalprofessors from library.userdetails where role="staff"',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else    
        res.redirect('/')
})

router.get('/get_total_students',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select count(*) as totalstudents from library.userdetails where role="student"',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else    
        res.redirect('/')
})

router.get('/get_issued_books',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select count(barcode) as issuedbooks from library.issue',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else    
        res.redirect('/')
})

router.get('/get_total_books',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select count(barcode) as totalbooks from library.books',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
                res.status(200).json(result)
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/delete_branch',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('delete from library.branch where branchid=?',[req.query.branchid],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                req.session.msg="error"
                res.redirect('/admin/showaddbranch')
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} deleted branch of branchid${req.query.branchid}`)
                req.session.msg="branch deleted"
                res.redirect('/admin/showaddbranch')
            }
        })
    }
    else
        res.redirect('/')
})

router.post('/add_branch',function(req,res){
    if(req.session.adminemail)
    {
        var arr = req.body.course.split('#');
        var course = arr[0]
        pool.query('insert into library.branch(courseid,branchname,branchcode) values(?,?,?)',[course,req.body.branch,req.body.branchcode],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                req.session.msg='server error'
                res.redirect('/admin/showaddbranch')
            }
            else
            {
                req.session.msg="branch added"
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added branch ${req.body.branch}`)
                res.redirect('/admin/showaddbranch')
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/getcourse',function(req,res){
    if(req.session.adminemail)
    {
      pool.query('select * from library.course',function(error,result){
        if(error)
        {
          res.status(500).json([])
        }
        else
        {
          res.status(200).json(result)
        }
      })  
    }
    else
    {
      res.redirect('/')
    }
  })

router.get('/showaddbranch',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.branch',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                req.session.msg='server error'
                res.render('addbranch',{msg:req.session.msg,adminemail:req.session.adminemail})
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered showaddbranch page`)
                res.render('addbranch',{msg:req.session.msg,branchdata:result,adminemail:req.session.adminemail})
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/delete_course',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('delete from library.course where courseid=?',[req.query.courseid],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                req.session.msg="server error"
                res.redirect('/admin/showaddprogram')
            }
            else
            {
                req.session.msg='course deleted'
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} deleted course of courseid ${req.query.courseid}`)
                res.redirect('/admin/showaddprogram')
            }
        })
    }
    else
        res.redirect('/')
})



router.post('/add_program',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('insert into library.course(coursename) values(?)',[req.body.program.trim()],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
            }
            else
            {
                req.session.msg='course added'
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added program/course ${req.body.program}`)
                res.redirect('/admin/showaddprogram')
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/showaddprogram',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.course',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                req.session.msg='server error'
                res.render('addprogram',{programdata:'',msg:req.session.msg,adminemail:req.session.adminemail})
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered showaddprogram`)
                res.render('addprogram',{programdata:result,msg:req.session.msg,adminemail:req.session.adminemail})
            }
        })
    }
    else
        res.redirect('/')
})

router.post('/add_book_file',upload.single('file'),function(req,res){
    if(req.session.adminemail)
    {
        pool.query('update library.files set filename=? where fileid=3',[req.file.originalname],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.redirect('/admin/showaddbooks')
            }
            else
            {
                req.session.filename= req.file.originalname
                UploadCsvDataToMySQL("public/files/"+req.file.originalname);

                function UploadCsvDataToMySQL(filePath) {
                let stream = fs.createReadStream(filePath);
                let csvData = [];
                let csvStream = csv
                .parse()
                .on("data", function (data) {
                csvData.push(data);
                })
                .on("end", function () {
                csvData.shift();
                
                    pool.query("insert into library.books(barcode,author,title,volume,publisher,copyright,pages,classificationnumber,language,stockhead,issueinglibrary,subject,price,currency,billdate,billnumber,bookcategory,section,booktype,sourceofpurchase,loststatus) values ?",[csvData],function(error, result){
                    if (error) {
                        logger.counsellingLogger.log('error',`${error}`);
                        res.redirect('/admin/showaddbooks')
                    }
                    else
                    {
                        req.session.issuemsg='books uploaded'
                        logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added books from ${req.file.originalname}`)
                        res.redirect('/admin/showaddbooks')
                    }
                    }
                    );
                });
                    stream.pipe(csvStream);
                }
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/showaddbooks',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.books',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered show addbooks page`)
                res.render('addbooks',{adminemail:req.session.adminemail,msg:req.session.issuemsg,data:result})
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/search_student',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.userdetails where firstname=?',[req.query.studenten],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.render('addremark',{msg:'student not found',adminemail:req.session.adminemail,remarkdata:[],studenten:'',studentname:'',strudentbranch:''})
            }
            else
            {
                if(result.length==1)
                {
                    req.session.studentdata=result[0]
                    req.session.searchmsg="student found"
                    req.session.studenten=result[0].firstname
                    req.session.studentname=result[0].lastname
                    req.session.studentbranch=result[0].branch
                    req.session.usermail = result[0].mailid
                    logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} searched student ${result[0].firstname}`)
                    res.redirect('/admin/showaddremark')
                }
                else{
                req.session.searchmsg="student not found"
                res.redirect('/admin/showaddremark')
                }
            }
        })
    }   
    else
        res.redirect('/')
})

router.post('/add_remark',function(req,res){
    if(req.session.adminemail)
    {
        
        pool.query('update library.userdetails set remark=? where firstname=?',[req.body.remark,req.body.studentcard],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.redirect('/admin/showaddremark')
            }
            else
            {                   
        async function main(){

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                auth: {
                    user: 'naveenmittal590@gmail.com',
                    pass: 'dgttsdheuozkshso'
                }
            });

              let info = await transporter.sendMail({
                from: 'naveenmittal590@gmail.com', // sender address
                to: `${req.session.usermail}`, // list of receivers
                subject: `Library Remark`, // Subject line
                text: `${req.body.remark}`, // plain text body
                // html: "<b>Hello world?</b>", // html body
              });

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} remarked ${req.body.studentcard}:${req.body.remark}`)
            // Preview only available when sending through an Ethereal account
        
        }
        main().catch(logger.counsellingLogger.log('error',`${console.error}`))

        logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added remark ${req.body.remark} for user ${req.body.studentcard}`)
        res.redirect('/admin/showaddremark')
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/delete_remark',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('update library.userdetails set remark=NULL where firstname=?',[req.query.en],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.redirect('/admin/showaddremark')
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} removed remark for user ${req.query.en}`)
                res.redirect('/admin/showaddremark')
            }
            
        })
    }
    else
        res.redirect('/')
})

router.get('/showaddremark',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.userdetails where remark is not null',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.render('addremark',{adminemail:req.session.adminemail,remarkdata:[],msg:'',studenten:'',studentname:'',strudentbranch:''})
            }
            else
            {
                req.session.studentdata=result
                req.session.remark
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered add remark page`)
                res.render('addremark',{adminemail:req.session.adminemail,remarkdata:result,msg:req.session.searchmsg,studenten:req.session.studenten,studentname:req.session.studentname,studentbranch:req.session.studentbranch})
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/delete_notice',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('delete from library.notice where noticeid=?',[req.query.noticeid],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.redirect('/admin/showaddnotice')
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} removed notice of noticeid ${req.query.noticeid}`)
                res.redirect('/admin/showaddnotice')
            }
            
        })
    }
    else
        res.redirect('/')
})

router.get('/get_all_notice',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.notice',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.status(500).json([])
            }
            else
            {
             
                res.status(200).json(result)
            }
        })
    }
        res.redirect('/')
})

router.post('/addnotice',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('insert into library.notice(notice) values(?)',[req.body.notice],function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.render('addnotice',{msg:'server error',adminemail:req.session.adminemail,noticedata:req.session.noticedata})
            }
            else
            {
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added notice ${req.body.notice}`)
                res.redirect('/admin/showaddnotice')
            }
        })
    }
    else
        res.redirect('/')
})

router.get('/showaddnotice',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.notice',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
                res.redirect('/admin/showaddnotice')
            }
            else
            {
                req.session.noticedata=result
                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered show notice page`)
                res.render('addnotice',{adminemail:req.session.adminemail,msg:'',noticedata:result})
            }
        })
        
    }
    else
        res.redirect('/')
})

router.post('/add_issue_file',upload.single("file"),function(req,res){
    if(req.session.adminemail)
    {
        if(req.body.issue=="upload")
        {
            pool.query('update library.files set filename=? where fileid=1',[req.file.originalname],function(error,result){
                if(error)
                {
                    logger.counsellingLogger.log('error',`${error}`);
                    res.redirect('/admin/showaddfiles')
                }
                else
                {
                    req.session.filename= req.file.originalname
                    UploadCsvDataToMySQL(`public/files/${req.file.originalname}`);

                    function UploadCsvDataToMySQL(filePath) {
                    let stream = fs.createReadStream(filePath);
                    let csvData = [];
                    let csvStream = csv
                    .parse()
                    .on("data", function (data) {
                    csvData.push(data);
                    })
                    .on("end", function () {
                    csvData.shift();
                    pool.query("insert into library.issue(issuedate,barcode,title,author,cardnumber,surname) values ?",[csvData],function(error, result){
                    if (error) {
                        logger.counsellingLogger.log('error',`${error}`);
                        req.session.duplicateIssueError=error.toString()
                        res.redirect('/admin/showaddfiles')
                    }
                    else
                    {
                        logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added issue file`)
                        req.session.issuemsg="issue file uploaded"
                        res.redirect('/admin/showaddfiles')
                        // res.render('addfiles',{issuemsg:'issue file uploaded',adminemail:req.session.adminemail,returnmsg:'',duplicateIssueError:req.session.duplicateIssueError})
                    }
                    
                    }
                    );
                    });
                        stream.pipe(csvStream);
                    }
    
                }
            })
        }
        else if(req.body.issue=="remove")
        {
           
                pool.query('select filename from library.files where fileid=1',function(error,result){
                    if(error)
                    {
                        logger.counsellingLogger.log('error',`${error}`);
                        res.render('addfiles',{issuemsg:'server error',adminemail:req.session.adminemail,returnmsg:''})
                    }
                    else
                    {
                        
                        try
                        {
                            fs.unlinkSync(`public/files/${result[0].filename}`)
                            pool.query('truncate library.issue',function(error,result){
                                if(error)
                                {
                                    logger.counsellingLogger.log('error',`${error}`);
                                    res.render('addfiles',{issuemsg:'server error',adminemail:req.session.adminemail,returnmsg:''})
                                }
                                else
                                {
                                    logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} removed issue file`)

                                    res.render('addfiles',{issuemsg:'file removed',adminemail:req.session.adminemail,returnmsg:''})
                                }
                            })
                        }
                        catch(err)
                        {
                        res.render('addfiles',{issuemsg:'first upload file',adminemail:req.session.adminemail,returnmsg:''})
                        }
                    }
                })
        }
    }
    else
        res.redirect('/')
})

router.post('/add_return_file',upload.single('file'),function(req,res){
    if(req.session.adminemail)
    {
        if(req.body.return=="upload")
        {
            pool.query('update library.files set filename=? where fileid=2',[req.file.originalname],function(error,result){
                if(error)
                {
                    logger.counsellingLogger.log('error',`${error}`);
                    res.redirect('/admin/showaddfiles')
                }
                else
                {
                   
                    UploadCsvDataToMySQL(`public/files/${req.file.originalname}`);

                    function UploadCsvDataToMySQL(filePath) {
                    let stream = fs.createReadStream(filePath);
                    let csvData = [];
                    let csvStream = csv
                    .parse()
                    .on("data", function (data) {
                    csvData.push(data);
                    })
                    .on("end", function () {
                    csvData.shift();
                    pool.query("insert into library.return(returndate,barcode,title,author,cardnumber,surname,extracol) values ?",[csvData],function(error, result){
                    if (error) {
                        logger.counsellingLogger.log('error',`${error}`);
                        
                        res.redirect('/')
                    }
                    else
                    {
                        pool.query('delete from library.issue where barcode in (SELECT barcode FROM library.return) and cardnumber in (select cardnumber from library.return)',function(error,result){
                            if(error)
                            {
                                
                                logger.counsellingLogger.log('error',`${error}`)
                                res.redirect('/')
                            }
                            else
                            {
                                logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} added return file`)
                                req.session.returnmsg="return file uploaded"
                                res.redirect('/admin/showaddfiles')    
                            }
                        })
                       
                    }
                    
                    }
                    );
                    });
                        stream.pipe(csvStream);
                    }
    
                }
            })   
        }
        else if(req.body.return=="remove")
        {
            pool.query('select filename from library.files where fileid=2',function(error,result){
                if(error)
                {
                    logger.counsellingLogger.log('error',`${error}`);
                    res.render('addfiles',{issuemsg:'',adminemail:req.session.adminemail,returnmsg:'server error'})
                }
                else
                {
                    
                    try
                    {
                        fs.unlinkSync(`public/files/${result[0].filename}`)
                       
                        pool.query('INSERT INTO library.returnmain SELECT returndate,barcode,title,author,cardnumber,surname,extracol FROM library.return',function(error,result){
                            if(error)
                            {
                                logger.counsellingLogger.log('error',`${error}`)
                                res.redirect('/')
                            }
                            else
                            {
                                pool.query('truncate library.return',function(error,result){
                                    if(error)
                                    {
                                        logger.counsellingLogger.log('error',`${error}`);
                                        res.render('addfiles',{issuemsg:'',adminemail:req.session.adminemail,returnmsg:'server error'})
                                    }
                                    else
                                    {
                                        /*pool.query('update library.files set filename="" where fileid=1',function(error,result){
                
                                        })*/
                                        logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} removed return file`)
                                        req.session.returnmsg="file removed"
                                        res.redirect('/admin/showaddfiles')
                                    }
                                })
                            }
                        })    
                    }
                    catch(err)
                    {
                    res.render('addfiles',{issuemsg:'',adminemail:req.session.adminemail,returnmsg:'first upload file'})
                    }
                }
            })
        }
        else if(req.body.return=="removemain")
        {
            pool.query('truncate library.returnmain',function(error,result){
                if(error)
                {
                    logger.counsellingLogger.log('error',`${error}`)
                }
                else
                {
                    res.redirect('/admin/showaddfiles')
                }
            })
        }
    }
    else
        res.redirect('/')
})



router.get('/showaddfiles',function(req,res){
    if(req.session.adminemail)
    {
        let returnmsg='';
        // let returnmsg =  req.session.returnmsg=="return file uploaded"?"return file uploaded":""
        let issuemsg = req.session.issuemsg=="issue file uploaded"?"issue file uploaded":""

        if(req.session.returnmsg=="return file uploaded")
        {
            returnmsg = "return file uploaded"
        }
        else if(req.session.returnmsg=="file removed")
        {
            
            returnmsg="file removed"
        }

        res.render('addfiles',{adminemail:req.session.adminemail,issuemsg:issuemsg,returnmsg:returnmsg}) 
    }
    else
        res.redirect('/')
})


router.get('/showusers',function(req,res){
    if(req.session.adminemail)
    {
        pool.query('select * from library.userdetails',function(error,result){
            if(error)
            {
                logger.counsellingLogger.log('error',`${error}`);
            }
            else
            {   logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered show users page`)
                
                res.render('showusers',{data:result,adminemail:req.session.adminemail})
            }
        })
    }
    else
        res.redirect('/')
})

router.post('/checkadmin',function(req,res){
    pool.query('select * from library.admin where adminemail=?',[req.body.adminemail.trim()],function(error,result){
        if(error)
        {
            logger.counsellingLogger.log('error',`${error}`);
            res.redirect('/admin/adminlogin')
        }
        else
        {
            try
            {
                var secretkey = "secret key";
                var decryptPassword = aes256.decrypt(secretkey,result[0].adminpassword);
                if(result.length==1 && decryptPassword==req.body.adminpassword)
                {
                    req.session.adminemail = result[0].adminemail  
                    req.session.ip = req.body.userip
                    logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} logged in`)    
                    res.redirect('/admin/admindashboard')
                }
                else
                {
                    req.session.invaliderror='invaild credentails'
                    res.redirect('/admin/adminlogin')
                }
            }
            catch(error)
            {
                req.session.invaliderror='invaild credentails'
                res.redirect('/admin/adminlogin')
            }
        }
    })
})

router.get('/admindashboard',function(req,res){
    if(req.session.adminemail)
        {logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} rendered dashboard`)
        res.render('admindashboard',{adminemail:req.session.adminemail})}
    else
        res.redirect('/')    
})

router.get('/adminlogout',function(req,res){
    logger.counsellingLogger.log('info',`${req.session.ip} admin ${req.session.adminemail} signed out`)
    req.session.destroy()
    res.redirect('/')
})

router.get('/adminlogin',function(req,res){
    res.render('adminlogin',{msg:'',invailderror:req.session.invaliderror})
})

module.exports = router;
