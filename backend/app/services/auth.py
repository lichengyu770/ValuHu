import hashlib
import secrets
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings


def get_password_hash(password: str) -> str:
    """
    使用SHA-256算法和随机盐值生成密码哈希值。
    
    Args:
        password (str): 明文密码
        
    Returns:
        str: 包含盐值和哈希值的字符串，格式为"salt$hashed_password"
    """
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return f"{salt}${hashed}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证明文密码与哈希密码是否匹配。
    
    Args:
        plain_password (str): 明文密码
        hashed_password (str): 包含盐值的哈希密码，格式为"salt$hashed_password"
        
    Returns:
        bool: 如果密码匹配则返回True，否则返回False
        
    Raises:
        ValueError: 如果hashed_password格式不正确
    """
    try:
        salt, hashed = hashed_password.split("$")
        new_hashed = hashlib.sha256(f"{plain_password}{salt}".encode()).hexdigest()
        return new_hashed == hashed
    except ValueError:
        raise ValueError("Invalid hashed password format. Expected format: 'salt$hashed'")


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    创建JWT访问令牌。
    
    Args:
        data (dict): 要编码到令牌中的数据
        expires_delta (timedelta, optional): 令牌过期时间增量。如果未提供，则默认过期时间为15分钟
        
    Returns:
        str: 编码后的JWT令牌
        
    Raises:
        jose.JWTError: 如果令牌编码失败
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
