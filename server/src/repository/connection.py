import psycopg2


def mk_connection(host="localhost", port="5432", dbname="time_recorder_db", user="timer_master", password="master"):
    connect_info_str = f'host={host} port={port} dbname={dbname} user={user} password={password}'
    connection = psycopg2.connect(connect_info_str)
    return connection
