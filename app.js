const firebase = require("firebase");
require("firebase/auth");
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const { initializeApp, credential } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Configuração do Firebase Admin
const serviceAccount = require('./engenharia-de-software-a86ec-firebase-adminsdk-bxv42-c37dd39b9e.json');
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

// Configuração do Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rota para a página inicial
app.get("/", function (req, res) {
  res.render("primeira_pagina.handlebars");
});

//Rota para a página de consulta
app.get("/consulta", function (req, res) {
  const collection = db.collection("usuarios");
  collection.get()
    .then((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const documentId = doc.id;
        const documentData = doc.data();
        data.push({ id: documentId, ...documentData });
      });
      res.render("consulta", { usuarios: data });
    })
    .catch((error) => {
      console.error("Erro ao consultar usuários: ", error);
    });
});

// Rota para a página de edição de usuário
app.get("/editar/:id", function (req, res) {
  const collection = db.collection("usuarios");
  const documentId = req.params.id;
  const documentRef = collection.doc(documentId);

  documentRef.get()
    .then((doc) => {
      if (doc.exists) {
        const data = { id: documentId, ...doc.data() };
        res.render('editar', data);
      } else {
        console.log("Documento não encontrado.");
      }
    })
    .catch((error) => {
      console.error("Ocorreu um erro ao buscar o documento: ", error);
    });
});

// Rota para exclusão de usuário
app.get("/excluir/:id", function (req, res) {
  const collection = db.collection("usuarios");
  const documentId = req.params.id;

  collection.doc(documentId).delete()
    .then(() => {
      console.log("Documento excluído com sucesso!");
      res.redirect("/consulta");
    })
    .catch((error) => {
      console.error("Erro ao excluir o documento: ", error);
    });
});

// Rota para atualização de usuário
app.post("/atualizar", function (req, res) {
  const collection = db.collection("usuarios");
  const id = req.query.id;

  const updateData = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao
  };

  // Verificar se o ID é uma string válida e não está vazio
  if (id && typeof id === "string" && id.trim() !== "") {
    collection.doc(id).update(updateData)
      .then(() => {
        console.log("Documento atualizado com sucesso!");
        res.redirect("/consulta");
      })
      .catch((error) => {
        console.error("Erro ao atualizar o documento: ", error);
      });
  } else {
    console.error("ID de documento inválido ou ausente no corpo da solicitação.");
  }
});

// Rota para cadastro de um novo usuário
app.post("/cadastrar", function (req, res) {
  const collection = db.collection('usuarios');
  const novoUsuario = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao
  };

  collection.add(novoUsuario)
    .then(() => {
      console.log('Documento adicionado com sucesso');
      res.redirect('/consulta');
    })
    .catch((error) => {
      console.error('Erro ao adicionar documento:', error);
      res.status(500).send('Erro ao adicionar documento');
    });
});

// Rota para exibir o formulário de login
app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para processar o login
app.post('/index.html', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then((user) => {
      // Autenticação bem-sucedida, redirecione para a página principal ou outra página.
      res.redirect('/pagina-principal.html');
    })
    .catch((error) => {
      // Autenticação falhou, trate o erro ou redirecione para uma página de erro.
      res.redirect('/cadastrar.html');
    });
});

const firebaseConfig = {
    apiKey: "AIzaSyAQ9JlLJWoXV6gA54hlb_XtVM5Mjgkr7N8",
    authDomain: "engenharia-de-software-a86ec.firebaseapp.com",
    projectId: "engenharia-de-software-a86ec",
    storageBucket: "engenharia-de-software-a86ec.appspot.com",
    messagingSenderId: "473368207019",
    appId: "1:473368207019:web:120f45a152eea9d994a1ee"
  };
  
  

app.listen(8081, function () {
  console.log("Servidor ativo!")
});
