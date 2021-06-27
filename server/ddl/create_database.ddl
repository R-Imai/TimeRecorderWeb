CREATE ROLE timer_master WITH LOGIN PASSWORD 'master';
CREATE DATABASE time_recorder_db OWNER = timer_master;
