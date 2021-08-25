from pydantic import BaseModel
from typing import List, Optional
import datetime

class TaskDetail(BaseModel):
    task_subject: str
    task_name: Optional[str] = ""

class RunningTask(TaskDetail):
    start_time: datetime.datetime

class RecordTask(RunningTask):
    task_id: str
    end_time: datetime.datetime

class SummaryData(TaskDetail):
    passed_minutes: int
    passed_time_str: str

class RegistrationSubject(BaseModel):
    name: str
    color: str
    sort_val: int
    is_active: bool

class SubjectConfigData(RegistrationSubject):
    subject_id: str

class RecordTaskJoinColor(RecordTask):
    color: Optional[str] = None

class GraphSummaryData(BaseModel):
    task_subject: str
    passed_minutes: int
    passed_time_str: str
    color: Optional[str] = None

class ResponceGraphSummary(BaseModel):
    path: str
    data: List[GraphSummaryData]
