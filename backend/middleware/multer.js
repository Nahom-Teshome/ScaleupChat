// const multer = require('multer')


// const storage = multer.storage({
//     destination:function(req,file,cb){
//         cb(null, 'uploads/')
//     },
//     filename: function(req,file,cb){
//         const uniqueSuffix= `${Date.now()} - ${ Math.round(Math.random() * E19)} `
//         cb(null, file.fieldname+' ' +uniqueSuffix+' '+ path.extname(file.originalname))
//     }
// })

// module.exports= storage