"""
Admin router — user management endpoints (list users, change roles).
All endpoints require admin role.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from backend.auth import get_current_user, require_role
from backend.database import get_db_client

router = APIRouter(tags=["admin"])


@router.get("/admin/users")
async def list_users(user: dict = Depends(require_role("admin"))):
    """
    List all users with their roles. Admin only.
    """
    try:
        db = get_db_client()
        response = db.table("user_profiles").select("id, email, full_name, role, created_at").execute()
        return {
            "total": len(response.data),
            "users": response.data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.patch("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin_user: dict = Depends(require_role("admin"))
):
    """
    Update a user's role. Admin only.
    Valid roles: 'viewer', 'editor', 'admin'
    """
    if role not in ["viewer", "editor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be one of: viewer, editor, admin"
        )

    if user_id == admin_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )

    try:
        db = get_db_client()
        result = db.table("user_profiles").update({"role": role}).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "message": f"User role updated to '{role}'",
            "user": result.data[0]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )
