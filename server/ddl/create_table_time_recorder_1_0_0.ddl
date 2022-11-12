\encoding UTF-8

create table task_record (
  task_id varchar(64),
  user_cd varchar(100),
  start_time timestamp,
  end_time timestamp,
  task_subject varchar(4000),
  task_name varchar(4000),
  PRIMARY KEY (task_id)
);

create table running_task (
  user_cd varchar(100),
  start_time timestamp,
  task_subject varchar(4000),
  task_name varchar(4000),
  PRIMARY KEY (user_cd)
);

create table task_subject_config (
  subject_id varchar(64),
  user_cd varchar(100),
  name varchar(4000),
  color varchar(4000),
  sort_val integer,
  is_active boolean,
  PRIMARY KEY (subject_id)
);
