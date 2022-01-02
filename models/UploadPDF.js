var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
pdfSchema = new Schema({
    
    resource_id: Number,
    name: String,
    desc: String,
    standard: String,
    filename: String,
    img:{
        data: Buffer,
        contentType: String
    }
});

Pdf = mongoose.model('Pdf', pdfSchema);
 
//Image is a model which has a schema imageSchema
 
module.exports = Pdf;