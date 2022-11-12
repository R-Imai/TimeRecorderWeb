import datetime
from typing import List, Tuple, Optional

from ..model import TimeRecorderModel as model

class TimeRecorderRepository:
    def __init__(self):
        self.sql_get_running_task = """
            SELECT
                start_time,
                task_subject,
                task_name
            FROM
                running_task
            WHERE
                user_cd = %s;
            """
        self.sql_set_running_task = "INSERT INTO running_task (user_cd, start_time, task_subject, task_name) VALUES (%(user_cd)s, %(start_time)s, %(task_subject)s, %(task_name)s);"
        self.sql_update_running_task = """
            UPDATE running_task
            SET start_time=%(start_time)s,
                task_subject=%(task_subject)s,
                task_name=%(task_name)s
            WHERE user_cd=%(user_cd)s;
            """
        self.sql_delete_running_task = "DELETE FROM running_task WHERE user_cd = %s;"
        self.sql_insert_task_record = "INSERT INTO task_record (task_id, user_cd, start_time, end_time, task_subject, task_name) VALUES (%(task_id)s, %(user_cd)s, %(start_time)s, %(end_time)s, %(task_subject)s, %(task_name)s);"
        self.sql_get_task_records = """
            SELECT
                task_id,
                start_time,
                end_time,
                task_subject,
                task_name
            FROM
                task_record
            WHERE user_cd = %(user_cd)s
                AND %(start_time)s <= start_time
                AND start_time <= %(end_time)s
            ORDER BY start_time ASC;
            """
        self.sql_update_task_record = """
            UPDATE task_record
            SET start_time=%(start_time)s,
                end_time=%(end_time)s,
                task_subject=%(task_subject)s,
                task_name=%(task_name)s
            WHERE task_id=%(task_id)s;
            """
        self.sql_get_task_record_by_id = "SELECT user_cd, task_id, start_time, end_time, task_subject, task_name FROM task_record WHERE task_id=%s;"
        self.sql_set_task_subject = "INSERT INTO task_subject_config (subject_id, user_cd, name, color, sort_val, is_active) VALUES (%(subject_id)s, %(user_cd)s, %(name)s, %(color)s, %(sort_val)s, %(is_active)s);"
        self.sql_get_task_subject_by_active = """
            SELECT
                subject_id,
                name,
                color,
                sort_val,
                is_active
            FROM
                task_subject_config
            WHERE user_cd = %(user_cd)s
                AND is_active = %(is_active)s
            ORDER BY sort_val ASC
            """
        self.sql_get_task_subject_all = """
            SELECT
                subject_id,
                name,
                color,
                sort_val,
                is_active
            FROM
                task_subject_config
            WHERE user_cd = %s
            ORDER BY sort_val ASC
            """
        self.sql_get_task_subject_by_id = """
            SELECT
                user_cd,
                subject_id,
                name,
                color,
                sort_val,
                is_active
            FROM
                task_subject_config
            WHERE subject_id = %s
            """
        self.sql_update_task_subject = """
            UPDATE task_subject_config
            SET
                name = %(name)s,
                color = %(color)s,
                sort_val = %(sort_val)s,
                is_active = %(is_active)s
            WHERE subject_id = %(subject_id)s
            """
        self.sql_get_task_records_join_color = """
            SELECT
              task_id,
              start_time,
              end_time,
              task_subject,
              task_name,
              color
            FROM
              task_record
              LEFT OUTER JOIN task_subject_config
                ON task_subject = name
                AND task_subject_config.user_cd = %(user_cd)s
            WHERE task_record.user_cd = %(user_cd)s
                AND %(start_time)s <= start_time
                AND start_time <= %(end_time)s;
            """
        self.sql_get_task_subject_between_sort_val = """
            SELECT
                subject_id,
                name,
                color,
                sort_val,
                is_active
            FROM
                task_subject_config
            WHERE user_cd = %(user_cd)s
            AND %(start_sort)s <= sort_val
            AND sort_val <= %(end_sort)s
            ORDER BY sort_val ASC
            """
        self.sql_get_task_subject_start_sort_val = """
            SELECT
                subject_id,
                name,
                color,
                sort_val,
                is_active
            FROM
                task_subject_config
            WHERE user_cd = %(user_cd)s
            AND %(start_sort)s <= sort_val
            ORDER BY sort_val ASC
            """
        self.sql_delete_subject = "DELETE FROM task_subject_config WHERE user_cd = %(user_cd)s AND subject_id = %(subject_id)s;"
        self.sql_get_task_records_group = """
            SELECT
              task_record.task_id,
              task_record.start_time,
              task_record.end_time,
              task_record.task_subject,
              task_record.task_name
            FROM
              task_record
              LEFT OUTER JOIN group_user
                ON group_user.user_cd = task_record.user_cd
            WHERE group_user.group_cd = %(group_cd)s
                AND %(start_time)s <= task_record.start_time
                AND task_record.start_time <= %(end_time)s;
            """
        self.sql_add_group = "INSERT INTO user_group (group_cd, group_name) VALUES (%(group_cd)s, %(group_name)s)"
        self.sql_get_group = "SELECT group_cd, group_name FROM user_group WHERE group_cd = %(group_cd)s"
        self.sql_add_group_user = "INSERT INTO group_user (group_cd, user_cd) VALUES (%(group_cd)s, %(user_cd)s)"
        self.sql_add_group_subject = "INSERT INTO group_subject (group_cd, subject_id, name, is_active, color) VALUES (%(group_cd)s, %(subject_id)s, %(name)s, %(is_active)s, %(color)s)"
        self.sql_get_group_subjects = """
            SELECT
                subject_id,
                name,
                is_active,
                color
            FROM
                group_subject
            WHERE
                group_cd = %(group_cd)s
            """

    def get_running_task(self, cur, user_cd: str) -> model.RunningTask:
        cur.execute(self.sql_get_running_task, (user_cd,))
        res = cur.fetchone()
        if res is None:
            return None
        return model.RunningTask(start_time = res[0], task_subject = res[1], task_name = res[2])

    def set_running_task(self, cur, user_cd: str, task: model.RunningTask) -> None:
        query_param = dict(
            user_cd = user_cd,
            start_time = task.start_time,
            task_subject = task.task_subject,
            task_name = task.task_name,
        )
        cur.execute(self.sql_set_running_task, query_param)

    def update_running_task(self, cur, user_cd: str, task: model.RunningTask) -> None:
        query_param = dict(
            user_cd = user_cd,
            start_time = task.start_time,
            task_subject = task.task_subject,
            task_name = task.task_name,
        )
        cur.execute(self.sql_update_running_task, query_param)

    def delete_running_task(self, cur, user_cd) -> None:
        cur.execute(self.sql_delete_running_task, (user_cd,))

    def insert_task_record(self, cur, user_cd:str, task: model.RecordTask) -> None:
        query_param = dict(
            task_id = task.task_id,
            user_cd = user_cd,
            start_time = task.start_time,
            end_time = task.end_time,
            task_subject = task.task_subject,
            task_name = task.task_name,
        )
        cur.execute(self.sql_insert_task_record, query_param)

    def get_task_records(self, cur, user_cd:str, start_time:datetime.datetime, end_time:datetime.datetime) -> List[model.RecordTask]:
        query_param = dict(
            user_cd = user_cd,
            start_time = start_time,
            end_time = end_time
        )
        cur.execute(self.sql_get_task_records, query_param)
        rows = cur.fetchall()
        return list(map(lambda x: model.RecordTask(task_id=x[0], start_time=x[1], end_time=x[2], task_subject=x[3], task_name=x[4]), rows))

    def update_task_record(self, cur, task: model.RecordTask):
        query_param = dict(
            task_id = task.task_id,
            start_time = task.start_time,
            end_time = task.end_time,
            task_subject = task.task_subject,
            task_name = task.task_name,
        )
        cur.execute(self.sql_update_task_record, query_param)

    def get_task_record_by_id(self, cur, id) -> Tuple[str, model.RecordTask]:
        cur.execute(self.sql_get_task_record_by_id, (id,))
        res = cur.fetchone()
        if res is None:
            return None
        return (res[0], model.RecordTask(task_id=res[1], start_time=res[2], end_time=res[3], task_subject=res[4], task_name=res[5]))

    def set_task_subject(self, cur, user_cd:str, data:model.SubjectConfigData):
        query_param = dict(
            subject_id = data.subject_id,
            user_cd = user_cd,
            name = data.name,
            color = data.color,
            sort_val = data.sort_val,
            is_active = data.is_active
        )
        cur.execute(self.sql_set_task_subject, query_param)

    def get_task_subject_by_active(self, cur, user_cd:str, is_active:bool):
        query_param = dict(
            user_cd = user_cd,
            is_active = is_active
        )
        cur.execute(self.sql_get_task_subject_by_active, query_param)
        rows = cur.fetchall()
        return list(map(lambda x: model.SubjectConfigData(subject_id=x[0], name=x[1], color=x[2], sort_val=x[3], is_active=x[4]), rows))

    def get_task_subject_all(self, cur, user_cd:str):
        cur.execute(self.sql_get_task_subject_all, (user_cd,))
        rows = cur.fetchall()
        return list(map(lambda x: model.SubjectConfigData(subject_id=x[0], name=x[1], color=x[2], sort_val=x[3], is_active=x[4]), rows))

    def get_task_subject_by_id(self, cur, id) -> Tuple[str, model.RecordTask]:
        cur.execute(self.sql_get_task_subject_by_id, (id,))
        res = cur.fetchone()
        if res is None:
            return None
        return (res[0], model.SubjectConfigData(subject_id=res[1], name=res[2], color=res[3], sort_val=res[4], is_active=res[5]))

    def update_task_subject(self, cur, subj_data: model.SubjectConfigData):
        query_param = dict(
            name = subj_data.name,
            color = subj_data.color,
            sort_val = subj_data.sort_val,
            is_active = subj_data.is_active,
            subject_id = subj_data.subject_id
        )
        cur.execute(self.sql_update_task_subject, query_param)

    def get_task_records_join_color(self, cur, user_cd:str, start_time:datetime.datetime, end_time:datetime.datetime) -> List[model.RecordTaskJoinColor]:
        query_param = dict(
            user_cd = user_cd,
            start_time = start_time,
            end_time = end_time
        )
        cur.execute(self.sql_get_task_records_join_color, query_param)
        rows = cur.fetchall()
        return list(map(lambda x: model.RecordTaskJoinColor(task_id=x[0], start_time=x[1], end_time=x[2], task_subject=x[3], task_name=x[4], color=x[5]), rows))

    def get_task_subject_between_sort_val(self, cur, user_cd:str, start_sort: int, end_sort: Optional[int] = None) -> List[model.SubjectConfigData]:
        query_param = dict(
            user_cd = user_cd,
            start_sort = start_sort,
            end_sort = end_sort
        )
        execute_sql = self.sql_get_task_subject_start_sort_val if end_sort is None else self.sql_get_task_subject_between_sort_val
        cur.execute(execute_sql, query_param)
        rows = cur.fetchall()
        return list(map(lambda x: model.SubjectConfigData(subject_id=x[0], name=x[1], color=x[2], sort_val=x[3], is_active=x[4]), rows))

    def delete_subject(self, cur, user_cd, subject_id):
        query_param = dict(
            user_cd = user_cd,
            subject_id = subject_id
        )
        cur.execute(self.sql_delete_subject, query_param)

    def get_task_records_group(self, cur, group_cd:str, start_time:datetime.datetime, end_time:datetime.datetime) -> List[model.RecordTaskJoinColor]:
        query_param = dict(
            group_cd = group_cd,
            start_time = start_time,
            end_time = end_time
        )
        cur.execute(self.sql_get_task_records_group, query_param)
        rows = cur.fetchall()
        return list(map(lambda x: model.RecordTaskJoinColor(task_id=x[0], start_time=x[1], end_time=x[2], task_subject=x[3], task_name=x[4]), rows))

    def add_group(self, cur, group_cd: str, group_name: str) -> None:
        query_param = dict(
            group_cd = group_cd,
            group_name = group_name
        )
        cur.execute(self.sql_add_group, query_param)

    def add_group_user(self, cur, group_cd: str, user_cd: str) -> None:
        query_param = dict(
            group_cd = group_cd,
            user_cd = user_cd
        )
        cur.execute(self.sql_add_group_user, query_param)
    
    def add_group_subject(self, cur, group_cd: str, subject_id: str, name: str, is_active: bool, color: str) -> None:
        query_param = dict(
            group_cd = group_cd,
            subject_id = subject_id,
            name = name,
            is_active = is_active,
            color = color
        )
        cur.execute(self.sql_add_group_subject, query_param)
    
    def get_group_subjects(self, cur, group_cd: str) -> List[model.GroupSubject]:
        query_param = dict(
            group_cd = group_cd
        )
        cur.execute(self.sql_get_group_subjects, query_param)
        rows = cur.fetchall()
        return list(map(lambda x: model.GroupSubject(subject_id=x[0], name=x[1], is_active=x[2], color=x[3]), rows))
