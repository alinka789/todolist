function dbInitialize() {
    if(window.openDatabase) {
       db = openDatabase("todolist", "1.0", "List of tasks", 200000); 
       if(db) {
           db.transaction(function(t){
              t.executeSql("CREATE TABLE IF NOT EXISTS list (_id TEXT PRIMARY KEY, date STRING, time STRING, text TEXT, status STRING)"); 
           });
       } else {
           alert("No db open!");
       }
       return true;
    } else {
        
       alert("It seems that your browser does not support WebSQL databases. Please use a browser that does, otherwise part of this application will not work in offline mode, as intended.");
       return false;
   }
}
function insertValues(_id, date, time, text, status) {
   db.transaction(function(t){
       t.executeSql("INSERT INTO list VALUES(?, ?, ?, ?, ?)", [_id, date, time, text, status]);
   });
}


function deleteValues(_id) {
   db.transaction(function(t){
      t.executeSql("DELETE FROM list WHERE _id=?", [_id]); 
   });
}

function updateValues(_id, date, time, text, status) {
   db.transaction(function(t){
      t.executeSql("UPDATE list SET text=?, status=? WHERE _id=?", [text, status, _id]); 
   });
}

function deleteAll() {
   db.transaction(function(t){
       t.executeSql("DELETE FROM list", []);
   });
}


$(function() {
    var online;
    online = isSiteOnline();
    var connected;
    connected = dbInitialize();
    var change = true;
    var app = {
        models: {},
        views: {},
        collections: {},
        mainTaskCollection: false,
        updateWebCollection: false,
        templates: {
            item: _.template($("#template-item").html()),
            form: _.template($("#template-form").html()),
            update: _.template($("#template-form-update").html()),
            message: _.template($("#template-message-offline").html()),
            modified: _.template($("#template-modified-task").html()),
            previous:_.template($("#template-previous-task").html()),
            deleted: _.template($("#template-deleted-task").html())
        },
        func: {
            fetchCollection: function() {
                if(online) {
                app.mainTaskCollection = new app.collections.TaskCollection;
                $.ajax({
                    url: "tasks/type/json",
                    dataType: "json",
                    success: function(model) {
                        app.mainTaskCollection.add(model, {sort: false});
                        app.func.initTask(app.mainTaskCollection);
                         if(change) {
                            app.func.offlineChange(app.mainTaskCollection);
                        } 
                        if(change == false && connected == true) {
                                deleteAll();
                                app.func.addDataWebSql();
                        }
                        
                    }, 
                    complete: function(object, message) {
                        if(object.status != 200) {
                            window.location.reload();
                        } 
                    }
                    
                });   
                } 
                if(!online && connected) {
                    app.mainTaskCollection = new app.collections.TaskCollection;
                    $.ajax({
                    url: "tasks/type/json",
                    dataType: "json",
                    success: function(model) {
                       app.mainTaskCollection.add(model, {sort: false});
                    },
                    complete: function(object, message) {
                        if(object.status == 200) {
                            window.location.reload(true);
                        } 
                    }
                    
                    }); 
                    var listTask = [];
                    db.transaction(function(t) {
                        t.executeSql("SELECT * FROM list", [], function(t, result) {
                            for (var index = 0; index < result.rows.length; index++) {
                                listTask[index] = result.rows.item(index);
                            }
                            app.func.initOfflineTask(listTask);
                        });
                    });
                }
            },
            initTask: function(collection) {
                var taskList = new app.views.TaskList({
                    el: $("#item"),
                    collection: collection,
                });
            },
            initOfflineTask: function(list) {
                 var offlineList = new app.views.TaskOfflineList({
                     el: $("#item"),
                     collection: list
                 });
            },
            addDataWebSql: function() {
                $.ajax({
                    url: "tasks/type/json",
                    dataType: "json",
                    success: function(model) {
                        _.each(model, function(object) {
                           insertValues(object._id, object.date, object.time, object.text, object.status);
                        });
                    }
                });
            },
            offlineChange: function(collection) {
                
                var changeList = new app.views.ChangeList({
                    el: $("#modified"),
                    collection: collection
                });
                if($("#close-all").length == 0) {
                    change = false;
                }
            }
        }
    }
    
    app.models.TaskModel = Backbone.Model.extend({
        idAttribute: "id"
    });
    
    app.collections.TaskCollection = Backbone.Collection.extend({
        model: app.models.TaskModel,
        url: "tasks/type/json"
    });
    
    app.views.ChangeList = Backbone.View.extend({
        events: {
          "click #close-all": "closeAll"  
        },
        initialize: function() {
            return this.render();
        },
        render: function() {
            var that = this;
            var newTask = false;
            var isTask = false;
            this.collection.each(function(model) {
                db.transaction(function(t) {
                    t.executeSql("SELECT * FROM list", [], function(t, result) {
                        for (var index = 0; index < result.rows.length; index++) {
                            if (result.rows.item(index)._id == model.get("_id")) {
                                isTask = true;
                            }
                        }
                        if (!isTask) {
                            var isDeleted = new app.views.IsDeletedItem({
                                model: model.toJSON()
                            });
                            that.$el.append(isDeleted.$el);
                            that.$("#close-all").remove();
                            that.$el.append("<button class='btn btn-danger' id='close-all'>Close all change</button>");
                        } else {
                            isTask = false;
                        }
                    });
                   
                });
                
            });
            db.transaction(function(t){
                t.executeSql("SELECT * FROM list", [], function(t, result){
                   for(var index = 0; index < result.rows.length; index++) {
                       that.collection.each(function(model){
                           if(result.rows.item(index)._id == model.get("_id")) {
                               if(result.rows.item(index).text != model.get("text") || result.rows.item(index).status != model.get("status")) {
                                  
                                   var previous = new app.views.PreviousItem({
                                       model: model.toJSON()
                                   });
                                   that.$el.append(previous.$el);
                                    var modified = new app.views.ModifiedItem({
                                       model: result.rows.item(index)
                                   });
                                   that.$el.append(modified.$el);
                                   that.$("#close-all").remove();
                                   that.$el.append("<button class='btn btn-danger' id='close-all'>Close all change</button>");
                               }
                               newTask = true;
                           }
                       });
                       if(!newTask) {
                           var id = result.rows.item(index)._id; 
                            var task = {
                                'date': result.rows.item(index).date,
                                'time': result.rows.item(index).time,
                                'status': result.rows.item(index).status,
                                'text': result.rows.item(index).text
                            }
                            $.ajax({
                                url: "task/add",
                                type: "post",
                                dataType: "json",
                                data: task,
                                success: function(model) {
                                    if (connected) {
                                        deleteValues(id);
                                        insertValues(model.task._id.$id, model.task.date, model.task.time, model.task.text, model.task.status);
                                    }
                                }
                            });
                       } else {
                           newTask = false;
                       }
                   } 
                });
            });
            
            return this;
        },
        closeAll: function() {
            deleteAll();
            app.func.addDataWebSql();  
            change = false;
            this.$el.empty();
        }
    });
    
    app.views.IsDeletedItem = Backbone.View.extend({
        tagName: "div",
        className: "panel panel-danger",
        events: {
          "click #save-deleted": "saveDeleted",
          "click #close-deleted": "closeDeleted"
        },
        initialize: function() {
            this.template = app.templates.deleted;
            return this.render();
        },
        render: function() {
            this.$el.empty();
            this.$el.html(this.template({model: this.model}));
            return this;
        },
        saveDeleted: function() {
            var that = this;
            $.ajax({
                url: "task/delete/" + that.model._id,
                type: "delete",
                dataType: "json",
                data: {_id: that.model._id},
                success: function(model){
                    that.$("#save-delete").remove();
                    that.$("#close-deleted").remove();
                    that.$("#btn-deleted").html("<span class='label label-info'>Removing confirmed ...</span>");   
                }
            });
        },
        closeDeleted: function() {
            this.$("#save-delete").remove();
            this.$("#close-deleted").remove();
            this.$("#btn-deleted").html("<span class='label label-info'>Deletion has not been confirmed ...</span>");
            if(connected){insertValues(this.model._id, this.model.date, this.model.time, this.model.text, this.model.status);}
        }
    });
    
    
    app.views.ModifiedItem = Backbone.View.extend({
        tagName: "div",
        className: "panel panel-warning",
        events: {
          "click #save-modified": "saveModified",
          "click #close-modified": "closeModified"
        },
        initialize: function() {
            this.template = app.templates.modified;
            return this.render();
        },
        render: function() {
            this.$el.empty();
            this.$el.html(this.template({model: this.model}));
            return this;
        },
        saveModified: function() {
            var that = this;
            $.ajax({
                url: "task/update/" + that.model._id,
                type: "put",
                dataType: "json",
                data: that.model,
                success: function(model) {
                    that.$("#save-modified").remove();
                    that.$("#close-modified").remove();
                    that.$("#btn").html("<span class='label label-info'>Successfuly save...</span>");
                }
            });
        },
        closeModified: function() {
            this.$("#save-modified").remove();
            this.$("#close-modified").remove();
            this.$("#btn").html("<span class='label label-info'>by the previous version ...</span>");
        }
                
    });
    
    app.views.PreviousItem = Backbone.View.extend({
        tagName: "div",
        className: "panel panel-warning",
        initialize: function() {
            this.template = app.templates.previous;
            return this.render();
        },
        render: function() {
            this.$el.empty();
            this.$el.html(this.template({model: this.model}));
            return this;
        }
        
    });
    
    app.views.TaskOfflineList = Backbone.View.extend({
        initialize: function() {
            return this.render();
        },
        render: function() {
            var that = this; 
            this.$el.empty();
            _.each(this.collection, function(model){
               var taskItem = new app.views.TaskItem({
                   model: model
               });
               that.$el.append(taskItem.$el);
            });
            return this;
        }
    });
    
    app.views.TaskList = Backbone.View.extend({
        initialize: function() {
            return this.render();
        },
        render: function() {
            var that = this;
            this.$el.empty();
          this.collection.each(function(model){
                var taskItem = new app.views.TaskItem({
                    model: model,
                    collection: that.collection
                });
                that.$el.append(taskItem.$el);
            });
            return this;
        }
    });
    
    app.views.TaskItem = Backbone.View.extend({
        tagName: "div",
        className: "panel",
        events: {
            "click #delete": "clickDelete",
            "click #update": "clickUpdate",
            "click #save": "clickSave"
        },
        initialize: function() {
            this.template = app.templates.item;
            return this.render();
        },
        render: function() {
            this.$el.empty();
            if (online) {
                this.$el.html(this.template({model: this.model.toJSON()}));
                if (this.model.get("status") == "new") {
                    this.$el.addClass("panel-primary");
                }
                if (this.model.get("status") == "open") {
                    this.$el.addClass("panel-info");
                }
                if (this.model.get("status") == "on hold") {
                    this.$el.addClass("panel-danger");
                }
                if (this.model.get("status") == "in progress") {
                    this.$el.addClass("panel-warning");
                }
                if (this.model.get("status") == "reselved") {
                    this.$el.addClass("panel-success");
                }
            } 
            if(!online && connected) {
                this.$el.html(this.template({model: this.model}));
                if (this.model.status == "new") {
                    this.$el.addClass("panel-primary");
                }
                if (this.model.status == "open") {
                    this.$el.addClass("panel-info");
                }
                if (this.model.status == "on hold") {
                    this.$el.addClass("panel-danger");
                }
                if (this.model.status == "in progress") {
                    this.$el.addClass("panel-warning");
                }
                if (this.model.status == "reselved") {
                    this.$el.addClass("panel-success");
                }
            }
            
            return this;
        },
        clickDelete: function() {
            var that = this;
            if(online) {
            $.ajax({
                url: "task/delete/" + that.model.get("_id"),
                type: "delete",
                dataType: "json",
                data: {_id: that.model.get("_id")},
                success: function(model){
                    app.func.fetchCollection();
                    if(connected) { deleteValues(that.model.get("_id")); }
                }
            });
            } 
            if(!online && connected) {
                deleteValues(that.model._id);
                app.func.fetchCollection();
            }
        },
        clickUpdate: function() {
            if(online) {
            var status = this.model.get("status");
            this.$(".panel-body").html(app.templates.update({model: this.model.toJSON()}));
            this.$("#status-update [value='"+status+"']").attr("selected", "selected");
            } 
            if(!online && connected){
                var status = this.model.status;
                this.$(".panel-body").html(app.templates.update({model: this.model}));
                this.$("#status-update [value='"+status+"']").attr("selected", "selected");
            }
            clearInterval(intervalID);
        },
        clickSave: function() {
            var that = this;
            if(online) {
            this.model.set({status: this.$("#status-update option:selected").val()});
            this.model.set({text: this.$("#text-update").val()});
            
            $.ajax({
                url: "task/update/" + that.model.get("_id"),
                type: "put",
                dataType: "json",
                data: that.model.toJSON(),
                success: function(model) {
                    that.$("#task-update").remove();
                    that.$("#save").remove();
                    app.func.fetchCollection();
                    intervalID = setInterval(app.func.fetchCollection, 5000);
                    var object = that.model.toJSON();
                    if(connected){updateValues(object._id, object.date, object.time, object.text, object.status);}
                }
            });
            } 
            if(!online && connected){
                var text = this.$("#text-update").val();
                var status = this.$("#status-update option:selected").val();
                var date = this.model.date;
                var time = this.model.time;
                var id = this.model._id;
                if(text != '') {
                that.$("#task-update").remove();
                that.$("#save").remove();
                updateValues(id, date, time, text, status);
                app.func.fetchCollection();
                intervalID = setInterval(app.func.fetchCollection, 5000);
                }
            }
        }
    });
    
    app.views.TaskForm = Backbone.View.extend({
        tagName: "div",
        className: "form-gruop",
        events: {
            "click #add-task": "clickAdd"
        },
        initialize: function() {
            this.template = app.templates.form;
            return this.render();
        },
        render: function() {
            this.$el.empty();
            this.$el.html(this.template());
            return this;
        },
        clickAdd: function() {
            var that = this;
            var text = this.$("#text").val();
            var status = this.$("#status option:selected").val();
            var d = new Date();
            var day = d.getDate();
            var month = d.getMonth()+1;
            var year = d.getFullYear();
            var hours = d.getHours();
            if(hours == 0 || hours < 10) hours = "0" + hours;
            var minutes = d.getMinutes();
            if(minutes == 0 || minutes < 10) minutes = "0" + minutes;
            var date = year + "-" + month + "-" + day;
            var time = hours + ":" + minutes;
            var task = {
                'date': date,
                'time': time,
                'status': status,
                'text': text
            }
            if(online) {
            $.ajax({
                url: "task/add",
                type: "post",
                dataType: "json",
                data: task,
                success: function(model) {
                    if(model.status == "ok") {
                    that.$("#text").val('');
                    app.func.fetchCollection();
                    if(connected){insertValues(model.task._id.$id, model.task.date, model.task.time, model.task.text, model.task.status);}
             
                    }
                    if(model.status == "error") {
                        that.render();
                    }
                }
            });
            }
            if(!online && connected) {
                if(task.text != '') {
                    var d = new Date().getTime();
                    var id = d.toString();
                    insertValues(id, task.date, task.time, task.text, task.status);
                    app.func.fetchCollection();
                    that.$("#text").val('');
                }
            }
        }
    });
    
    app.views.MessageOffline = Backbone.View.extend({
        initialize: function() {
          this.template = app.templates.message;
          return this.render();  
        },
        render: function() {
            this.$el.empty();
            this.$el.html(this.template());
            return this;
        }
    });
    
    if(!online) {
        var message = new app.views.MessageOffline({
            el: $("#offline-message")
        });
    }
    
    var taskForm = new app.views.TaskForm({
        el: $("#form")
    });
    
    app.func.fetchCollection();
      
    var intervalID = setInterval(app.func.fetchCollection, 5000);
});



