import hashlib
import uuid

from datetime import datetime
from datetime import timedelta

from ..repository import AuthRepository as repository
from ..repository import connection

from ..model import AuthModel as model

from ..exception import IllegalArgumentException, AlreadyExistExeption, AuthenticationException, NotFoundException


class AuthService:
    def __init__(self):
        self.repository = repository.AuthRepository()

    def __make_password_hash(self, user_cd:str, password:str) -> str:
        password_hash_base = f"{user_cd}-{password}"
        return hashlib.sha256(password_hash_base.encode()).hexdigest()

    def __make_token_hash(self, token:str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    def can_use_user_cd(self, user_cd) -> bool:
        return not("/" in user_cd or "." in user_cd)

    def register_user(self, data:model.RegisterMasterModel) -> None:
        if not self.can_use_user_cd(data.user_cd):
            raise IllegalArgumentException("ユーザコードに使用できない文字があります。")
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_data = self.repository.get_user_master(cur, data.user_cd)
                if current_data is not None:
                    raise AlreadyExistExeption("既に使用されているユーザコードです。")
                self.repository.set_user_master(cur, data)
                password_hash = self.__make_password_hash(data.user_cd, data.password)
                self.repository.set_user_auth(cur, data.user_cd, password_hash)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def login(self, info: model.LoginModel):
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                password_hash = self.__make_password_hash(info.user_cd, info.password)
                db_password_hash = self.repository.get_user_auth(cur, info.user_cd)
                if (password_hash != db_password_hash):
                    raise IllegalArgumentException("ユーザコードもしくはパスワードが誤っています。")
                token = str(uuid.uuid4())
                token_hash = self.__make_token_hash(token)
                limit_date = datetime.now() + timedelta(days = 7)
                token_model = model.ActiveToken(token = token_hash, limit_date = limit_date)
                self.repository.set_active_token(cur, info.user_cd, token_model)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        return token

    def auth_token(self, token:str) -> str:
        now = datetime.now()
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                res = self.repository.get_token_info(cur, self.__make_token_hash(token))
                if res is None:
                    raise AuthenticationException("認証エラーです。ログアウトして再度ログインしてください。")
                user_cd, limit_date = res
                if limit_date < now:
                    self.repository.delete_outdate_active_token(cur)
                    raise AuthenticationException("認証トークンの期限が切れました。再度ログインしてください。")
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        return user_cd

    def get_user_info(self, user_cd) -> model.Master:
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                user_info = self.repository.get_user_master(cur, user_cd)
                if user_info is None:
                    raise NotFoundException("ユーザ情報を取得できませんでした。")
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
        return user_info

    def logout(self, token:str):
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                res = self.repository.delete_active_token(cur, self.__make_token_hash(token))
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def update_password(self, user_cd, password_info: model.PasswordUpdate):
        try:
            conn = connection.mk_connection()
            with conn.cursor() as cur:
                current_password_hash = self.__make_password_hash(user_cd, password_info.current)
                db_password_hash = self.repository.get_user_auth(cur, user_cd)
                if (current_password_hash != db_password_hash):
                    raise IllegalArgumentException("現在のパスワードが誤っています。")
                new_password_hash = self.__make_password_hash(user_cd, password_info.new)
                self.repository.update_password(cur, user_cd, new_password_hash)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
