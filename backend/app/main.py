from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api import router as api_router
from app.websocket import ws_router
import asyncio

from app.mqtt_listener import connect_and_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(connect_and_loop())
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(api_router)
app.include_router(ws_router)


@app.get("/")
def root():
    return {"status": "OK"}
