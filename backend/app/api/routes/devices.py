import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.device import (
    DeviceRegister, DeviceResponse, DeviceListResponse, DeviceUpdate,
    DeviceCommandCreate, DeviceCommandResponse,
    DigitalTwinResponse, TwinSimulateRequest,
    DeviceListingCreate, DeviceListingResponse,
    EdgeDeployRequest, EdgeDeploymentResponse,
)
from app.services import device_service

router = APIRouter(prefix="/devices", tags=["devices"])

# Device Registry
@router.post("/register", response_model=dict, status_code=201)
def register_device(request: DeviceRegister, db: Session = Depends(get_db)):
    device, raw_key = device_service.register_device(
        db, request.name, request.device_type, request.owner_id,
        request.capabilities, request.location_lat, request.location_lng,
        request.metadata_info
    )
    return {"device": DeviceResponse.model_validate(device).model_dump(), "api_key": raw_key}

@router.get("/", response_model=DeviceListResponse)
def list_devices(owner_id: uuid.UUID = Query(None), page: int = Query(1, ge=1),
                 page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    devices, total = device_service.list_devices(db, owner_id, page, page_size)
    return DeviceListResponse(devices=[DeviceResponse.model_validate(d) for d in devices], total=total)

@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: uuid.UUID, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceResponse.model_validate(device)

@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(device_id: uuid.UUID, request: DeviceUpdate, db: Session = Depends(get_db)):
    device = device_service.update_device(
        db, device_id, name=request.name, capabilities=request.capabilities,
        status=request.status, location_lat=request.location_lat,
        location_lng=request.location_lng
    )
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceResponse.model_validate(device)

@router.delete("/{device_id}", response_model=DeviceResponse)
def deregister_device(device_id: uuid.UUID, db: Session = Depends(get_db)):
    device = device_service.deregister_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceResponse.model_validate(device)

@router.put("/{device_id}/status", response_model=DeviceResponse)
def update_status(device_id: uuid.UUID, status: str = Query(...), db: Session = Depends(get_db)):
    device = device_service.update_device_status(db, device_id, status)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceResponse.model_validate(device)

@router.get("/{device_id}/capabilities", response_model=dict)
def get_capabilities(device_id: uuid.UUID, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"device_id": str(device.id), "capabilities": device.capabilities or []}

# Device Commands
@router.post("/{device_id}/command", response_model=DeviceCommandResponse, status_code=201)
def send_command(device_id: uuid.UUID, request: DeviceCommandCreate, db: Session = Depends(get_db)):
    command = device_service.send_command(
        db, device_id, request.command_type, request.payload,
        request.issued_by, request.timeout_seconds
    )
    if not command:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceCommandResponse.model_validate(command)

@router.get("/{device_id}/commands", response_model=dict)
def list_commands(device_id: uuid.UUID, page: int = Query(1, ge=1),
                  page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    commands, total = device_service.list_device_commands(db, device_id, page, page_size)
    return {"commands": [DeviceCommandResponse.model_validate(c) for c in commands], "total": total}

# Digital Twins
@router.get("/{device_id}/twin", response_model=DigitalTwinResponse)
def get_twin(device_id: uuid.UUID, db: Session = Depends(get_db)):
    twin = device_service.get_twin(db, device_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    return DigitalTwinResponse.model_validate(twin)

@router.put("/{device_id}/twin/state", response_model=DigitalTwinResponse)
def update_twin_state(device_id: uuid.UUID, state: dict, db: Session = Depends(get_db)):
    twin = device_service.update_twin_state(db, device_id, state)
    if not twin:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    return DigitalTwinResponse.model_validate(twin)

@router.post("/{device_id}/twin/simulate", response_model=dict)
def simulate_action(device_id: uuid.UUID, request: TwinSimulateRequest, db: Session = Depends(get_db)):
    result = device_service.simulate_twin_action(db, device_id, request.action, request.parameters)
    if not result:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    return result

@router.get("/{device_id}/twin/history", response_model=dict)
def get_twin_history(device_id: uuid.UUID, db: Session = Depends(get_db)):
    history = device_service.get_twin_history(db, device_id)
    if history is None:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    return {"device_id": str(device_id), "history": history}

# Device Marketplace
@router.post("/marketplace/list", response_model=DeviceListingResponse, status_code=201)
def create_listing(request: DeviceListingCreate, db: Session = Depends(get_db)):
    listing = device_service.create_listing(
        db, request.device_id, request.owner_id, request.description,
        request.price_per_command, request.price_per_hour,
        request.availability_schedule, request.usage_terms
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceListingResponse.model_validate(listing)

@router.get("/marketplace", response_model=dict)
def browse_marketplace(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                       db: Session = Depends(get_db)):
    listings, total = device_service.list_marketplace(db, page, page_size)
    return {"listings": [DeviceListingResponse.model_validate(l) for l in listings], "total": total}

# Edge Deployments
@router.post("/edge/deploy", response_model=EdgeDeploymentResponse, status_code=201)
def deploy_edge_model(request: EdgeDeployRequest, db: Session = Depends(get_db)):
    deployment = device_service.deploy_to_edge(
        db, request.device_id, request.model_name, request.model_version, request.quantization
    )
    if not deployment:
        raise HTTPException(status_code=404, detail="Device not found")
    return EdgeDeploymentResponse.model_validate(deployment)

@router.get("/{device_id}/edge/deployments", response_model=dict)
def list_edge_deployments(device_id: uuid.UUID, db: Session = Depends(get_db)):
    deployments = device_service.get_edge_deployments(db, device_id)
    return {"deployments": [EdgeDeploymentResponse.model_validate(d) for d in deployments]}
