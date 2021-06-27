from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Master(BaseModel):
    user_cd: str
    name: str
    image: Optional[str]

class RegisterMasterModel(Master):
    password: str

class LoginModel(BaseModel):
    user_cd: str
    password: str

class ActiveToken(BaseModel):
    token: str
    limit_date: datetime
