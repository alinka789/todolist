<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Todo list</title>
        <link href="<?= base_url()?>assets/public/bootstrap/css/bootstrap.css" rel="stylesheet">
        <link href="<?= base_url()?>assets/public/bootstrap/css/bootstrap-theme.css" rel="stylesheet">
        <link href="<?= base_url()?>assets/public/bootstrap/css/datepicker.css" rel="stylesheet">
        <script type="text/javascript" src="<?= base_url()?>assets/public/javascripts/jquery-2.0.3.js"></script>
        <script type="text/javascript" src="<?= base_url()?>assets/public/bootstrap/js/bootstrap.js"></script>
        <script type="text/javascript" src="<?= base_url()?>assets/public/bootstrap/js/bootstrap-datepicker.js"></script>
    </head>
    <body>

        <div class="container">
            <div class="navbar navbar-inverse">
                <div class="">
                    <span class="navbar-brand"><h1>Your best todo list!</h1></span>
                </div>
            </div>
            <div class="container">
            <a class="btn btn-primary btn-lg" href="<?=  base_url()?>tasks">List of tasks</a>
            </div>
        </div>
    </body>
</html>
