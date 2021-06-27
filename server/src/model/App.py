from pydantic import BaseModel

class AppInfo(BaseModel):
    name: str = "dailyProgress-calculation-web"
    version: str
    description: str = "This is an api that measures and calculates daily work time."
