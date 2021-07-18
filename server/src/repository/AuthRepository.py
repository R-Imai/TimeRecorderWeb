from datetime import datetime
from typing import List, Tuple

from ..model import AuthModel as model

class AuthRepository:
    def __init__(self):
        self.sql_set_user_master = "INSERT INTO user_master (user_cd, name, image) VALUES (%(user_cd)s, %(name)s, %(image)s);"
        self.sql_set_user_auth = "INSERT INTO user_auth (user_cd, password) VALUES (%(user_cd)s, %(password)s);"
        self.sql_get_user_master = "SELECT user_cd, name, image FROM user_master WHERE user_cd=%s;"
        self.sql_get_user_auth = "SELECT password FROM user_auth WHERE user_cd=%s;"
        self.sql_set_active_token = "INSERT INTO active_token (token, user_cd, limit_date) VALUES (%(token)s, %(user_cd)s, %(limit_date)s);"
        self.sql_get_active_token = "SELECT user_cd, limit_date FROM active_token WHERE token=%s;"
        self.sql_delete_active_token = "DELETE FROM active_token WHERE token=%s;"
        self.sql_delete_outdate_active_token = "DELETE FROM active_token WHERE limit_date < %s;"
        self.sql_update_password = "UPDATE user_auth SET password=%(password)s WHERE user_cd=%(user_cd)s;"

    def set_user_master(self, cur, data:model.Master):
        query_param = dict(
            user_cd = data.user_cd,
            name = data.name,
            image = data.image
        )
        cur.execute(self.sql_set_user_master, query_param)

    def set_user_auth(self, cur, user_cd:str, password:str):
        query_param = dict(
            user_cd = user_cd,
            password = password
        )
        cur.execute(self.sql_set_user_auth, query_param)

    def get_user_master(self, cur, user_cd:str) -> model.Master:
        cur.execute(self.sql_get_user_master, (user_cd,))
        res = cur.fetchone()
        if res is None:
            return None
        return model.Master(user_cd = res[0], name = res[1], image = res[2].tobytes() if res[2] is not None else None)

    def get_user_auth(self, cur, user_cd:str) -> str:
        cur.execute(self.sql_get_user_auth, (user_cd,))
        res = cur.fetchone()
        if res is None:
            return None
        return res[0]

    def set_active_token(self, cur, user_cd:str, token: model.ActiveToken):
        query_param = dict(
            user_cd = user_cd,
            token = token.token,
            limit_date = token.limit_date
        )
        cur.execute(self.sql_set_active_token, query_param)

    def get_token_info(self, cur, token:str) -> Tuple[str, datetime]:
        cur.execute(self.sql_get_active_token, (token,))
        res = cur.fetchone()
        if res is None:
            return None
        return res[0], res[1]

    def delete_active_token(self, cur, token:str):
        cur.execute(self.sql_delete_active_token, (token,))

    def delete_outdate_active_token(self, cur):
        cur.execute(self.sql_delete_outdate_active_token, (datetime.now(),))

    def update_password(self, cur, user_cd, new_password):
        params = dict(
            user_cd = user_cd,
            password = new_password,
        )
        cur.execute(self.sql_update_password, params)