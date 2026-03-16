"""
Cliente ligero de Supabase para el backend.
Usa postgrest-py directamente (evita dependencias pesadas de storage3/pyiceberg).
"""

from __future__ import annotations

import httpx
from postgrest import SyncPostgrestClient
from backend.config import get_settings


class SupabaseClient:
    """Wrapper mínimo que expone .table() y .rpc() como el SDK oficial."""

    def __init__(self, url: str, key: str):
        self.url = url
        self.rest_url = f"{url}/rest/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        self._postgrest = SyncPostgrestClient(
            self.rest_url, headers=self.headers
        )

    def table(self, name: str):
        return self._postgrest.from_(name)

    def rpc(self, fn: str, params: dict | None = None):
        return self._postgrest.rpc(fn, params or {})


_client: SupabaseClient | None = None


def get_supabase() -> SupabaseClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = SupabaseClient(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _client
