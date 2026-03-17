"""
Auth utilities — JWT verification, user extraction, role-based access control.
Uses Supabase JWT tokens verified with Supabase's public key.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
import os
from typing import Optional
from backend.database import get_db_client

security = HTTPBearer()

# Cache Supabase public key
_supabase_public_key: Optional[str] = None


async def get_supabase_public_key() -> str:
    """Fetch and cache Supabase's public signing key from JWKS endpoint."""
    global _supabase_public_key
    if _supabase_public_key:
        return _supabase_public_key

    supabase_url = os.getenv("SUPABASE_URL")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{supabase_url}/.well-known/jwks.json", timeout=10)
            jwks = response.json()
            # Extract the public key from JWKS
            # Supabase uses RS256 with a single key in the set
            if not jwks.get("keys"):
                raise ValueError("No keys found in JWKS")

            key_data = jwks["keys"][0]
            from jose.backends.rsa_backend import RSABackend
            _supabase_public_key = RSABackend.convert_jwk_to_key(key_data)
            return _supabase_public_key
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Supabase public key: {str(e)}"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extract and verify JWT token from Authorization header.
    Returns user info including id, email, and role from user_profiles.
    """
    token = credentials.credentials

    try:
        supabase_key = await get_supabase_public_key()
        # Verify JWT signature using Supabase public key
        payload = jwt.decode(
            token,
            supabase_key,
            algorithms=["RS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user profile with role
        db = get_db_client()
        profiles = db.table("user_profiles").select("*").eq("id", user_id).execute()

        if not profiles.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        profile = profiles.data[0]
        return {
            "id": profile["id"],
            "email": profile["email"],
            "full_name": profile.get("full_name"),
            "avatar_url": profile.get("avatar_url"),
            "role": profile["role"],
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(*allowed_roles: str):
    """
    Dependency factory that checks if the current user has one of the allowed roles.
    Usage: @app.get("/admin", dependencies=[Depends(require_role("admin"))])
    or: def route(user = Depends(require_role("admin", "editor"))):
    """
    async def check_role(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This endpoint requires one of roles: {', '.join(allowed_roles)}"
            )
        return user

    return check_role
