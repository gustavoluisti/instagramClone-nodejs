const express = require('express')
const bodyParser = require('body-parser')
const mongodb = require('mongodb')
const multiparty = require('connect-multiparty')
const objectId = require('mongodb').ObjectId
const fs = require('fs')

const app = express()

app.use(bodyParser.urlencoded({ extended:true}))
app.use(bodyParser.json())
app.use(multiparty())

const port = 3001

app.listen(port)

const db = new mongodb.Db(
    'redeservices',
    new mongodb.Server('localhost', 27017, {}),
    {}
)

console.log('Servidor ativo e rodando' + port)

app.get('/', (req, res) => {

    const resposta = {msg: 'SpartaDev'}
    res.send(resposta)
})

app.post('/api', (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")

    const date = new Date()
    time_stamp = date.getTime()

    url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename 

     const path_origem = req.files.arquivo.path
     const path_destino = './uploads/' + url_imagem

    

     fs.rename(path_origem, path_destino, (err)=>{
         if(err){
             res.status(500).json({error: err})
             return
         }
         const dados = {
             url_imagem: url_imagem,
             titulo: req.body.titulo
         }
         db.open((err, mongoCliente) => {
            mongoCliente.collection('postagens', (err, collection) =>{
                collection.insert(dados, (err, records) => {
                    if(err) {
                        res.json({'status': 'erro não deu'})
                    } else {
                        res.json({'status' : 'Tudo certo dados enviados, manda mais'})
                    }
                    mongoCliente.close();
                })
            })
        })
     })
   
})

app.get('/api', (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")

    db.open((err, mongoCliente) => {
        mongoCliente.collection('postagens', (err, collection) =>{
            collection.find().toArray((err, results) => {
                if(err){
                    res.json({'erro': 'Não rolou'})
                } else {
                    res.json(results)
                }
                mongoCliente.close()
            })
        })
    })
})


app.get('/imagens/:imagem', (req, res) => {
    const img = req.params.imagem 

    fs.readFile('./uploads/'+img, (err, content) => {
        if(err){
            res.status(400).json(err)
            return
        }
        res.writeHead(200, { 'content-type' : 'image/jpg'})
        res.end(content)
    })
})

app.get('/api/:id', (req, res) => {
    db.open((err, mongoCliente) => {
        mongoCliente.collection('postagens', (err, collection) =>{
            collection.find(objectId(req.params.id)).toArray((err, results) => {
                if(err){
                    res.json({'erro': 'Não rolou'})
                } else {
                    res.status(200).json(results)
                }
                mongoCliente.close()
            })
        })
    })
})

app.put('/api/:id', (req, res) => {
    db.open((err, mongoCliente) => {
        mongoCliente.collection('postagens', (err, collection) =>{
            collection.update(
                { _id : objectId(req.params.id ) },
                { $set : { titulo : req.body.titulo } },
                {},
                (err, records) => {
                    if(err){
                        res.json(err)
                    } else {
                        res.json(records)
                    }
                    mongoCliente.close()
                }
            )
        })
    })
})

app.delete('/api/:id', (req, res) => {
    db.open((err, mongoCliente) => {
        mongoCliente.collection('postagens', (err, collection) =>{
            collection.remove({ _id : objectId(req.params.id)}, (err, records) => {
                if(err) {
                    res.json(err)
                } else {
                    res.json(records)
                }
                mongoCliente.close()
            })
        })
    })
})

