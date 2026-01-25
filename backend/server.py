# Nirmaya Health Services - Premium Enhanced Backend v3.0
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, Form, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
import os
import jwt
import bcrypt
import uuid
import json
import asyncio
import random
import string
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
import stripe

app = FastAPI(title="Nirmaya Health Services API", version="3.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://nirmaya_admin:nirmaya%40admin12345@cluster0.uev8tun.mongodb.net/nirmaya_health?retryWrites=true&w=majority&appName=Cluster0")
JWT_SECRET = os.environ.get("JWT_SECRET", "nirmaya_health_secret_key_2025_secure")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_12345")

client = AsyncIOMotorClient(MONGO_URL)
db = client.nirmaya_health

# Collections
users_collection = db.users
doctors_collection = db.doctors
appointments_collection = db.appointments
messages_collection = db.messages
equipment_collection = db.equipment
inventory_collection = db.inventory
shifts_collection = db.shifts
reports_collection = db.reports
analytics_collection = db.analytics
notifications_collection = db.notifications
payments_collection = db.payments
health_packages_collection = db.health_packages
ambulance_requests_collection = db.ambulance_requests
health_records_collection = db.health_records
lab_tests_collection = db.lab_tests
beds_collection = db.beds
prescriptions_collection = db.prescriptions
departments_collection = db.departments
ambulances_collection = db.ambulances
payment_transactions_collection = db.payment_transactions

security = HTTPBearer()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast_notification(self, message: dict, user_ids: List[str]):
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()

# ==================== PYDANTIC MODELS ====================
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None

class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    specialty: str
    department: str
    experience: str
    qualifications: Optional[str] = None
    certifications: Optional[List[str]] = []
    bio: Optional[str] = None
    image: Optional[str] = None
    time_slots: List[str]
    consultation_fee: Optional[float] = 500.0
    video_consultation_fee: Optional[float] = 400.0

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[str] = None
    qualifications: Optional[str] = None
    certifications: Optional[List[str]] = None
    bio: Optional[str] = None
    image: Optional[str] = None
    time_slots: Optional[List[str]] = None
    consultation_fee: Optional[float] = None
    video_consultation_fee: Optional[float] = None

class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str
    time: str
    reason: Optional[str] = None
    appointment_type: str = "Consultation"
    is_video: bool = False

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class EquipmentCreate(BaseModel):
    name: str
    category: str
    department: str
    description: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    status: str = "Available"
    image: Optional[str] = None

class InventoryCreate(BaseModel):
    item_name: str
    category: str
    quantity: int
    unit: str
    min_threshold: int
    max_threshold: Optional[int] = 1000
    unit_price: Optional[float] = 0.0
    supplier: Optional[str] = None
    department: str
    expiry_date: Optional[str] = None

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    min_threshold: Optional[int] = None
    max_threshold: Optional[int] = None
    unit_price: Optional[float] = None
    supplier: Optional[str] = None
    expiry_date: Optional[str] = None

class ShiftCreate(BaseModel):
    staff_id: str
    staff_name: str
    staff_role: str
    department: str
    shift_date: str
    shift_type: str
    start_time: str
    end_time: str
    notes: Optional[str] = None

class PaymentCreate(BaseModel):
    appointment_id: Optional[str] = None
    package_id: Optional[str] = None
    lab_test_id: Optional[str] = None
    amount: float
    payment_type: str
    description: Optional[str] = None

class HealthPackageCreate(BaseModel):
    name: str
    description: str
    tests_included: List[str]
    price: float
    discounted_price: Optional[float] = None
    duration: str
    category: str

class AmbulanceRequest(BaseModel):
    patient_name: str
    phone: str
    pickup_address: str
    emergency_type: str
    notes: Optional[str] = None

class HealthRecordCreate(BaseModel):
    patient_id: str
    record_type: str
    title: str
    description: str
    date: str
    doctor_id: Optional[str] = None
    attachments: Optional[List[str]] = []
    vitals: Optional[Dict[str, Any]] = None

class LabTestCreate(BaseModel):
    test_name: str
    category: str
    price: float
    description: Optional[str] = None
    preparation: Optional[str] = None
    duration: str

class LabTestBooking(BaseModel):
    test_id: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = None

class BedCreate(BaseModel):
    bed_number: str
    ward: str
    room_number: str
    bed_type: str
    price_per_day: float
    features: Optional[List[str]] = []

class PrescriptionCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    medications: List[Dict[str, Any]]
    instructions: Optional[str] = None
    follow_up_date: Optional[str] = None

class ReviewCreate(BaseModel):
    doctor_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token_data = decode_token(credentials.credentials)
    user = await users_collection.find_one({"id": token_data["user_id"]})
    if not user:
        user = await doctors_collection.find_one({"id": token_data["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def serialize_doc(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def generate_meeting_link():
    code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"https://meet.nirmaya.health/{code}"

def generate_order_id():
    return f"ORD-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

async def create_notification(user_id: str, title: str, message: str, notification_type: str, data: dict = None):
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "data": data or {},
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    }
    await notifications_collection.insert_one(notification)
    await manager.send_personal_message({"type": "notification", "data": notification}, user_id)
    return notification

# ==================== HEALTH CHECK ====================
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Nirmaya Health Services API", "version": "3.0.0"}

# ==================== DEPARTMENTS ====================
@app.get("/api/departments")
async def get_departments():
    departments = await departments_collection.find({}, {"_id": 0}).to_list(50)
    return departments

@app.get("/api/departments/{slug}")
async def get_department(slug: str):
    department = await departments_collection.find_one({"slug": slug}, {"_id": 0})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get doctors for this department
    doctors = await doctors_collection.find({"department": department["name"]}, {"_id": 0, "password": 0}).to_list(50)
    department["doctors"] = doctors
    
    # Get health packages for this department
    packages = await health_packages_collection.find({"department": department["name"]}, {"_id": 0}).to_list(20)
    department["health_packages"] = packages
    
    return department

# ==================== AMBULANCES ====================
@app.get("/api/ambulances")
async def get_ambulances():
    ambulances = await ambulances_collection.find({}, {"_id": 0}).to_list(50)
    return ambulances

@app.get("/api/ambulances/available")
async def get_available_ambulances():
    ambulances = await ambulances_collection.find({"status": "available"}, {"_id": 0}).to_list(50)
    return ambulances

@app.post("/api/ambulances/request")
async def request_ambulance_service(
    ambulance_type: str = Form(...),
    patient_name: str = Form(...),
    phone: str = Form(...),
    pickup_address: str = Form(...),
    emergency_type: str = Form(...),
    notes: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    # Find available ambulance of requested type
    ambulance = await ambulances_collection.find_one({"status": "available", "type": ambulance_type})
    if not ambulance:
        # Get any available ambulance
        ambulance = await ambulances_collection.find_one({"status": "available"})
    
    request_id = str(uuid.uuid4())
    eta = random.randint(5, 15) if emergency_type == "Emergency" else random.randint(15, 30)
    
    request_doc = {
        "id": request_id,
        "user_id": current_user["id"],
        "patient_name": patient_name,
        "phone": phone,
        "pickup_address": pickup_address,
        "emergency_type": emergency_type,
        "ambulance_type": ambulance_type,
        "notes": notes,
        "status": "dispatched",
        "status_history": [
            {"status": "requested", "timestamp": datetime.utcnow().isoformat()},
            {"status": "dispatched", "timestamp": datetime.utcnow().isoformat()}
        ],
        "assigned_ambulance": ambulance["vehicle_number"] if ambulance else None,
        "driver_name": ambulance["driver_name"] if ambulance else None,
        "driver_phone": ambulance["driver_phone"] if ambulance else None,
        "eta_minutes": eta,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await ambulance_requests_collection.insert_one(request_doc)
    
    # Update ambulance status
    if ambulance:
        await ambulances_collection.update_one(
            {"id": ambulance["id"]},
            {"$set": {"status": "dispatched", "current_request": request_id}}
        )
    
    # Notify user
    await create_notification(
        current_user["id"],
        "🚑 Ambulance Dispatched",
        f"Ambulance {ambulance['vehicle_number'] if ambulance else 'TBD'} is on the way. ETA: {eta} minutes",
        "ambulance",
        {"request_id": request_id}
    )
    
    # Notify admins
    admins = await users_collection.find({"role": "admin"}).to_list(10)
    for admin in admins:
        await create_notification(
            admin["id"],
            "🚨 New Ambulance Request",
            f"{emergency_type} ambulance requested by {patient_name} at {pickup_address}",
            "ambulance",
            {"request_id": request_id}
        )
    
    return {
        "request_id": request_id,
        "status": "dispatched",
        "ambulance_number": ambulance["vehicle_number"] if ambulance else "Assigning...",
        "driver_name": ambulance["driver_name"] if ambulance else None,
        "driver_phone": ambulance["driver_phone"] if ambulance else None,
        "eta_minutes": eta,
        "message": "Ambulance has been dispatched and is on the way!"
    }

@app.get("/api/ambulances/requests")
async def get_ambulance_requests(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        requests = await ambulance_requests_collection.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    else:
        requests = await ambulance_requests_collection.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return requests

@app.put("/api/ambulances/requests/{request_id}/status")
async def update_ambulance_request_status(
    request_id: str,
    status: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    request = await ambulance_requests_collection.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Valid status transitions: dispatched -> en_route -> arrived -> completed
    valid_statuses = ["dispatched", "en_route", "arrived", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    status_update = {"status": status, "timestamp": datetime.utcnow().isoformat()}
    
    await ambulance_requests_collection.update_one(
        {"id": request_id},
        {
            "$set": {"status": status},
            "$push": {"status_history": status_update}
        }
    )
    
    # If completed or cancelled, free up the ambulance
    if status in ["completed", "cancelled"]:
        if request.get("assigned_ambulance"):
            await ambulances_collection.update_one(
                {"vehicle_number": request["assigned_ambulance"]},
                {"$set": {"status": "available", "current_request": None}}
            )
    
    # Notify user
    status_messages = {
        "en_route": "🚑 Your ambulance is now en route to your location.",
        "arrived": "🚑 Your ambulance has arrived at the pickup location.",
        "completed": "✅ Ambulance service completed. Thank you for choosing Nirmaya Health.",
        "cancelled": "❌ Your ambulance request has been cancelled."
    }
    
    if status in status_messages:
        await create_notification(
            request["user_id"],
            f"Ambulance Status: {status.replace('_', ' ').title()}",
            status_messages[status],
            "ambulance",
            {"request_id": request_id}
        )
    
    return {"message": f"Status updated to {status}", "status": status}

# ==================== AUTH ROUTES ====================
@app.post("/api/auth/register")
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "phone": user.phone,
        "role": "patient",
        "created_at": datetime.utcnow().isoformat(),
        "profile_complete": False,
        "address": None,
        "date_of_birth": None,
        "blood_group": None,
        "emergency_contact": None,
        "allergies": [],
        "chronic_conditions": [],
        "notification_preferences": {"email": True, "push": True, "sms": True}
    }
    await users_collection.insert_one(user_doc)
    
    # Send welcome notification
    await create_notification(user_id, "Welcome to Nirmaya Health!", 
        "Your account has been created successfully. Complete your profile for better service.", "welcome")
    
    token = create_token(user_id, "patient")
    return {"token": token, "user": {"id": user_id, "name": user.name, "email": user.email, "role": "patient"}}

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    role = "patient"
    
    if not user:
        user = await doctors_collection.find_one({"email": credentials.email})
        role = "doctor" if user else None
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    actual_role = user.get("role", role)
    token = create_token(user["id"], actual_role)
    
    user_response = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": actual_role
    }
    if actual_role == "doctor":
        user_response["specialty"] = user.get("specialty")
        user_response["department"] = user.get("department")
    
    return {"token": token, "user": user_response}

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = {k: v for k, v in current_user.items() if k not in ["password", "_id"]}
    return user_data

@app.put("/api/auth/profile")
async def update_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        update_data["profile_complete"] = True
        await users_collection.update_one({"id": current_user["id"]}, {"$set": update_data})
    updated = await users_collection.find_one({"id": current_user["id"]})
    return {k: v for k, v in updated.items() if k not in ["password", "_id"]}

# ==================== NOTIFICATIONS ====================
@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await notifications_collection.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(50)
    return [serialize_doc(n) for n in notifications]

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await notifications_collection.update_one({"id": notification_id}, {"$set": {"read": True}})
    return {"message": "Notification marked as read"}

@app.put("/api/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await notifications_collection.update_many({"user_id": current_user["id"]}, {"$set": {"read": True}})
    return {"message": "All notifications marked as read"}

# ==================== DOCTORS ROUTES ====================
@app.get("/api/doctors")
async def get_doctors(department: Optional[str] = None):
    query = {} if not department else {"department": department}
    doctors = await doctors_collection.find(query).to_list(100)
    return [{k: v for k, v in d.items() if k not in ["password", "_id"]} for d in doctors]

@app.get("/api/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    doctor = await doctors_collection.find_one({"id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    reviews = await db.reviews.find({"doctor_id": doctor_id}).to_list(50)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    
    doctor_data = {k: v for k, v in doctor.items() if k not in ["password", "_id"]}
    doctor_data["average_rating"] = round(avg_rating, 1)
    doctor_data["review_count"] = len(reviews)
    doctor_data["reviews"] = [{
        "rating": r["rating"], 
        "comment": r.get("comment"), 
        "patient_name": r.get("patient_name", "Anonymous"), 
        "created_at": r.get("created_at")
    } for r in reviews[-5:]]
    
    return doctor_data

@app.post("/api/doctors")
async def create_doctor(doctor: DoctorCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await doctors_collection.find_one({"email": doctor.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    doctor_id = str(uuid.uuid4())
    doctor_doc = {
        "id": doctor_id,
        "name": doctor.name,
        "email": doctor.email,
        "password": hash_password(doctor.password),
        "specialty": doctor.specialty,
        "department": doctor.department,
        "experience": doctor.experience,
        "qualifications": doctor.qualifications,
        "certifications": doctor.certifications,
        "bio": doctor.bio,
        "image": doctor.image or f"https://ui-avatars.com/api/?name={doctor.name.replace(' ', '+')}&background=14b8a6&color=fff",
        "time_slots": doctor.time_slots,
        "consultation_fee": doctor.consultation_fee,
        "video_consultation_fee": doctor.video_consultation_fee,
        "role": "doctor",
        "created_at": datetime.utcnow().isoformat(),
        "available_for_video": True
    }
    await doctors_collection.insert_one(doctor_doc)
    return {k: v for k, v in doctor_doc.items() if k not in ["password", "_id"]}

@app.put("/api/doctors/{doctor_id}")
async def update_doctor(doctor_id: str, update: DoctorUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await doctors_collection.update_one({"id": doctor_id}, {"$set": update_data})
    
    updated = await doctors_collection.find_one({"id": doctor_id})
    return {k: v for k, v in updated.items() if k not in ["password", "_id"]}

@app.delete("/api/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    await doctors_collection.delete_one({"id": doctor_id})
    return {"message": "Doctor deleted successfully"}

@app.post("/api/doctors/{doctor_id}/review")
async def add_review(doctor_id: str, review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_doc = {
        "id": str(uuid.uuid4()),
        "doctor_id": doctor_id,
        "patient_id": current_user["id"],
        "patient_name": current_user["name"],
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.reviews.insert_one(review_doc)
    return {"message": "Review submitted successfully"}

# ==================== APPOINTMENTS ROUTES ====================
@app.get("/api/appointments")
async def get_appointments(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        appointments = await appointments_collection.find().to_list(500)
    elif current_user.get("role") == "doctor":
        appointments = await appointments_collection.find({"doctor_id": current_user["id"]}).to_list(200)
    else:
        appointments = await appointments_collection.find({"patient_id": current_user["id"]}).to_list(100)
    
    return [serialize_doc(a) for a in appointments]

@app.post("/api/appointments")
async def create_appointment(appointment: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    doctor = await doctors_collection.find_one({"id": appointment.doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    existing = await appointments_collection.find_one({
        "doctor_id": appointment.doctor_id,
        "date": appointment.date,
        "time": appointment.time,
        "status": {"$ne": "cancelled"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    appointment_id = str(uuid.uuid4())
    fee = doctor.get("video_consultation_fee", 400) if appointment.is_video else doctor.get("consultation_fee", 500)
    
    appointment_doc = {
        "id": appointment_id,
        "patient_id": current_user["id"],
        "patient_name": current_user["name"],
        "patient_email": current_user["email"],
        "patient_phone": current_user.get("phone", ""),
        "doctor_id": appointment.doctor_id,
        "doctor_name": doctor["name"],
        "department": doctor["department"],
        "date": appointment.date,
        "time": appointment.time,
        "reason": appointment.reason,
        "appointment_type": appointment.appointment_type,
        "is_video": appointment.is_video,
        "meeting_link": generate_meeting_link() if appointment.is_video else None,
        "fee": fee,
        "status": "pending_payment",
        "payment_status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    await appointments_collection.insert_one(appointment_doc)
    
    # Notify doctor
    await create_notification(doctor["id"], "New Appointment Request",
        f"New appointment request from {current_user['name']} on {appointment.date} at {appointment.time}",
        "appointment", {"appointment_id": appointment_id})
    
    return serialize_doc(appointment_doc)

@app.put("/api/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str = Form(...), current_user: dict = Depends(get_current_user)):
    appointment = await appointments_collection.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await appointments_collection.update_one({"id": appointment_id}, {"$set": {"status": status}})
    
    # Notify patient
    await create_notification(appointment["patient_id"], f"Appointment {status.title()}",
        f"Your appointment on {appointment['date']} has been {status}.", "appointment", {"appointment_id": appointment_id})
    
    return {"message": "Appointment updated"}

@app.delete("/api/appointments/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    await appointments_collection.update_one({"id": appointment_id}, {"$set": {"status": "cancelled"}})
    return {"message": "Appointment cancelled"}

# ==================== PAYMENTS ROUTES ====================
@app.post("/api/payments/initiate")
async def initiate_payment(payment: PaymentCreate, current_user: dict = Depends(get_current_user)):
    order_id = generate_order_id()
    payment_doc = {
        "id": str(uuid.uuid4()),
        "order_id": order_id,
        "user_id": current_user["id"],
        "appointment_id": payment.appointment_id,
        "package_id": payment.package_id,
        "lab_test_id": payment.lab_test_id,
        "amount": payment.amount,
        "payment_type": payment.payment_type,
        "description": payment.description,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    await payments_collection.insert_one(payment_doc)
    
    return {
        "order_id": order_id,
        "amount": payment.amount,
        "currency": "INR",
        "payment_id": payment_doc["id"]
    }

@app.post("/api/payments/verify")
async def verify_payment(
    payment_id: str = Form(...),
    razorpay_payment_id: str = Form(...),
    razorpay_signature: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    # In production, verify with Razorpay
    # For demo, we'll simulate successful payment
    payment = await payments_collection.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await payments_collection.update_one({"id": payment_id}, {
        "$set": {
            "status": "completed",
            "razorpay_payment_id": razorpay_payment_id,
            "completed_at": datetime.utcnow().isoformat()
        }
    })
    
    # Update related entity
    if payment.get("appointment_id"):
        await appointments_collection.update_one(
            {"id": payment["appointment_id"]},
            {"$set": {"payment_status": "paid", "status": "scheduled"}}
        )
        appointment = await appointments_collection.find_one({"id": payment["appointment_id"]})
        if appointment:
            await create_notification(current_user["id"], "Payment Successful",
                f"Your payment of ₹{payment['amount']} for appointment on {appointment['date']} was successful.",
                "payment", {"payment_id": payment_id})
    
    return {"status": "success", "message": "Payment verified successfully"}

@app.get("/api/payments/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        payments = await payments_collection.find().sort("created_at", -1).to_list(500)
    else:
        payments = await payments_collection.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return [serialize_doc(p) for p in payments]

# Simulate payment for demo
@app.post("/api/payments/simulate")
async def simulate_payment(payment_id: str = Form(...), current_user: dict = Depends(get_current_user)):
    payment = await payments_collection.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await payments_collection.update_one({"id": payment_id}, {
        "$set": {
            "status": "completed",
            "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:16]}",
            "completed_at": datetime.utcnow().isoformat()
        }
    })
    
    if payment.get("appointment_id"):
        await appointments_collection.update_one(
            {"id": payment["appointment_id"]},
            {"$set": {"payment_status": "paid", "status": "scheduled"}}
        )
    
    await create_notification(current_user["id"], "Payment Successful",
        f"Your payment of ₹{payment['amount']} was successful.", "payment")
    
    return {"status": "success", "message": "Payment simulated successfully"}

# ==================== INVENTORY MANAGEMENT ====================
@app.get("/api/inventory")
async def get_inventory(department: Optional[str] = None, low_stock: bool = False, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff", "doctor"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    query = {}
    if department:
        query["department"] = department
    
    inventory = await inventory_collection.find(query).to_list(500)
    
    if low_stock:
        inventory = [i for i in inventory if i.get("quantity", 0) <= i.get("min_threshold", 10)]
    
    return [serialize_doc(i) for i in inventory]

@app.post("/api/inventory")
async def add_inventory(item: InventoryCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    item_id = str(uuid.uuid4())
    item_doc = {
        "id": item_id,
        **item.dict(),
        "last_restocked": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "usage_history": []
    }
    await inventory_collection.insert_one(item_doc)
    return serialize_doc(item_doc)

@app.put("/api/inventory/{item_id}")
async def update_inventory(item_id: str, update: InventoryUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        update_data["last_updated"] = datetime.utcnow().isoformat()
        await inventory_collection.update_one({"id": item_id}, {"$set": update_data})
    
    # Check if stock is low and notify
    item = await inventory_collection.find_one({"id": item_id})
    if item and item.get("quantity", 0) <= item.get("min_threshold", 10):
        admins = await users_collection.find({"role": "admin"}).to_list(10)
        for admin in admins:
            await create_notification(admin["id"], "Low Stock Alert",
                f"{item['item_name']} is running low. Current quantity: {item['quantity']} {item['unit']}",
                "inventory", {"item_id": item_id})
    
    return {"message": "Inventory updated"}

@app.post("/api/inventory/{item_id}/restock")
async def restock_inventory(item_id: str, quantity: int = Form(...), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    item = await inventory_collection.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    new_quantity = item.get("quantity", 0) + quantity
    await inventory_collection.update_one({"id": item_id}, {
        "$set": {"quantity": new_quantity, "last_restocked": datetime.utcnow().isoformat()},
        "$push": {"usage_history": {"type": "restock", "quantity": quantity, "date": datetime.utcnow().isoformat(), "by": current_user["name"]}}
    })
    
    return {"message": f"Restocked {quantity} units. New quantity: {new_quantity}"}

@app.post("/api/inventory/{item_id}/use")
async def use_inventory(item_id: str, quantity: int = Form(...), reason: str = Form(""), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff", "doctor"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    item = await inventory_collection.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.get("quantity", 0) < quantity:
        raise HTTPException(status_code=400, detail="Insufficient quantity")
    
    new_quantity = item["quantity"] - quantity
    await inventory_collection.update_one({"id": item_id}, {
        "$set": {"quantity": new_quantity},
        "$push": {"usage_history": {"type": "usage", "quantity": quantity, "reason": reason, "date": datetime.utcnow().isoformat(), "by": current_user["name"]}}
    })
    
    return {"message": f"Used {quantity} units. Remaining: {new_quantity}"}

@app.delete("/api/inventory/{item_id}")
async def delete_inventory(item_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    await inventory_collection.delete_one({"id": item_id})
    return {"message": "Item deleted"}

# ==================== SHIFT MANAGEMENT ====================
@app.get("/api/shifts")
async def get_shifts(date: Optional[str] = None, department: Optional[str] = None, staff_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff", "doctor"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    query = {}
    if date:
        query["shift_date"] = date
    if department:
        query["department"] = department
    if staff_id:
        query["staff_id"] = staff_id
    
    shifts = await shifts_collection.find(query).sort("shift_date", 1).to_list(500)
    return [serialize_doc(s) for s in shifts]

@app.post("/api/shifts")
async def create_shift(shift: ShiftCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check for conflicts
    existing = await shifts_collection.find_one({
        "staff_id": shift.staff_id,
        "shift_date": shift.shift_date,
        "shift_type": shift.shift_type
    })
    if existing:
        raise HTTPException(status_code=400, detail="Shift already exists for this staff member")
    
    shift_id = str(uuid.uuid4())
    shift_doc = {
        "id": shift_id,
        **shift.dict(),
        "status": "scheduled",
        "created_at": datetime.utcnow().isoformat(),
        "created_by": current_user["id"]
    }
    await shifts_collection.insert_one(shift_doc)
    
    # Notify staff member
    await create_notification(shift.staff_id, "New Shift Assigned",
        f"You have been assigned a {shift.shift_type} shift on {shift.shift_date}",
        "shift", {"shift_id": shift_id})
    
    return serialize_doc(shift_doc)

@app.put("/api/shifts/{shift_id}")
async def update_shift(shift_id: str, status: str = Form(...), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await shifts_collection.update_one({"id": shift_id}, {"$set": {"status": status}})
    return {"message": "Shift updated"}

@app.delete("/api/shifts/{shift_id}")
async def delete_shift(shift_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    shift = await shifts_collection.find_one({"id": shift_id})
    if shift:
        await create_notification(shift["staff_id"], "Shift Cancelled",
            f"Your {shift['shift_type']} shift on {shift['shift_date']} has been cancelled.",
            "shift", {"shift_id": shift_id})
    
    await shifts_collection.delete_one({"id": shift_id})
    return {"message": "Shift deleted"}

# ==================== HEALTH PACKAGES ====================
@app.get("/api/health-packages")
async def get_health_packages(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    packages = await health_packages_collection.find(query).to_list(50)
    return [serialize_doc(p) for p in packages]

@app.get("/api/health-packages/{package_id}")
async def get_health_package(package_id: str):
    package = await health_packages_collection.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return serialize_doc(package)

@app.post("/api/health-packages")
async def create_health_package(package: HealthPackageCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package_id = str(uuid.uuid4())
    package_doc = {
        "id": package_id,
        **package.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    await health_packages_collection.insert_one(package_doc)
    return serialize_doc(package_doc)

@app.post("/api/health-packages/{package_id}/book")
async def book_health_package(package_id: str, preferred_date: str = Form(...), current_user: dict = Depends(get_current_user)):
    package = await health_packages_collection.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    booking_id = str(uuid.uuid4())
    booking = {
        "id": booking_id,
        "package_id": package_id,
        "package_name": package["name"],
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "preferred_date": preferred_date,
        "price": package.get("discounted_price") or package["price"],
        "status": "pending_payment",
        "tests": package["tests_included"],
        "created_at": datetime.utcnow().isoformat()
    }
    await db.package_bookings.insert_one(booking)
    
    return {"booking_id": booking_id, "price": booking["price"], "package": package["name"]}

# ==================== AMBULANCE SERVICES ====================
@app.post("/api/ambulance/request")
async def request_ambulance(request: AmbulanceRequest, current_user: dict = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    request_doc = {
        "id": request_id,
        "user_id": current_user["id"],
        **request.dict(),
        "status": "pending",
        "assigned_driver": None,
        "ambulance_number": None,
        "eta": None,
        "created_at": datetime.utcnow().isoformat()
    }
    await ambulance_requests_collection.insert_one(request_doc)
    
    # Notify admins
    admins = await users_collection.find({"role": "admin"}).to_list(10)
    for admin in admins:
        await create_notification(admin["id"], "🚑 Emergency Ambulance Request",
            f"Emergency request from {request.patient_name} at {request.pickup_address}",
            "ambulance", {"request_id": request_id})
    
    # Auto-assign (simulated)
    ambulance_number = f"WB-{random.randint(10, 99)}-A-{random.randint(1000, 9999)}"
    eta = random.randint(5, 15)
    
    await ambulance_requests_collection.update_one({"id": request_id}, {
        "$set": {
            "status": "dispatched",
            "ambulance_number": ambulance_number,
            "assigned_driver": "Driver " + ''.join(random.choices(string.ascii_uppercase, k=2)),
            "eta": eta
        }
    })
    
    await create_notification(current_user["id"], "Ambulance Dispatched",
        f"Ambulance {ambulance_number} is on the way. ETA: {eta} minutes",
        "ambulance", {"request_id": request_id})
    
    return {
        "request_id": request_id,
        "status": "dispatched",
        "ambulance_number": ambulance_number,
        "eta": eta
    }

@app.get("/api/ambulance/requests")
async def get_ambulance_requests(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        requests = await ambulance_requests_collection.find().sort("created_at", -1).to_list(100)
    else:
        requests = await ambulance_requests_collection.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(20)
    return [serialize_doc(r) for r in requests]

@app.put("/api/ambulance/requests/{request_id}/status")
async def update_ambulance_status(request_id: str, status: str = Form(...), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    request = await ambulance_requests_collection.find_one({"id": request_id})
    if request:
        await ambulance_requests_collection.update_one({"id": request_id}, {"$set": {"status": status}})
        await create_notification(request["user_id"], f"Ambulance Status: {status.title()}",
            f"Your ambulance request status has been updated to: {status}",
            "ambulance", {"request_id": request_id})
    
    return {"message": "Status updated"}

# ==================== HEALTH RECORDS ====================
@app.get("/api/health-records")
async def get_health_records(patient_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") in ["admin", "doctor"]:
        query = {"patient_id": patient_id} if patient_id else {}
    else:
        query = {"patient_id": current_user["id"]}
    
    records = await health_records_collection.find(query).sort("date", -1).to_list(200)
    return [serialize_doc(r) for r in records]

@app.post("/api/health-records")
async def create_health_record(record: HealthRecordCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    record_id = str(uuid.uuid4())
    record_doc = {
        "id": record_id,
        **record.dict(),
        "created_by": current_user["id"],
        "created_by_name": current_user["name"],
        "created_at": datetime.utcnow().isoformat()
    }
    await health_records_collection.insert_one(record_doc)
    
    await create_notification(record.patient_id, "New Health Record Added",
        f"Dr. {current_user['name']} added a new {record.record_type} record to your profile.",
        "health_record", {"record_id": record_id})
    
    return serialize_doc(record_doc)

@app.get("/api/health-records/timeline/{patient_id}")
async def get_health_timeline(patient_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "doctor"] and current_user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all health-related data
    records = await health_records_collection.find({"patient_id": patient_id}).to_list(100)
    appointments = await appointments_collection.find({"patient_id": patient_id}).to_list(100)
    reports = await reports_collection.find({"patient_id": patient_id}).to_list(100)
    prescriptions = await prescriptions_collection.find({"patient_id": patient_id}).to_list(100)
    
    timeline = []
    
    for r in records:
        timeline.append({"type": "record", "date": r.get("date"), "title": r.get("title"), "data": serialize_doc(r)})
    for a in appointments:
        timeline.append({"type": "appointment", "date": a.get("date"), "title": f"Appointment with {a.get('doctor_name')}", "data": serialize_doc(a)})
    for rep in reports:
        timeline.append({"type": "report", "date": rep.get("created_at", "")[:10], "title": rep.get("report_name"), "data": serialize_doc(rep)})
    for p in prescriptions:
        timeline.append({"type": "prescription", "date": p.get("created_at", "")[:10], "title": f"Prescription - {p.get('diagnosis')}", "data": serialize_doc(p)})
    
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    return timeline

# ==================== LAB TESTS ====================
@app.get("/api/lab-tests")
async def get_lab_tests(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    tests = await lab_tests_collection.find(query).to_list(100)
    return [serialize_doc(t) for t in tests]

@app.post("/api/lab-tests")
async def create_lab_test(test: LabTestCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    test_id = str(uuid.uuid4())
    test_doc = {
        "id": test_id,
        **test.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    await lab_tests_collection.insert_one(test_doc)
    return serialize_doc(test_doc)

@app.post("/api/lab-tests/book")
async def book_lab_test(booking: LabTestBooking, current_user: dict = Depends(get_current_user)):
    test = await lab_tests_collection.find_one({"id": booking.test_id})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    booking_id = str(uuid.uuid4())
    booking_doc = {
        "id": booking_id,
        "test_id": booking.test_id,
        "test_name": test["test_name"],
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "price": test["price"],
        "status": "pending_payment",
        "result_status": "pending",
        "notes": booking.notes,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.lab_bookings.insert_one(booking_doc)
    
    return {"booking_id": booking_id, "price": test["price"], "test_name": test["test_name"]}

@app.get("/api/lab-tests/bookings")
async def get_lab_bookings(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        bookings = await db.lab_bookings.find().sort("created_at", -1).to_list(200)
    else:
        bookings = await db.lab_bookings.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(50)
    return [serialize_doc(b) for b in bookings]

@app.put("/api/lab-tests/bookings/{booking_id}/result")
async def upload_lab_result(booking_id: str, result_url: str = Form(...), notes: str = Form(""), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    booking = await db.lab_bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await db.lab_bookings.update_one({"id": booking_id}, {
        "$set": {
            "result_status": "completed",
            "result_url": result_url,
            "result_notes": notes,
            "result_uploaded_at": datetime.utcnow().isoformat()
        }
    })
    
    await create_notification(booking["user_id"], "Lab Results Ready",
        f"Your {booking['test_name']} results are now available.",
        "lab_result", {"booking_id": booking_id})
    
    return {"message": "Result uploaded successfully"}

# ==================== BED MANAGEMENT ====================
@app.get("/api/beds")
async def get_beds(ward: Optional[str] = None, available_only: bool = False):
    query = {}
    if ward:
        query["ward"] = ward
    if available_only:
        query["status"] = "available"
    
    beds = await beds_collection.find(query).to_list(200)
    return [serialize_doc(b) for b in beds]

@app.get("/api/beds/availability")
async def get_bed_availability():
    beds = await beds_collection.find().to_list(500)
    
    wards = {}
    for bed in beds:
        ward = bed.get("ward", "Unknown")
        if ward not in wards:
            wards[ward] = {"total": 0, "available": 0, "occupied": 0}
        wards[ward]["total"] += 1
        if bed.get("status") == "available":
            wards[ward]["available"] += 1
        else:
            wards[ward]["occupied"] += 1
    
    return wards

@app.post("/api/beds")
async def create_bed(bed: BedCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    bed_id = str(uuid.uuid4())
    bed_doc = {
        "id": bed_id,
        **bed.dict(),
        "status": "available",
        "current_patient": None,
        "admission_date": None,
        "created_at": datetime.utcnow().isoformat()
    }
    await beds_collection.insert_one(bed_doc)
    return serialize_doc(bed_doc)

@app.post("/api/beds/{bed_id}/admit")
async def admit_patient(bed_id: str, patient_id: str = Form(...), patient_name: str = Form(...), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    bed = await beds_collection.find_one({"id": bed_id})
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed.get("status") != "available":
        raise HTTPException(status_code=400, detail="Bed not available")
    
    await beds_collection.update_one({"id": bed_id}, {
        "$set": {
            "status": "occupied",
            "current_patient": {"id": patient_id, "name": patient_name},
            "admission_date": datetime.utcnow().isoformat(),
            "admitted_by": current_user["id"]
        }
    })
    
    await create_notification(patient_id, "Bed Admission",
        f"You have been admitted to {bed['ward']} - Bed {bed['bed_number']}",
        "admission", {"bed_id": bed_id})
    
    return {"message": "Patient admitted successfully"}

@app.post("/api/beds/{bed_id}/discharge")
async def discharge_patient(bed_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    bed = await beds_collection.find_one({"id": bed_id})
    if not bed or bed.get("status") != "occupied":
        raise HTTPException(status_code=400, detail="Invalid bed status")
    
    patient = bed.get("current_patient")
    
    await beds_collection.update_one({"id": bed_id}, {
        "$set": {
            "status": "available",
            "current_patient": None,
            "admission_date": None
        }
    })
    
    if patient:
        await create_notification(patient["id"], "Discharge Complete",
            f"You have been discharged from {bed['ward']} - Bed {bed['bed_number']}",
            "discharge", {"bed_id": bed_id})
    
    return {"message": "Patient discharged successfully"}

# ==================== PRESCRIPTIONS ====================
@app.get("/api/prescriptions")
async def get_prescriptions(patient_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") in ["admin", "doctor"]:
        query = {"patient_id": patient_id} if patient_id else {}
    else:
        query = {"patient_id": current_user["id"]}
    
    prescriptions = await prescriptions_collection.find(query).sort("created_at", -1).to_list(100)
    return [serialize_doc(p) for p in prescriptions]

@app.post("/api/prescriptions")
async def create_prescription(prescription: PrescriptionCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    prescription_id = str(uuid.uuid4())
    prescription_doc = {
        "id": prescription_id,
        **prescription.dict(),
        "doctor_id": current_user["id"],
        "doctor_name": current_user["name"],
        "created_at": datetime.utcnow().isoformat()
    }
    await prescriptions_collection.insert_one(prescription_doc)
    
    await create_notification(prescription.patient_id, "New Prescription",
        f"Dr. {current_user['name']} has issued a new prescription for you.",
        "prescription", {"prescription_id": prescription_id})
    
    return serialize_doc(prescription_doc)

# ==================== MESSAGES/CHAT ====================
@app.get("/api/messages/{other_user_id}")
async def get_messages(other_user_id: str, current_user: dict = Depends(get_current_user)):
    messages = await messages_collection.find({
        "$or": [
            {"sender_id": current_user["id"], "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": current_user["id"]}
        ]
    }).sort("created_at", 1).to_list(100)
    return [serialize_doc(m) for m in messages]

@app.post("/api/messages")
async def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "sender_id": current_user["id"],
        "sender_name": current_user["name"],
        "receiver_id": message.receiver_id,
        "content": message.content,
        "created_at": datetime.utcnow().isoformat(),
        "read": False
    }
    await messages_collection.insert_one(message_doc)
    await manager.send_personal_message(serialize_doc(message_doc), message.receiver_id)
    return serialize_doc(message_doc)

@app.get("/api/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    pipeline = [
        {"$match": {"$or": [{"sender_id": current_user["id"]}, {"receiver_id": current_user["id"]}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {"$cond": [{"$eq": ["$sender_id", current_user["id"]]}, "$receiver_id", "$sender_id"]},
            "last_message": {"$first": "$content"},
            "last_time": {"$first": "$created_at"},
            "unread": {"$sum": {"$cond": [{"$and": [{"$eq": ["$receiver_id", current_user["id"]]}, {"$eq": ["$read", False]}]}, 1, 0]}}
        }}
    ]
    conversations = await messages_collection.aggregate(pipeline).to_list(50)
    
    result = []
    for conv in conversations:
        other_id = conv["_id"]
        other_user = await users_collection.find_one({"id": other_id}) or await doctors_collection.find_one({"id": other_id})
        if other_user:
            result.append({
                "user_id": other_id,
                "user_name": other_user.get("name"),
                "user_role": other_user.get("role"),
                "last_message": conv["last_message"],
                "last_time": conv["last_time"],
                "unread_count": conv["unread"]
            })
    return result

@app.websocket("/api/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                message_doc = {
                    "id": str(uuid.uuid4()),
                    "sender_id": user_id,
                    "sender_name": data.get("sender_name", "Unknown"),
                    "receiver_id": data["receiver_id"],
                    "content": data["content"],
                    "created_at": datetime.utcnow().isoformat(),
                    "read": False
                }
                await messages_collection.insert_one(message_doc)
                await manager.send_personal_message(serialize_doc(message_doc), data["receiver_id"])
                await manager.send_personal_message(serialize_doc(message_doc), user_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# ==================== EQUIPMENT ====================
@app.get("/api/equipment")
async def get_equipment(category: Optional[str] = None, department: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if department:
        query["department"] = department
    equipment = await equipment_collection.find(query).to_list(100)
    return [serialize_doc(e) for e in equipment]

@app.post("/api/equipment")
async def add_equipment(equipment: EquipmentCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    equipment_id = str(uuid.uuid4())
    equipment_doc = {
        "id": equipment_id,
        **equipment.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    await equipment_collection.insert_one(equipment_doc)
    return serialize_doc(equipment_doc)

# ==================== REPORTS ====================
@app.get("/api/reports")
async def get_reports(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") in ["admin", "staff", "doctor"]:
        reports = await reports_collection.find().to_list(500)
    else:
        reports = await reports_collection.find({"patient_id": current_user["id"]}).to_list(100)
    return [serialize_doc(r) for r in reports]

@app.post("/api/reports")
async def upload_report(
    patient_id: str = Form(...),
    report_type: str = Form(...),
    report_name: str = Form(...),
    notes: Optional[str] = Form(None),
    file_url: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") not in ["admin", "staff", "doctor"]:
        raise HTTPException(status_code=403, detail="Staff access required")
    
    report_id = str(uuid.uuid4())
    report_doc = {
        "id": report_id,
        "patient_id": patient_id,
        "report_type": report_type,
        "report_name": report_name,
        "notes": notes,
        "file_url": file_url,
        "uploaded_by": current_user["id"],
        "uploaded_by_name": current_user["name"],
        "created_at": datetime.utcnow().isoformat()
    }
    await reports_collection.insert_one(report_doc)
    
    await create_notification(patient_id, "New Medical Report",
        f"A new {report_type} report has been uploaded to your profile.",
        "report", {"report_id": report_id})
    
    return serialize_doc(report_doc)

# ==================== ANALYTICS ====================
@app.get("/api/analytics/patient")
async def get_patient_analytics(current_user: dict = Depends(get_current_user)):
    patient_id = current_user["id"]
    
    appointments = await appointments_collection.find({"patient_id": patient_id}).to_list(100)
    total_appointments = len(appointments)
    completed = len([a for a in appointments if a.get("status") == "completed"])
    upcoming = len([a for a in appointments if a.get("status") == "scheduled"])
    
    reports = await reports_collection.count_documents({"patient_id": patient_id})
    prescriptions = await prescriptions_collection.count_documents({"patient_id": patient_id})
    
    recent_appointments = sorted(appointments, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
    
    # Payment summary
    payments = await payments_collection.find({"user_id": patient_id, "status": "completed"}).to_list(100)
    total_spent = sum(p.get("amount", 0) for p in payments)
    
    return {
        "total_appointments": total_appointments,
        "completed_appointments": completed,
        "upcoming_appointments": upcoming,
        "total_reports": reports,
        "total_prescriptions": prescriptions,
        "total_spent": total_spent,
        "recent_appointments": [serialize_doc(a) for a in recent_appointments],
        "health_summary": {
            "last_checkup": recent_appointments[0].get("date") if recent_appointments else None,
            "doctors_visited": len(set(a.get("doctor_id") for a in appointments))
        }
    }

@app.get("/api/analytics/doctor")
async def get_doctor_analytics(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    doctor_id = current_user["id"]
    
    appointments = await appointments_collection.find({"doctor_id": doctor_id}).to_list(500)
    total = len(appointments)
    completed = len([a for a in appointments if a.get("status") == "completed"])
    cancelled = len([a for a in appointments if a.get("status") == "cancelled"])
    scheduled = len([a for a in appointments if a.get("status") == "scheduled"])
    
    unique_patients = len(set(a.get("patient_id") for a in appointments))
    
    reviews = await db.reviews.find({"doctor_id": doctor_id}).to_list(100)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    
    # Revenue
    paid_appointments = [a for a in appointments if a.get("payment_status") == "paid"]
    revenue = sum(a.get("fee", 0) for a in paid_appointments)
    
    # Weekly stats
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    daily_stats = {}
    for i in range(7):
        day = (week_start + timedelta(days=i)).isoformat()
        daily_stats[day] = len([a for a in appointments if a.get("date") == day])
    
    return {
        "total_appointments": total,
        "completed_appointments": completed,
        "cancelled_appointments": cancelled,
        "scheduled_appointments": scheduled,
        "unique_patients": unique_patients,
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "total_revenue": revenue,
        "weekly_appointments": daily_stats,
        "completion_rate": round((completed / total * 100) if total > 0 else 0, 1)
    }

@app.get("/api/analytics/admin")
async def get_admin_analytics(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await users_collection.count_documents({})
    total_doctors = await doctors_collection.count_documents({})
    total_appointments = await appointments_collection.count_documents({})
    total_reports = await reports_collection.count_documents({})
    
    # Revenue
    payments = await payments_collection.find({"status": "completed"}).to_list(1000)
    total_revenue = sum(p.get("amount", 0) for p in payments)
    
    appointments = await appointments_collection.find().to_list(1000)
    status_stats = {}
    dept_stats = {}
    for apt in appointments:
        status = apt.get("status", "unknown")
        status_stats[status] = status_stats.get(status, 0) + 1
        dept = apt.get("department", "Unknown")
        dept_stats[dept] = dept_stats.get(dept, 0) + 1
    
    recent_users = await users_collection.find().sort("created_at", -1).limit(5).to_list(5)
    low_inventory = await inventory_collection.find({"$expr": {"$lte": ["$quantity", "$min_threshold"]}}).to_list(10)
    
    # Bed availability
    beds = await beds_collection.find().to_list(500)
    available_beds = len([b for b in beds if b.get("status") == "available"])
    
    return {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "total_reports": total_reports,
        "total_revenue": total_revenue,
        "available_beds": available_beds,
        "total_beds": len(beds),
        "appointments_by_status": status_stats,
        "appointments_by_department": dept_stats,
        "recent_registrations": [{"name": u.get("name"), "email": u.get("email"), "date": u.get("created_at")} for u in recent_users],
        "low_inventory_alerts": [serialize_doc(i) for i in low_inventory]
    }

# ==================== USERS MANAGEMENT ====================
@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    users = await users_collection.find().to_list(500)
    return [{k: v for k, v in u.items() if k not in ["password", "_id"]} for u in users]

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = await users_collection.find_one({"id": user_id})
    if user and user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    await users_collection.delete_one({"id": user_id})
    return {"message": "User deleted"}

# ==================== AI CHATBOT ====================
@app.post("/api/chatbot")
async def chat_with_ai(message: str = Form(...), history: str = Form("[]")):
    try:
        chat_history = json.loads(history)
    except:
        chat_history = []
    
    system_prompt = """You are a friendly and helpful AI assistant for Nirmaya Health Services, a premium smart hospital. 
    Help users with:
    - Hospital services, departments, and facilities
    - Booking appointments and health packages
    - Information about doctors and specialties
    - Medical equipment and technology
    - Emergency services and ambulance
    - Lab tests and health checkups
    - Payment and billing inquiries
    
    Be concise, professional, and empathetic. For specific medical advice, recommend consulting a doctor."""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://integrations.emergentagent.com/api/llm/chat",
                headers={
                    "Authorization": f"Bearer {GEMINI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "provider": "gemini",
                    "model": "gemini-2.0-flash",
                    "messages": [{"role": "user", "content": f"{system_prompt}\n\nUser: {message}"}],
                    "max_tokens": 500
                },
                timeout=30.0
            )
            result = response.json()
            bot_response = result.get("choices", [{}])[0].get("message", {}).get("content", "I'm sorry, I couldn't process that request.")
    except Exception as e:
        print(f"Chatbot error: {e}")
        bot_response = "I'm having trouble connecting right now. Please try again later or contact our support team."
    
    return {"response": bot_response}

# ==================== SEED DATA ====================
@app.post("/api/seed")
async def seed_data():
    # Check if admin exists
    admin = await users_collection.find_one({"role": "admin"})
    if not admin:
        admin_id = str(uuid.uuid4())
        await users_collection.insert_one({
            "id": admin_id,
            "name": "Admin",
            "email": "admin@nirmaya.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.utcnow().isoformat()
        })
    
    # Seed equipment if empty
    equipment_count = await equipment_collection.count_documents({})
    if equipment_count == 0:
        equipment_data = [
            {"id": str(uuid.uuid4()), "name": "MRI Scanner", "category": "Diagnostic Imaging", "department": "Radiology", "description": "3 Tesla MRI machine for detailed brain, spine, and body imaging", "manufacturer": "Siemens", "model": "MAGNETOM Vida", "status": "Available", "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400"},
            {"id": str(uuid.uuid4()), "name": "CT Scanner", "category": "Diagnostic Imaging", "department": "Radiology", "description": "128-slice CT scanner for rapid whole-body imaging", "manufacturer": "GE Healthcare", "model": "Revolution CT", "status": "Available", "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400"},
            {"id": str(uuid.uuid4()), "name": "Digital X-Ray System", "category": "Diagnostic Imaging", "department": "Radiology", "description": "Advanced digital radiography system", "manufacturer": "Philips", "model": "DigitalDiagnost C90", "status": "Available", "image": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400"},
            {"id": str(uuid.uuid4()), "name": "Ultrasound Machine", "category": "Diagnostic Imaging", "department": "Radiology", "description": "4D ultrasound for obstetrics and general imaging", "manufacturer": "Samsung", "model": "HS70A", "status": "Available", "image": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400"},
            {"id": str(uuid.uuid4()), "name": "ECG Machine", "category": "Cardiac Monitoring", "department": "Cardiology", "description": "12-lead electrocardiograph for cardiac diagnostics", "manufacturer": "Philips", "model": "PageWriter TC70", "status": "Available", "image": "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=400"},
            {"id": str(uuid.uuid4()), "name": "Ventilator", "category": "Life Support", "department": "ICU", "description": "Advanced mechanical ventilator for critical care", "manufacturer": "Medtronic", "model": "Puritan Bennett 980", "status": "Available", "image": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400"},
            {"id": str(uuid.uuid4()), "name": "Defibrillator", "category": "Emergency", "department": "Emergency", "description": "Automated external defibrillator for cardiac emergencies", "manufacturer": "Zoll", "model": "X Series", "status": "Available", "image": "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400"},
            {"id": str(uuid.uuid4()), "name": "Surgical Robot", "category": "Surgical", "department": "Surgery", "description": "Da Vinci surgical system for minimally invasive surgery", "manufacturer": "Intuitive Surgical", "model": "Da Vinci Xi", "status": "Available", "image": "https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400"},
            {"id": str(uuid.uuid4()), "name": "Endoscopy System", "category": "Diagnostic", "department": "Gastroenterology", "description": "HD video endoscopy system", "manufacturer": "Olympus", "model": "EVIS X1", "status": "Available", "image": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400"},
            {"id": str(uuid.uuid4()), "name": "Patient Monitor", "category": "Monitoring", "department": "ICU", "description": "Multi-parameter patient monitoring system", "manufacturer": "Philips", "model": "IntelliVue MX800", "status": "Available", "image": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400"},
        ]
        await equipment_collection.insert_many(equipment_data)
    
    # Seed doctors if empty
    doctors_count = await doctors_collection.count_documents({})
    if doctors_count == 0:
        doctors_data = [
            {"id": str(uuid.uuid4()), "name": "Dr. Ananya Sharma", "email": "ananya@nirmaya.com", "password": hash_password("doctor123"), "specialty": "Cardiologist", "department": "Cardiology", "experience": "15 years", "qualifications": "MD, DM Cardiology", "certifications": ["FACC", "FSCAI"], "bio": "Expert in interventional cardiology with focus on complex coronary interventions.", "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400", "time_slots": ["09:00", "10:00", "11:00", "14:00", "15:00"], "consultation_fee": 800, "video_consultation_fee": 600, "role": "doctor", "available_for_video": True, "created_at": datetime.utcnow().isoformat()},
            {"id": str(uuid.uuid4()), "name": "Dr. Rajesh Kumar", "email": "rajesh@nirmaya.com", "password": hash_password("doctor123"), "specialty": "Neurologist", "department": "Neurology", "experience": "12 years", "qualifications": "MD, DM Neurology", "certifications": ["FAAN"], "bio": "Specializes in stroke management and neurodegenerative diseases.", "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400", "time_slots": ["10:00", "11:00", "12:00", "15:00", "16:00"], "consultation_fee": 750, "video_consultation_fee": 550, "role": "doctor", "available_for_video": True, "created_at": datetime.utcnow().isoformat()},
            {"id": str(uuid.uuid4()), "name": "Dr. Priya Patel", "email": "priya@nirmaya.com", "password": hash_password("doctor123"), "specialty": "Pediatrician", "department": "Pediatrics", "experience": "10 years", "qualifications": "MD Pediatrics", "certifications": ["IAP Fellow"], "bio": "Dedicated to children's health with expertise in neonatal care.", "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400", "time_slots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "consultation_fee": 600, "video_consultation_fee": 450, "role": "doctor", "available_for_video": True, "created_at": datetime.utcnow().isoformat()},
            {"id": str(uuid.uuid4()), "name": "Dr. Vikram Singh", "email": "vikram@nirmaya.com", "password": hash_password("doctor123"), "specialty": "Orthopedic Surgeon", "department": "Orthopedics", "experience": "18 years", "qualifications": "MS Orthopedics", "certifications": ["FICS"], "bio": "Expert in joint replacement surgery and sports medicine.", "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400", "time_slots": ["09:00", "10:00", "14:00", "15:00"], "consultation_fee": 900, "video_consultation_fee": 700, "role": "doctor", "available_for_video": True, "created_at": datetime.utcnow().isoformat()},
            {"id": str(uuid.uuid4()), "name": "Dr. Meera Reddy", "email": "meera@nirmaya.com", "password": hash_password("doctor123"), "specialty": "Dermatologist", "department": "Dermatology", "experience": "8 years", "qualifications": "MD Dermatology", "certifications": ["IADVL"], "bio": "Specializes in cosmetic dermatology and skin cancer treatment.", "image": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400", "time_slots": ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"], "consultation_fee": 700, "video_consultation_fee": 500, "role": "doctor", "available_for_video": True, "created_at": datetime.utcnow().isoformat()},
        ]
        await doctors_collection.insert_many(doctors_data)
    
    # Seed health packages if empty
    packages_count = await health_packages_collection.count_documents({})
    if packages_count == 0:
        packages_data = [
            {"id": str(uuid.uuid4()), "name": "Basic Health Checkup", "description": "Essential health screening for adults", "tests_included": ["Complete Blood Count", "Blood Sugar", "Lipid Profile", "Liver Function Test", "Kidney Function Test", "Urine Analysis"], "price": 1999, "discounted_price": 1499, "duration": "2-3 hours", "category": "Basic"},
            {"id": str(uuid.uuid4()), "name": "Comprehensive Health Package", "description": "Complete health assessment with advanced tests", "tests_included": ["Complete Blood Count", "Blood Sugar", "Lipid Profile", "Liver Function Test", "Kidney Function Test", "Thyroid Profile", "ECG", "Chest X-Ray", "Ultrasound Abdomen"], "price": 4999, "discounted_price": 3999, "duration": "4-5 hours", "category": "Comprehensive"},
            {"id": str(uuid.uuid4()), "name": "Cardiac Health Package", "description": "Specialized heart health assessment", "tests_included": ["ECG", "2D Echo", "Stress Test", "Lipid Profile", "Blood Sugar", "Cardiac Markers"], "price": 6999, "discounted_price": 5499, "duration": "3-4 hours", "category": "Specialized"},
            {"id": str(uuid.uuid4()), "name": "Women's Health Package", "description": "Complete health checkup for women", "tests_included": ["Complete Blood Count", "Thyroid Profile", "Vitamin D", "Calcium", "Pap Smear", "Mammography", "Pelvic Ultrasound"], "price": 5999, "discounted_price": 4999, "duration": "4-5 hours", "category": "Women"},
            {"id": str(uuid.uuid4()), "name": "Senior Citizen Package", "description": "Comprehensive health check for seniors", "tests_included": ["Complete Blood Count", "Blood Sugar", "Lipid Profile", "Kidney Function", "Liver Function", "Bone Density", "ECG", "Chest X-Ray", "Eye Checkup"], "price": 7999, "discounted_price": 6499, "duration": "5-6 hours", "category": "Senior"},
        ]
        await health_packages_collection.insert_many(packages_data)
    
    # Seed lab tests if empty
    lab_tests_count = await lab_tests_collection.count_documents({})
    if lab_tests_count == 0:
        lab_tests_data = [
            {"id": str(uuid.uuid4()), "test_name": "Complete Blood Count (CBC)", "category": "Hematology", "price": 350, "description": "Measures different components of blood", "preparation": "No special preparation required", "duration": "Same day"},
            {"id": str(uuid.uuid4()), "test_name": "Lipid Profile", "category": "Biochemistry", "price": 650, "description": "Measures cholesterol and triglycerides", "preparation": "Fasting for 12 hours required", "duration": "Same day"},
            {"id": str(uuid.uuid4()), "test_name": "Thyroid Profile (T3, T4, TSH)", "category": "Endocrinology", "price": 800, "description": "Complete thyroid function assessment", "preparation": "No special preparation required", "duration": "Same day"},
            {"id": str(uuid.uuid4()), "test_name": "HbA1c", "category": "Diabetes", "price": 550, "description": "3-month average blood sugar level", "preparation": "No fasting required", "duration": "Same day"},
            {"id": str(uuid.uuid4()), "test_name": "Vitamin D", "category": "Vitamins", "price": 1200, "description": "Measures vitamin D levels in blood", "preparation": "No special preparation required", "duration": "1-2 days"},
            {"id": str(uuid.uuid4()), "test_name": "Liver Function Test (LFT)", "category": "Biochemistry", "price": 700, "description": "Assesses liver health and function", "preparation": "Fasting for 8-10 hours", "duration": "Same day"},
            {"id": str(uuid.uuid4()), "test_name": "Kidney Function Test (KFT)", "category": "Biochemistry", "price": 600, "description": "Evaluates kidney function", "preparation": "No special preparation required", "duration": "Same day"},
            {"id": str(uuid.uuid4()), "test_name": "COVID-19 RT-PCR", "category": "Infectious Disease", "price": 500, "description": "Detects active COVID-19 infection", "preparation": "No eating/drinking 30 mins before", "duration": "24-48 hours"},
        ]
        await lab_tests_collection.insert_many(lab_tests_data)
    
    # Seed beds if empty
    beds_count = await beds_collection.count_documents({})
    if beds_count == 0:
        beds_data = []
        wards = [
            {"name": "General Ward", "beds": 20, "price": 1500},
            {"name": "Semi-Private", "beds": 15, "price": 3000},
            {"name": "Private Room", "beds": 10, "price": 5000},
            {"name": "ICU", "beds": 8, "price": 15000},
            {"name": "NICU", "beds": 5, "price": 12000},
            {"name": "Maternity", "beds": 10, "price": 4000},
        ]
        for ward in wards:
            for i in range(1, ward["beds"] + 1):
                beds_data.append({
                    "id": str(uuid.uuid4()),
                    "bed_number": f"{ward['name'][:3].upper()}-{i:03d}",
                    "ward": ward["name"],
                    "room_number": f"R{(i-1)//4 + 1:02d}",
                    "bed_type": ward["name"],
                    "price_per_day": ward["price"],
                    "features": ["AC", "TV", "Attached Bathroom"] if ward["price"] >= 3000 else ["Fan"],
                    "status": "available",
                    "current_patient": None
                })
        await beds_collection.insert_many(beds_data)
    
    # Seed inventory if empty
    inventory_count = await inventory_collection.count_documents({})
    if inventory_count == 0:
        inventory_data = [
            {"id": str(uuid.uuid4()), "item_name": "Surgical Masks", "category": "PPE", "quantity": 5000, "unit": "pieces", "min_threshold": 1000, "max_threshold": 10000, "unit_price": 5, "supplier": "MediSupply Co.", "department": "General", "expiry_date": "2026-12-31"},
            {"id": str(uuid.uuid4()), "item_name": "Surgical Gloves (Latex)", "category": "PPE", "quantity": 3000, "unit": "pairs", "min_threshold": 500, "max_threshold": 5000, "unit_price": 8, "supplier": "MediSupply Co.", "department": "Surgery", "expiry_date": "2026-06-30"},
            {"id": str(uuid.uuid4()), "item_name": "Syringes (5ml)", "category": "Medical Supplies", "quantity": 2000, "unit": "pieces", "min_threshold": 500, "max_threshold": 5000, "unit_price": 3, "supplier": "BD Medical", "department": "General", "expiry_date": "2027-01-15"},
            {"id": str(uuid.uuid4()), "item_name": "IV Cannula", "category": "Medical Supplies", "quantity": 800, "unit": "pieces", "min_threshold": 200, "max_threshold": 2000, "unit_price": 25, "supplier": "BD Medical", "department": "ICU", "expiry_date": "2026-08-20"},
            {"id": str(uuid.uuid4()), "item_name": "Paracetamol 500mg", "category": "Medications", "quantity": 5000, "unit": "tablets", "min_threshold": 1000, "max_threshold": 10000, "unit_price": 1.5, "supplier": "Cipla", "department": "Pharmacy", "expiry_date": "2025-12-31"},
            {"id": str(uuid.uuid4()), "item_name": "Amoxicillin 500mg", "category": "Medications", "quantity": 2000, "unit": "capsules", "min_threshold": 500, "max_threshold": 5000, "unit_price": 3, "supplier": "Cipla", "department": "Pharmacy", "expiry_date": "2025-09-30"},
            {"id": str(uuid.uuid4()), "item_name": "Blood Pressure Monitor", "category": "Equipment", "quantity": 25, "unit": "units", "min_threshold": 5, "max_threshold": 50, "unit_price": 2500, "supplier": "Omron", "department": "General"},
            {"id": str(uuid.uuid4()), "item_name": "Stethoscope", "category": "Equipment", "quantity": 30, "unit": "units", "min_threshold": 10, "max_threshold": 50, "unit_price": 3000, "supplier": "3M Littmann", "department": "General"},
        ]
        for item in inventory_data:
            item["created_at"] = datetime.utcnow().isoformat()
            item["last_restocked"] = datetime.utcnow().isoformat()
            item["usage_history"] = []
        await inventory_collection.insert_many(inventory_data)
    
    return {"message": "Data seeded successfully"}

# ==================== STRIPE PAYMENT ROUTES ====================
# Initialize Stripe
stripe.api_key = STRIPE_API_KEY

class PaymentRequest(BaseModel):
    package_id: Optional[str] = None
    appointment_id: Optional[str] = None
    lab_test_id: Optional[str] = None
    origin_url: str
    payment_type: str  # "package", "appointment", "lab_test"

@app.post("/api/payments/create-checkout")
async def create_checkout_session(
    request: Request,
    payment_data: PaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for payment"""
    try:
        amount = 0.0
        item_name = ""
        metadata = {
            "user_id": current_user["id"],
            "user_email": current_user.get("email", ""),
            "payment_type": payment_data.payment_type
        }
        
        # Get amount based on payment type (server-side only - NEVER from client)
        if payment_data.payment_type == "package" and payment_data.package_id:
            package = await health_packages_collection.find_one({"id": payment_data.package_id})
            if not package:
                raise HTTPException(status_code=404, detail="Package not found")
            amount = float(package.get("discounted_price") or package.get("price", 0))
            item_name = package.get("name", "Health Package")
            metadata["package_id"] = payment_data.package_id
            
        elif payment_data.payment_type == "appointment" and payment_data.appointment_id:
            appointment = await appointments_collection.find_one({"id": payment_data.appointment_id})
            if not appointment:
                raise HTTPException(status_code=404, detail="Appointment not found")
            doctor = await doctors_collection.find_one({"id": appointment.get("doctor_id")})
            amount = float(doctor.get("consultation_fee", 500) if doctor else 500)
            item_name = f"Consultation with {doctor.get('name', 'Doctor')}" if doctor else "Doctor Consultation"
            metadata["appointment_id"] = payment_data.appointment_id
            
        elif payment_data.payment_type == "lab_test" and payment_data.lab_test_id:
            lab_test = await lab_tests_collection.find_one({"id": payment_data.lab_test_id})
            if not lab_test:
                raise HTTPException(status_code=404, detail="Lab test not found")
            amount = float(lab_test.get("price", 0))
            item_name = lab_test.get("test_name", "Lab Test")
            metadata["lab_test_id"] = payment_data.lab_test_id
        else:
            raise HTTPException(status_code=400, detail="Invalid payment type or missing item ID")
        
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")
        
        # Build URLs from provided origin (NEVER hardcode)
        success_url = f"{payment_data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{payment_data.origin_url}/payment-cancel"
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': item_name,
                    },
                    'unit_amount': int(amount * 100),  # Stripe expects amount in smallest currency unit
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Create payment transaction record BEFORE redirect
        transaction = {
            "id": str(uuid.uuid4()),
            "session_id": checkout_session.id,
            "user_id": current_user["id"],
            "user_email": current_user.get("email"),
            "amount": amount,
            "currency": "inr",
            "item_name": item_name,
            "payment_type": payment_data.payment_type,
            "metadata": metadata,
            "status": "pending",
            "payment_status": "initiated",
            "created_at": datetime.utcnow().isoformat()
        }
        await payment_transactions_collection.insert_one(transaction)
        
        return {
            "url": checkout_session.url,
            "session_id": checkout_session.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Get the status of a payment"""
    try:
        # Check local database first
        transaction = await payment_transactions_collection.find_one({"session_id": session_id}, {"_id": 0})
        
        if transaction and transaction.get("payment_status") == "paid":
            return {
                "status": "complete",
                "payment_status": "paid",
                "amount": transaction.get("amount"),
                "currency": transaction.get("currency"),
                "item_name": transaction.get("item_name")
            }
        
        # Check with Stripe
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        
        # Update local database
        new_status = "paid" if checkout_session.payment_status == "paid" else checkout_session.payment_status
        
        if transaction and transaction.get("payment_status") != new_status:
            await payment_transactions_collection.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "status": checkout_session.status,
                        "payment_status": new_status,
                        "updated_at": datetime.utcnow().isoformat()
                    }
                }
            )
            
            # If paid, update the related item
            if new_status == "paid" and transaction:
                await process_successful_payment(transaction)
        
        return {
            "status": checkout_session.status,
            "payment_status": checkout_session.payment_status,
            "amount": checkout_session.amount_total / 100 if checkout_session.amount_total else 0,
            "currency": checkout_session.currency,
            "metadata": dict(checkout_session.metadata) if checkout_session.metadata else {}
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

async def process_successful_payment(transaction: dict):
    """Process a successful payment - update related records"""
    try:
        payment_type = transaction.get("payment_type")
        metadata = transaction.get("metadata", {})
        user_id = transaction.get("user_id")
        
        if payment_type == "appointment" and metadata.get("appointment_id"):
            await appointments_collection.update_one(
                {"id": metadata["appointment_id"]},
                {"$set": {"payment_status": "paid", "paid_at": datetime.utcnow().isoformat()}}
            )
            await create_notification(user_id, "Payment Confirmed", 
                "Your appointment payment has been confirmed.", "payment")
                
        elif payment_type == "package" and metadata.get("package_id"):
            # Create booking record for health package
            package = await health_packages_collection.find_one({"id": metadata["package_id"]})
            if package:
                booking = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "package_id": metadata["package_id"],
                    "package_name": package.get("name"),
                    "status": "confirmed",
                    "payment_status": "paid",
                    "amount_paid": transaction.get("amount"),
                    "booked_at": datetime.utcnow().isoformat()
                }
                await db.package_bookings.insert_one(booking)
                await create_notification(user_id, "Package Booked Successfully", 
                    f"Your {package.get('name')} has been confirmed.", "payment")
                    
        elif payment_type == "lab_test" and metadata.get("lab_test_id"):
            lab_test = await lab_tests_collection.find_one({"id": metadata["lab_test_id"]})
            if lab_test:
                booking = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "test_id": metadata["lab_test_id"],
                    "test_name": lab_test.get("test_name"),
                    "status": "confirmed",
                    "payment_status": "paid",
                    "amount_paid": transaction.get("amount"),
                    "booked_at": datetime.utcnow().isoformat()
                }
                await db.lab_test_bookings.insert_one(booking)
                await create_notification(user_id, "Lab Test Booked", 
                    f"Your {lab_test.get('test_name')} has been booked.", "payment")
                    
    except Exception as e:
        print(f"Error processing payment: {e}")

@app.get("/api/payments/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """Get payment history for current user"""
    transactions = await payment_transactions_collection.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return transactions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
