import os
import uuid
import pandas as pd
from typing import List, Tuple
from datetime import date
from datetime import datetime
from datetime import timedelta

from dateutil.relativedelta import relativedelta

import matplotlib
matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm

from ..model import TimeRecorderModel as model
from ..repository import TimeRecorderRepository as repository
from ..repository import connection
from ..constant import STORAGE_PATH
from ..exception import AlreadyExistExeption, AuthenticationException, NotFoundException

DAY_CHANGE_HOUR = 5

class TimeRecorderService:
    def __init__(self):
        self.repository = repository.TimeRecorderRepository()

    def __timedelta2str(self, td: timedelta) -> str:
        hours, minsec = divmod(td.total_seconds(), 3600)
        min, sec = divmod(minsec, 60)
        return f"{int(hours)}h{int(min)}m"


    def __calc_summary_data(self, records: List[model.RecordTask]) -> List[model.SummaryData]:
        df = pd.DataFrame(list(map(lambda r: vars(r), records)))
        df["passed_time"] = df["end_time"] - df["start_time"]
        group = df.groupby(["task_name", "task_subject"])
        summary_df = group.sum()[["passed_time"]]
        ret_data = [model.SummaryData(task_subject=index[0], task_name=index[1], passed_second=row.passed_time.total_seconds(), passed_time_str=self.__timedelta2str(row.passed_time)) for index, row in summary_df.iterrows()]
        return ret_data

    def __calc_graph_data(self, records: List[model.RecordTaskJoinColor]) -> List[model.GraphSummaryData]:
        df = pd.DataFrame(list(map(lambda r: vars(r), records))).drop("task_name", axis=1)
        df["passed_time"] = df["end_time"] - df["start_time"]
        df = df.fillna({"color": ""})
        group = df.groupby(["task_subject", "color"])
        summary_df = group.sum()[["passed_time"]].sort_values("passed_time", ascending=False)
        ret_data = [model.GraphSummaryData(task_subject=index[0], color=index[1] if index[1] != "" else None, passed_second=row.passed_time.total_seconds(), passed_time_str=self.__timedelta2str(row.passed_time)) for index, row in summary_df.iterrows()]
        return ret_data

    def __hex2color(self, hex_c):
        return [int(hex_c[1:3],16)/256.0,int(hex_c[3:5],16)/256.0,int(hex_c[5:7],16)/256.0,1]

    def __plot_data(self, summary_data: List[model.GraphSummaryData], save_path:str):
        label = []
        data = []
        colors = [None for i in range(len(summary_data))]

        for i, elem in enumerate(summary_data):
            label.append("{0} [{1}]".format(elem.task_subject, elem.passed_time_str))
            data.append(elem.passed_second)
            if elem.color is not None:
                colors[i] = self.__hex2color(elem.color)

        no_color_lange = colors.count(None)
        cmap = cm.gist_rainbow(np.arange(no_color_lange)/float(no_color_lange))

        cnt = 0
        for i, elem in enumerate(colors):
            if elem is None:
                colors[i] = cmap[cnt]
                cnt += 1

        plt.rcParams['font.family'] = 'Yu Mincho'
        plt.figure(figsize=(18, 10))
        plt.pie(data,counterclock=False,startangle=90,autopct=lambda p:'{:.1f}%'.format(p), colors=colors)
        plt.subplots_adjust(left=0,right=0.7)
        plt.legend(label, fancybox=True, loc='upper left', bbox_to_anchor=(0.83, 1))
        plt.axis('equal')
        plt.savefig(save_path)
        plt.clf()

    def start(self, user_cd: str, taskDetail: model.TaskDetail) -> None:
        start_time = datetime.now().replace(second = 0, microsecond = 0)
        running_task = model.RunningTask(start_time = start_time, task_subject = taskDetail.task_subject, task_name = taskDetail.task_name);
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_task = self.repository.get_running_task(cur, user_cd)
                if current_task is not None:
                    raise AlreadyExistExeption("既に開始済みのタスクが存在します。")
                self.repository.set_running_task(cur, user_cd, running_task)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        return running_task


    def end(self, user_cd) -> None:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_task = self.repository.get_running_task(cur, user_cd)
                if current_task is None:
                    raise NotFoundException("開始済みのタスクがありませんでした。")
                task_id = str(uuid.uuid4())[-12:]
                end_time = datetime.now().replace(second = 0, microsecond = 0)
                task_info = model.RecordTask(task_id = task_id, start_time = current_task.start_time, end_time = end_time, task_subject = current_task.task_subject, task_name = current_task.task_name)
                self.repository.insert_task_record(cur, user_cd, task_info)
                self.repository.delete_running_task(cur, user_cd)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def cancel(self, user_cd) -> None:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_task = self.repository.get_running_task(cur, user_cd)
                if current_task is None:
                    raise NotFoundException("開始済みのタスクがありませんでした。")
                self.repository.delete_running_task(cur, user_cd)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_running_task(self, user_cd: str) -> model.RunningTask:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_task: model.RunningTask = self.repository.get_running_task(cur, user_cd)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        return current_task

    def update_running_task(self, user_cd: str, runningTask: model.RunningTask) -> None:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_task = self.repository.get_running_task(cur, user_cd)
                if current_task is None:
                    raise NotFoundException("開始済みのタスクがありませんでした。")
                self.repository.update_running_task(cur, user_cd, runningTask)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_today_record(self, user_cd) -> List[model.RecordTask]:
        now = datetime.now()
        day = now.day if now.hour > DAY_CHANGE_HOUR else (now - timedelta(days = 1)).day
        start_time = now.replace(day = day, hour = DAY_CHANGE_HOUR, minute = 0, second = 0, microsecond = 0)
        end_time = now.replace(day = day + 1, hour = DAY_CHANGE_HOUR, minute = 0, second = 0, microsecond = 0)
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                records = self.repository.get_task_records(cur, user_cd, start_time, end_time)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        return records

    def update_task_record(self, user_cd:str, task:model.RecordTask) -> None:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                res = self.repository.get_task_record_by_id(cur, task.task_id)
                if res is None:
                    raise NotFoundException("該当タスクがありませんでした。")
                task_user_cd, _ = res
                if task_user_cd != user_cd:
                    raise IllegalArgumentException("不正な変更です。")
                self.repository.update_task_record(cur, task)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def calc_daily_summary(self, user_cd:str, target_date: date) -> List[model.SummaryData]:
        start_time = datetime(target_date.year, target_date.month, target_date.day, hour = DAY_CHANGE_HOUR)
        end_time = datetime(target_date.year, target_date.month,  target_date.day + 1, hour = DAY_CHANGE_HOUR)
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                records: List[model.RecordTask] = self.repository.get_task_records(cur, user_cd, start_time, end_time)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

        return self.__calc_summary_data(records)

    def add_task_subject(self, user_cd:str, param:model.RegistrationSubject) -> None:
        id = task_id = str(uuid.uuid4())[-12:]
        subj_data = model.SubjectConfigData(subject_id=id, name=param.name, color=param.color, sort_val=param.sort_val, is_active=param.is_active)
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                self.repository.set_task_subject(cur, user_cd, subj_data)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_task_subject(self, user_cd:str, is_active:bool = None) -> List[model.SubjectConfigData]:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                subj_data = self.repository.get_task_subject_all(cur, user_cd) if is_active is None else self.repository.get_task_subject_by_active(cur, user_cd, is_active)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

        return subj_data

    def update_task_subject(self, user_cd:str, subj_data: model.SubjectConfigData) -> None:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                res = self.repository.get_task_subject_by_id(cur, subj_data.subject_id)
                if res is None:
                    raise NotFoundException("該当レコードがありませんでした。")
                subj_user_cd, _ = res
                if subj_user_cd != user_cd:
                    raise IllegalArgumentException("不正な変更です。")
                self.repository.update_task_subject(cur, subj_data)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def save_month_graph(self, user_cd:str, target:date) -> Tuple[str, List[model.GraphSummaryData]]:
        start_time = datetime(year = target.year, month = target.month, day = 1, hour = DAY_CHANGE_HOUR, minute = 0, second = 0, microsecond = 0)
        end_time = (start_time + relativedelta(months = 1)).replace(day = 1, hour = DAY_CHANGE_HOUR, minute = 0, second = 0, microsecond = 0)
        return self.save_graph(user_cd, start_time, end_time)

    def save_graph(self, user_cd:str, start_time:datetime, end_time:datetime) -> Tuple[str, List[model.GraphSummaryData]]:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                records = self.repository.get_task_records_join_color(cur, user_cd, start_time, end_time)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        summary_data = self.__calc_graph_data(records)
        filename = f"{start_time.year}_{start_time.month}_{start_time.day}-{end_time.year}_{end_time.month}_{end_time.day}.png"
        save_dir = f"{STORAGE_PATH}/graph/{user_cd}"
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        save_path = f"{save_dir}/{filename}"
        self.__plot_data(summary_data, save_path)
        return (save_path, summary_data)
