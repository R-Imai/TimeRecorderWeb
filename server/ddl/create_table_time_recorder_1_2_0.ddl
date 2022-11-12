\encoding UTF-8

create table user_group (
  group_cd varchar(100),
  group_name varchar(4000),
  PRIMARY KEY (group_cd)
);

create table group_user (
  group_cd varchar(100),
  user_cd varchar(100),
  PRIMARY KEY (group_cd, user_cd)
);

create table group_subject (
  group_cd varchar(100),
  subject_id varchar(64),
  name varchar(4000),
  is_active boolean,
  color varchar(4000),
  PRIMARY KEY (group_cd, subject_id)
);

create table group_subject_config (
  group_cd varchar(100),
  subject_id varchar(64),
  user_cd varchar(100),
  color varchar(4000),
  sort_val integer,
  PRIMARY KEY (group_cd, subject_id, user_cd)
);
