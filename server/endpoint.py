from fastapi import FastAPI, HTTPException, Response, Cookie
from starlette.middleware.cors import CORSMiddleware
from typing import List, Tuple, Optional
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse, FileResponse
from starlette.staticfiles import StaticFiles
from datetime import date
import traceback

from src.model import TimeRecorderModel as tr_model
from src.model import AuthModel as auth_model
from src.model import App as app_model
from src.service.TimeRecorderService import TimeRecorderService
from src.service.AuthService import AuthService
from src.constant import STORAGE_PATH
from src.exception import RecorderException, AuthenticationException


app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://192.168.1.20"
    "http://192.168.1.18"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/storage", StaticFiles(directory=STORAGE_PATH), name="storage")

recorder_service = TimeRecorderService()
auth_service = AuthService()

def __mk_responce_json(model):
    json_model = jsonable_encoder(model)
    return JSONResponse(content=json_model)

def __auth_token(token: str):
    try :
        if token is None:
            raise AuthenticationException("ログインが必要です")
        user_cd = auth_service.auth_token(token)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return user_cd

# ルート
@app.get("/api/", response_model=app_model.AppInfo)
def root():
    info = app_model.AppInfo(version="0.0.1")
    info_jsonvalue = jsonable_encoder(info)
    return JSONResponse(content=info_jsonvalue)

#### ==== Auth ==== ####

@app.post("/api/user", tags=["Auth"])
def user_register(user_info: auth_model.RegisterMasterModel):
    try:
        auth_service.register_user(user_info)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

@app.get("/api/user", response_model=auth_model.Master, tags=["Auth"])
def get_user(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        user_info = auth_service.get_user_info(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(user_info)

@app.post("/api/login", tags=["Auth"])
def login(login_info: auth_model.LoginModel, response: Response):
    try:
        token = auth_service.login(login_info)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    response.set_cookie(key="TOKEN", value=token)
    return None

@app.post("/api/logout", tags=["Auth"])
def logout(response: Response, TOKEN: Optional[str] = Cookie(None)):
    try:
        auth_service.logout(TOKEN)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    response.delete_cookie(key="TOKEN")
    return None

@app.post("/api/password", tags=["Auth"])
def password_update(update_info: auth_model.PasswordUpdate, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        auth_service.update_password(user_cd, update_info)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return None

#### ==== Time Recorder Web ==== ####

# 日報計算
@app.get("/api/calc/daily", response_model=List[tr_model.SummaryData], tags=["TimeRecorder"])
def calc_daily(date: date, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        summary_data = recorder_service.calc_daily_summary(user_cd, date)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(summary_data)

# 今日の日報計算
@app.get("/api/calc/daily/today", response_model=List[tr_model.SummaryData], tags=["TimeRecorder"])
def calc_daily_today(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        summary_data = recorder_service.calc_daily_summary_today(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(summary_data)

# タスク開始
@app.post("/api/record/running", response_model=tr_model.RunningTask, tags=["TimeRecorder"])
def job_start(post_param: tr_model.TaskDetail, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        start_info: tr_model.RunningTask = recorder_service.start(user_cd, post_param)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(start_info)

# タスクキャンセル
@app.delete("/api/record/running", tags=["TimeRecorder"])
def job_cancel(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        recorder_service.cancel(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

# 実行中タスク取得
@app.get("/api/record/running", response_model=tr_model.RunningTask, tags=["TimeRecorder"])
def job_get(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        record: tr_model.RunningTask = recorder_service.get_running_task(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(record)

# 実行中タスク編集
@app.put("/api/record/running", tags=["TimeRecorder"])
def job_edit(post_param: tr_model.RunningTask, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        recorder_service.update_running_task(user_cd, post_param)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

# タスク完了
@app.post("/api/record/end", tags=["TimeRecorder"])
def job_end(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        recorder_service.end(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

# 今日のタスク履歴取得
@app.get("/api/record/today", response_model=List[tr_model.RecordTask], tags=["TimeRecorder"])
def record_get(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        records = recorder_service.get_today_record(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(records)

# タスク履歴取得
@app.get("/api/record", response_model=List[tr_model.RecordTask], tags=["TimeRecorder"])
def get_task_record(date: date, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        records = recorder_service.get_task_record(user_cd, date)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(records)

# タスク修正
@app.put("/api/record/task", tags=["TimeRecorder"])
def record_edit(post_param: tr_model.RecordTask, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        recorder_service.update_task_record(user_cd, post_param)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

# 画像保存
@app.post("/api/graph", response_model=tr_model.ResponceGraphSummary, tags=["TimeRecorder"])
def graph_save(target:date, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        path, data = recorder_service.save_month_graph(user_cd, target)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(tr_model.ResponceGraphSummary(path = path, data = data))

# カテゴリ全取得
@app.get("/api/setting/subject", response_model=List[tr_model.SubjectConfigData], tags=["TimeRecorder"])
def subject_config(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        subject_data = recorder_service.get_task_subject(user_cd)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(subject_data)

# 有効なカテゴリ全取得
@app.get("/api/setting/subject/active", response_model=List[tr_model.SubjectConfigData], tags=["TimeRecorder"])
def subject_config(TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        subject_data = recorder_service.get_task_subject(user_cd, True)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return __mk_responce_json(subject_data)

# カテゴリ登録
@app.post("/api/setting/subject", tags=["TimeRecorder"])
def add_subject(post_param: tr_model.RegistrationSubject, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try:
        recorder_service.add_task_subject(user_cd, post_param)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

# カテゴリ更新
@app.put("/api/setting/subject", tags=["TimeRecorder"])
def subject_config(data: tr_model.SubjectConfigData, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try :
        recorder_service.update_task_subject(user_cd, data)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

# カテゴリ削除
@app.delete("/api/setting/subject", tags=["TimeRecorder"])
def delete_subject(subject_id: str, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try :
        recorder_service.delete_subject(user_cd, subject_id)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )

@app.get("/api/export/record/csv", tags=["TimeRecorder"])
def csv_download(start_date: date, end_date: date, TOKEN: Optional[str] = Cookie(None)):
    user_cd = __auth_token(TOKEN)
    try :
        path = recorder_service.csv_download(user_cd, start_date, end_date)
    except RecorderException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        )
    except Exception as e1:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="予期せぬエラーが発生しました。",
        )
    return FileResponse(path, filename=f"{user_cd}-{start_date.year}_{start_date.month}_{start_date.day}-{end_date.year}_{end_date.month}_{end_date.day}.csv")
