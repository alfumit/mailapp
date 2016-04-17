'use strict';
angular.module("mailApp", ["servicesMod","componentsMod",'ngMessages','ui.router'])
.config(function($stateProvider,$urlRouterProvider){
  $stateProvider.
  state("main",{
    url:"",
    controller: function($state) {
      // this.go = () => {
          $state.go("inbox",{mailboxId:0});
     //  }
    },
    controllerAs: "$ctrl"
  }).
  state("mail",{
    abstract: true,
    url:"/mail",
    templateUrl: "mail.html",
    controller: function(dataFactory,$state) {
      this.showSendForm = false;
      this.showUserForm = false;
      this.showMessageView = false;
      this.fromUser = "";
      this.message = "";
      this.mailboxChosen = "Inbox";
      this.mailboxIndex = 0;
      this.section = "mail";
      
      dataFactory.getAll().then((response)=> {
        this.mailStore = response.data[0];
      });
      dataFactory.getMailBoxMessages(0).then((response)=> {
        this.messages = response.data;
      });
      
      this.showUserCard = (from) => {
        this.fromUser = from;
        this.showUserForm = !this.showUserForm;
      };
      this.showMessage = function(message) {
          this.showMessageView = true;
          this.message = message;
      };
      this.showMessageForm = () => {
        $state.go("messageWrite",{showPopup:true});
      }
      this.sectionChange = (section) => {
        $state.go(section);
      }      
      
      this.chooseMailbox = (chosen) => {
        this.mailboxChosen = chosen;
        for (let i in this.mailStore) {
          if (this.mailStore[i].mailboxName == this.mailboxChosen) {
            this.mailboxIndex = i;
            $state.go("inbox",{mailboxId:this.mailboxIndex})
            break;
          }
        }
      }     
    },
    resolve: {
      userData: function($rootScope){
        return $rootScope
      }
    },
    controllerAs: "$ctrl"
  }).
  state('inbox',{
    parent:"mail",
    url:"/{mailboxId}/{showPopup:bool}",
    views: {
      "messageList": {
        template: `<message-list mailbox-index="{{$ctrl.mailboxId}}"></message-list>`,
        controller: function($stateParams) {
          this.mailboxId = $stateParams.mailboxId || 0;
        },      
        controllerAs: "$ctrl"
      },
      "popup":{
        template: ` 
        <div class="popup-wrapper" ng-if="$ctrl.showPopup" ng-click="$ctrl.hidePopup($event)">
          <div ui-view="popup"></ui-view>
        </div>`,
        controller: function($stateParams,$state) {
          this.showPopup =  $stateParams.showPopup || false;
          this.mailboxId = $stateParams.mailboxId || 0;
          
          this.hidePopup = (e) => {
            for (let val of e.target.classList) {
              if(val == 'popup-wrapper') {
                $state.go("inbox",{mailboxId:this.mailboxId,showPopup:false})
              }     
            }
          }
          
        },      
        controllerAs: "$ctrl"
      }
    }
  }).
  state('messageView',{
    parent:"inbox",
    url:"/message-view/{messageId}",
    views: {
      "popup":{
        template: `<message-view message="$ctrl.message"></message-view>`,
        controller: function(message){
          this.message = message;
        },
        controllerAs:"$ctrl"
      }
    },
    resolve: {
      message: function($stateParams,dataFactory) {
        return dataFactory.getMessage($stateParams.mailboxId,$stateParams.messageId)
        .then(response => {
          return response.data;
        })
      }
    }
  }).
  state('messageWrite',{
    parent:"inbox",
    url:"/message-write",
    views: {
      "popup":{
        template: `<write-message mailbox-index="{{$ctrl.mailboxId}}"></write-message>`,
        controller: function($stateParams){
          this.mailboxId = $stateParams.mailboxId;
        },
        controllerAs:"$ctrl"
      }
    },
  }).
  state('userCardEdit',{
    parent:"inbox",
    url:"/usercard-edit/{fromUser}",
    views: {
      "popup":{
        template: `<user-card class="user-card" email="{{$ctrl.fromUser}}"></user-card>`,
        controller: function($stateParams){
          this.fromUser = $stateParams.fromUser;
        },
        controllerAs:"$ctrl"
      }
    },
  }).   
  state("contacts",{
    url:"/contacts",
    templateUrl: "contacts.html",
    controller: function($state) {
      this.showUserForm = false;
      this.fromUser = "";
      this.section = "contacts";
          
      this.showUserCard = (from) => {
        this.fromUser = from;
        this.showUserForm = !this.showUserForm;
      };
      
      this.sectionChange = (section) => {
        $state.go(section);
      } 
      
    },
    controllerAs: "$ctrl"
  })
});