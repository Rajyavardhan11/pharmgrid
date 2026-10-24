from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .config import settings
from .database import db_session
from .models import Role, User

passwords = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def create_token(user: User) -> str:
    payload = {"sub": str(user.id), "role": user.role.value, "branch": user.branch_id,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=settings().access_token_minutes)}
    return jwt.encode(payload, settings().jwt_secret, algorithm=settings().jwt_algorithm)


def current_user(request: Request, token: str | None = Depends(oauth2), db: Session = Depends(db_session)) -> User:
    try:
        token = token or request.cookies.get("pharmgrid_access")
        if not token:
            raise JWTError("Missing access token")
        subject = jwt.decode(token, settings().jwt_secret, algorithms=[settings().jwt_algorithm]).get("sub")
        user = db.get(User, int(subject)) if subject else None
    except (JWTError, ValueError):
        user = None
    if not user or not user.active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    return user


def require(*roles: Role):
    def dependency(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient branch role")
        return user
    return dependency
