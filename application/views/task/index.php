<!DOCTYPE html>
<html lang="en" manifest="todolist.manifest">
    <head>
        <meta charset="utf-8">
        <title>Todo list</title>
        <link href="<?= base_url() ?>assets/public/bootstrap/css/bootstrap.css" rel="stylesheet">
        <link href="<?= base_url() ?>assets/public/bootstrap/css/bootstrap-theme.css" rel="stylesheet">
        <link href="<?= base_url() ?>assets/public/bootstrap/css/datepicker.css" rel="stylesheet">
        <script type="text/javascript" src="<?= base_url() ?>assets/public/javascripts/jquery-2.0.3.js"></script>
        <script type="text/javascript" src="<?= base_url() ?>assets/public/bootstrap/js/bootstrap.js"></script>
        <script type="text/javascript" src="<?= base_url() ?>assets/public/bootstrap/js/bootstrap-datepicker.js"></script>
        <script type="text/javascript" src="<?= base_url() ?>assets/public/javascripts/underscore.js"></script>
        <script type="text/javascript" src="<?= base_url() ?>assets/public/javascripts/backbone.js"></script>
        <script type="text/javascript" src="<?= base_url() ?>assets/public/javascripts/online.js"></script>
        <script type="text/javascript" src="<?= base_url() ?>assets/public/javascripts/todolist.js"></script>
    </head>
    <body>

        <div class="container">
            <div class="navbar navbar-inverse">
                <div class="">
                    <span class="navbar-brand"><h1>Your best todo list!</h1></span>
                </div>
            </div>
            <div id="offline-message">
            </div>
            <div id="modified" class="col-lg-12">
            
            </div>
            <div class="col-lg-12">
                <div class="col-lg-4" id="form">
                </div>
                <div class="col-lg-8" id="item">
                </div>
            </div>	
        </div>
        
        <script type="text/html" id="template-item">
            <div class="panel-heading">
            <%= model.date + "/" + model.time %>
            <div class="pull-right">
            <span class="label label-info"><%= model.status %></span>
            <span class="btn"><i class="glyphicon glyphicon-pencil" id="update"></i></span>
            <span class="btn"><i class="glyphicon glyphicon-trash" id="delete"></i></span>
            </div>
            </div>
            <div class="panel-body">
            <%= model.text.replace(/([^>])\n/g, '$1<br/>') %>
            <div class="update-task"></div>
            </div>
        </script>
        <script type="text/html" id="template-form">
            <form class="form-group" name="task" id="task">
            <textarea class="form-control field-reqiered" name="text" id="text" rows="3" placeholder="What to do?" value="<?= set_value('text') ?>"></textarea>
            <select class="form-control" id="status">
            <option value="new" selected>New</option>
            <option value="open">Open</option>
            <option value="on hold">On hold</option>
            <option value="in progress">In progress</option>
            </select> 
            </form>
            <button class="btn btn-primary pull-right" id="add-task">Add</button>
        </script>
        <script type="text/html" id="template-form-update">
            <form class="form-group" name="task" id="task-update">
            <textarea class="form-control field-reqiered" name="text" id="text-update" rows="2"><%= model.text %></textarea>
            <select class="form-control" id="status-update">
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="on hold">On hold</option>
            <option value="in progress">In progress</option>
            <option value="reselved">Reselved</option>
            </select> 
            </form>
            <button class="btn btn-primary pull-right" id="save">Save</button>
        </script>
        <script type="text/html" id="template-message-offline">
            <div class="alert alert-warning">
            No access to the network and you are working offline!
            <a class="close" data-dismiss="alert" href="#" aria-hidden="true">&times;</a>
            </div>
        </script>
        <script type="text/html" id="template-modified-task">
            <div class="panel-heading">

            <h4 class="text-info">A modified version of the task.</h4>
            <%= model.date + "/" + model.time %>
            <div class="pull-right">
            <span class="label label-info"><%= model.status %></span>

            </div>
            </div>
            <div class="panel-body">
            <%= model.text.replace(/([^>])\n/g, '$1<br/>') %>
            <div class="pull-right" id="btn">
            <button class="btn btn-success" id="save-modified">Save</button>
            </div>
            </div>
        </script>
        <script type="text/html" id="template-previous-task">
            <div class="panel-heading">

            <h4 class="text-info">The previous version of the task.</h4>
            <%= model.date + "/" + model.time %>
            <div class="pull-right">
            <span class="label label-info"><%= model.status %></span>

            </div>
            </div>
            <div class="panel-body">
            <%= model.text.replace(/([^>])\n/g, '$1<br/>') %>
            </div>
        </script>
         <script type="text/html" id="template-deleted-task">
            <div class="panel-heading">
            <h4 class="text-info">This task has been removed or added to another user, but is not on your list. Click "Ok" to delete the task and the "Close" to leave the task.</h4>
            <%= model.date + "/" + model.time %>
            <div class="pull-right">
            <span class="label label-info"><%= model.status %></span>

            </div>
            </div>
            <div class="panel-body">
            <%= model.text.replace(/([^>])\n/g, '$1<br/>') %>
            <div class="pull-right" id="btn-deleted">
            <button class="btn btn-success" id="save-deleted">Ok</button>
            <button class="btn btn-danger" id="close-deleted">Close</button>
            </div>
            </div>
        </script>
    </body>
</html>