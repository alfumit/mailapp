(function(){
  "use strict";
  angular.module("componentsMod",["servicesMod","ui.router"])
    .component('mailboxList', {
      bindings: {
        mailbox: "<",
        chooseMailbox: "&"
      },
      templateUrl: "mailbox-list.html",
      controller: function(dataFactory){
        dataFactory.getAll().then((response)=> {
          this.mailStore = response.data[0];
        });
      }
    })
    .component("messageList", {
      bindings: {
       // mailbox: "<",
        mailboxIndex:"@",
        message: "=",
      },
      templateUrl:"message-list.html" ,
      controller: function(dataFactory,$state) {
        
        dataFactory.getMailBoxMessages(this.mailboxIndex || 0).then((response)=> {
          this.messages = response.data;
        });   
        
        this.showUserCard = (fromUser) => {
          $state.go("userCardEdit",{showPopup:true,fromUser:fromUser});
        };
        
        this.showMessage = (messageId) => {
          $state.go("messageView",{showPopup:true,messageId:messageId});
        };        
        
        this.removeFromInbox = (inbox,message,messageIndex) => {
          dataFactory.delete(this.mailboxIndex,message).then((response)=>{
            this.messages.splice(messageIndex,1);
          });
        };
      }
    })
    .component("userCard",  {
        bindings: {
          email: "@",
          itemImported: "<item",
          closeUserCard:"=",
          index: "@contactIndex",
          removeCard: "&"
        },        
        controller: function(userFactory,$state) {
          this.setEditable = false;
          this.editLabel = "Edit";
          this.userForm = {};
          
          // Get contact by email address
          if(!this.itemImported) {
            userFactory.getItemByEmail(this.email).then(item => {
              this.userForm = item;
              if(!item) {
                this.userForm = {
                    fullName: "New User",
                    birthdate: "unknown",
                    gender: "no data",
                    email: this.email || "email@email.email",
                    address: "no data",
                    id: false
                };
                this.setEditable = true;
                this.editLabel = "Create New User";
              }
            });
          } else {
            this.userForm = this.itemImported;
          }
          
          this.hide = () => {
            $state.go("^",{showPopup: false})
          };
          
          this.delete = () => {
            this.removeCard({index: this.index});
            userFactory.delete(this.userForm).then(response =>{
                this.removeCard({index: this.index});
            });
          };
          
          // Multi functional button
          this.buttonAction = () => {
            if(this.finished) {
              return false;
            }
            if(!this.setEditable) {
              this.setEditable = true;
              this.editLabel = "Send";
            } else {
              //Если запись есть - редактируем, если нет - создаем новую
              if(this.userForm.id) { 
                userFactory.update(this.userForm).then(response => {
                  this.editLabel = "Success.";
                  this.finished = true;
                  this.setEditable = false;
                });
              } else {
                userFactory.post(this.userForm).then(response => {
                  this.editLabel = "New user created.";
                  this.finished = true;
                  this.setEditable = false;
                });               
              }
            }
          };
          
        },
        templateUrl: "usercard.html",
    })
    .component("userCardList",  {
        controller: function(userFactory) {
          userFactory.getAll().then(response => {
            this.data = response.data;
          });
          
          this.removeCard = (contactIndex) => {
            this.data.splice(contactIndex,1);
          };
          
        },
        templateUrl: "usercard-list.html",
    })    
    .directive("contenteditable", function() {
    return {
      require: "ngModel",
      link: function(scope, element, attrs, ngModel) {
  
        function read() {
          ngModel.$setViewValue(element.html());
        }
  
        ngModel.$render = function() {
          element.html(ngModel.$viewValue || "");
        };
  
        element.bind("blur keyup change", function() {
          scope.$apply(read);
        });
      }
    };
    })
    .component("writeMessage",{
      bindings: {
        mailboxIndex: "@",
      },
      templateUrl: "write-message.html",
      controller: function(dataFactory,$state) {
        this.hide = () => {
          $state.go("inbox",{showPopup:false});
        };
        
        this.addToInbox = (form) => {
          let messageObj = {};
          messageObj.subject = this.subj;
          messageObj.from = this.from;
          messageObj.body = this.content || `${this.from} написал тебе только тему, а тело забыл`;
          if(form.$valid) { 
            dataFactory.post(this.mailboxIndex,messageObj).then((newMessageIndex)=>{
              $state.go("inbox",{showPopup:false});
            });
          }
        };
      }
    })
    .component("messageView",{
      bindings: {
        message: "<"
      },
      templateUrl: "message-view.html",
      controller: function($state) {
        this.hide = () => {
          $state.go("inbox",{showPopup:false});
        };
      }
    });

})()