<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Todolist extends CI_Controller {
    
    public function index() {
        $this->load->view('todolist/index');
    }
    

}
