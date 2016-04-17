(function(){
  "use strict";
  angular.module("servicesMod",[]) 
    .factory("dataFactory", function dataFactory($http){ // Сервис для почты
      return {
        getAll: function () {
          return $http.get("https://glaring-inferno-7632.firebaseio.com/mailapp.json").then(response =>{
            let res = {
              data: Object.keys(response.data).map( key =>{
                return response.data[key];
              })
            };
            return res;
          })
        },
        getMailBoxMessages: function (mailboxIndex) {
          return $http.get(`https://glaring-inferno-7632.firebaseio.com/mailapp/mailapp/${mailboxIndex}/messageList.json`).then(response =>{
            let res = {
              data: Object.keys(response.data).map( key =>{
                return response.data[key];
              })
            };
            return res;
          })
        },
        getMessage: function(mailboxIndex,messageId){
          return $http.get(`https://glaring-inferno-7632.firebaseio.com/mailapp/mailapp/${mailboxIndex}/messageList/${messageId}.json`);
        },
        post: function(mailboxIndex,item) {
          return $http.post(`https://glaring-inferno-7632.firebaseio.com/mailapp/mailapp/${mailboxIndex}/messageList.json`,item)
          .then(response => {
            //Хак для Firebase, для того чтобы записать id сразу при генерации новой записи
            item.id = response.data.name;
           return  this.update(mailboxIndex,item);
          })
        },
        update: function(mailboxIndex,item) {
          return $http.put(`https://glaring-inferno-7632.firebaseio.com/mailapp/mailapp/${mailboxIndex}/messageList/${item.id}.json`,item);
        },
        delete: function(mailboxIndex,message) {
           // console.log(`https://glaring-inferno-7632.firebaseio.com/mailapp/mailapp/${mailboxIndex}/messageList/${message.id}.json`);
          return $http.delete(`https://glaring-inferno-7632.firebaseio.com/mailapp/mailapp/${mailboxIndex}/messageList/${message.id}.json`);
        }
      }
    })
    .factory("userFactory", function userFactory($http,$log){    // Сервис для контактов
      return {
        getAll: function(){
          return $http.get("https://glaring-inferno-7632.firebaseio.com/users.json").then(response =>{
            let res = {
              data: Object.keys(response.data).map( key =>{
                return response.data[key];
              })
            };
            return res;
          })
        },
        // Для того чтобы в качестве ключа использовать email
        getItemByEmail: function(email) {
          return this.getAll().then(response => {
            let res = false;
            response.data.forEach(item => {
              if(item.email == email) { 
                res = item;
              }
            })
          return res;
          })
        },
        post: function(item) {
          return $http.post(`https://glaring-inferno-7632.firebaseio.com/users.json`,item)
          .then(response => {
            //Хак для Firebase, для того чтобы записать id сразу при генерации новой записи
            item.id = response.data.name;
           return  this.update(item);
          })
        },
        update: function(item) {
          return $http.put(`https://glaring-inferno-7632.firebaseio.com/users/${item.id}.json`,item)
        },
        delete: function(item) {
           return $http.delete(`https://glaring-inferno-7632.firebaseio.com/users/${item.id}.json`)         
        }
      }
    })  
})()