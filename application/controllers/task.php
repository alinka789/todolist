<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

require APPPATH . '/libraries/REST_Controller.php';

class Task extends REST_Controller {

    function __construct() {
        parent::__construct();
        $this->load->model('task_model');
    }

    public function list_get($type = NULL) {
        $data['list'] = $this->task_model->get_list();
        if ($type == 'json') {
            $list = json_encode($data['list']);
            echo $list;
            return $list;
        }
        $this->load->library('calendar');
        $this->load->view('task/index', $data);
    }

    public function add_post() {
        $this->load->library('form_validation');
        if ($this->form_validation->run('task') == FALSE) {
            $result = array(
                'status' => 'error',
                'message' => 'This field is required!'
            );
            $result = json_encode($result);
        } else {
            $data['date'] = $this->input->post('date');
            $data['time'] = $this->input->post('time');
            $data['status'] = $this->input->post('status');
            $data['text'] = $this->input->post('text');
            $this->task_model->save($data);
            $result = array(
                'status' => 'ok',
                'task' => $data
            );
            $result = json_encode($result);
        }
        echo $result;
        return $result;
    }

    public function update_put() {
        if (!$this->put('_id')) {
            $this->response(array('error' => 'ID is requered'), 400);
        }
        if ($this->put('text') == '') {
            $this->response(array(
                'status' => 'error',
                'message' => 'This field is empty!'
            ), 404);
        } else {
            $data['date'] = $this->put('date');
            $data['time'] = $this->put('time');
            $data['status'] = $this->put('status');
            $data['text'] = $this->put('text');
            $output = $this->task_model->update($this->put('_id'), $data);
            if ($output) {
                $this->response(array('_id' => $this->put('_id'), 'success' => $output), 200);
            } else {
                $this->response(array('error' => 'Insert error'), 404);
            }
        }
    }

    public function delete_delete() {
        if (!$this->delete('_id')) {
            $this->response(array('error' => 'ID is requered'), 404);
        }
        $output = $this->task_model->delete($this->delete('_id'));
        if ($output['ok'] == 1) {
            $this->response($output, 200);
        } else {
            $this->response(array('error' => 'Insert error'), 404);
        }
    }

}