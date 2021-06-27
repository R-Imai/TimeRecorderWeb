\encoding UTF-8

create table user_master (
  user_cd varchar(100),
  name varchar(4000),
  image bytea,
  PRIMARY KEY (user_cd)
);

create table user_auth (
  user_cd varchar(100),
  password varchar(64),
  PRIMARY KEY (user_cd)
);

create table active_token (
  token varchar(64),
  user_cd varchar(100),
  limit_date timestamp,
  PRIMARY KEY (token)
);
