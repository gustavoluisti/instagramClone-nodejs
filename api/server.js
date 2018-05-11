const express = require('express')
const bodyParser = require('body-parser')
const mongodb = require('mongodb')
const objectId = require('mongodb').ObjectId

const app = express()

app.use(bodyParser.urlencoded({ extended:true}))
app.use(bodyParser.json())

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
    const dados = req.body

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

app.get('/api', (req, res) => {
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

