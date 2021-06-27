from fastapi import HTTPException

class RecorderException(Exception):
    status_code: int = 500

class IllegalArgumentException(RecorderException):
    status_code: int = 400

class AlreadyExistExeption(RecorderException):
    status_code: int = 409

class AuthenticationException(RecorderException):
    status_code: int = 401

class NotFoundException(RecorderException):
    status_code: int = 404
