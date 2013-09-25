<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Task_model extends CI_Model {

    function get_list() {
        $this->load->library('mongo');
        $item = array();
        $lists = $this->mongo->db->list->find();
        foreach ($lists as $id => $list) {

            $list['_id'] = $id;
            $item[] = $list;
        }

        return $item;
    }

    function save($data) {
        $this->load->library('mongo');
        $this->mongo->db->list->insert($data);
    }
    
    function delete($_id) {
        $task = $this->mongo->db->list->findOne(array('_id' => new MongoID($_id)));
        $output = $this->mongo->db->list->remove(array('_id' => $task['_id']), array('safe' => true));
        return $output;
    }
    
    function update($_id, $data) {
        $criteria = array('_id' => new MongoID($_id));
	$output = $this->mongo->db->list->update($criteria, array('$set' => $data));
        return $output;
    }

}
