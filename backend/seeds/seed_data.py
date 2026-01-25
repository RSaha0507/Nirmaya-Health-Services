"""
Comprehensive seed data for Nirmaya Health Services
Run: python -m seeds.seed_data
"""
import asyncio
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
from datetime import datetime, timedelta

MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://nirmaya_admin:nirmaya%40admin12345@cluster0.uev8tun.mongodb.net/nirmaya_health?retryWrites=true&w=majority&appName=Cluster0")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ==================== DEPARTMENTS DATA ====================
DEPARTMENTS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Cardiology",
        "slug": "cardiology",
        "icon": "heart",
        "description": "Comprehensive heart care with advanced diagnostic and treatment facilities for all cardiac conditions.",
        "head_doctor": "Dr. Ananya Sharma",
        "diseases_treated": [
            "Coronary Artery Disease", "Heart Failure", "Arrhythmias", "Hypertension",
            "Valvular Heart Disease", "Cardiomyopathy", "Congenital Heart Defects",
            "Peripheral Artery Disease", "Angina", "Myocardial Infarction"
        ],
        "surgeries_offered": [
            "Coronary Angioplasty & Stenting", "Coronary Artery Bypass Grafting (CABG)",
            "Heart Valve Repair/Replacement", "Pacemaker Implantation",
            "Cardiac Ablation", "TAVR (Transcatheter Aortic Valve Replacement)"
        ],
        "features": [
            "24/7 Cath Lab", "Advanced Echo & Stress Testing", "Cardiac Rehabilitation Center",
            "Electrophysiology Lab", "Heart Failure Clinic"
        ],
        "benefits": [
            "Minimally invasive procedures", "Faster recovery times",
            "World-class cardiologists", "Comprehensive cardiac screening"
        ],
        "image": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Neurology",
        "slug": "neurology",
        "icon": "brain",
        "description": "Expert care for brain, spine, and nervous system disorders with cutting-edge technology.",
        "head_doctor": "Dr. Rajesh Kumar",
        "diseases_treated": [
            "Stroke", "Epilepsy", "Parkinson's Disease", "Alzheimer's Disease",
            "Multiple Sclerosis", "Migraine", "Neuropathy", "Brain Tumors",
            "Spinal Cord Disorders", "Neuromuscular Diseases"
        ],
        "surgeries_offered": [
            "Brain Tumor Surgery", "Deep Brain Stimulation", "Spinal Surgery",
            "Epilepsy Surgery", "Aneurysm Clipping", "Microvascular Decompression"
        ],
        "features": [
            "Neuro ICU", "Advanced MRI & CT Imaging", "EEG & EMG Lab",
            "Stroke Unit", "Neurorehabilitation Center"
        ],
        "benefits": [
            "Rapid stroke intervention", "Minimally invasive neurosurgery",
            "Comprehensive epilepsy management", "Expert movement disorder care"
        ],
        "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Orthopedics",
        "slug": "orthopedics",
        "icon": "bone",
        "description": "Complete musculoskeletal care including joint replacements, sports medicine, and spine surgery.",
        "head_doctor": "Dr. Vikram Singh",
        "diseases_treated": [
            "Arthritis", "Osteoporosis", "Sports Injuries", "Fractures",
            "Back Pain", "Scoliosis", "Carpal Tunnel Syndrome", "Tendinitis",
            "Ligament Injuries", "Bone Tumors"
        ],
        "surgeries_offered": [
            "Total Knee Replacement", "Total Hip Replacement", "Arthroscopic Surgery",
            "Spinal Fusion", "ACL Reconstruction", "Shoulder Replacement",
            "Fracture Fixation", "Hand & Wrist Surgery"
        ],
        "features": [
            "Robotic Joint Replacement", "Sports Medicine Center", "Spine Center",
            "Physical Therapy Unit", "Trauma Care"
        ],
        "benefits": [
            "Computer-assisted surgery", "Faster rehabilitation",
            "Sports injury expertise", "Comprehensive joint care"
        ],
        "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Oncology",
        "slug": "oncology",
        "icon": "ribbon",
        "description": "Comprehensive cancer care with advanced chemotherapy, radiation, and surgical oncology services.",
        "head_doctor": "Dr. Meera Kapoor",
        "diseases_treated": [
            "Breast Cancer", "Lung Cancer", "Colorectal Cancer", "Prostate Cancer",
            "Leukemia", "Lymphoma", "Brain Tumors", "Liver Cancer",
            "Ovarian Cancer", "Skin Cancer"
        ],
        "surgeries_offered": [
            "Tumor Resection", "Mastectomy", "Whipple Procedure",
            "Robotic Cancer Surgery", "HIPEC", "Bone Marrow Transplant"
        ],
        "features": [
            "PET-CT Scanning", "Linear Accelerator for Radiation", "Chemotherapy Suite",
            "Cancer Genetics Lab", "Palliative Care Unit"
        ],
        "benefits": [
            "Multidisciplinary tumor board", "Targeted therapy options",
            "Supportive care services", "Clinical trials access"
        ],
        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Pediatrics",
        "slug": "pediatrics",
        "icon": "baby",
        "description": "Specialized healthcare for infants, children, and adolescents with child-friendly facilities.",
        "head_doctor": "Dr. Priya Patel",
        "diseases_treated": [
            "Childhood Infections", "Asthma", "Allergies", "Growth Disorders",
            "Developmental Delays", "Congenital Abnormalities", "Childhood Diabetes",
            "ADHD", "Autism Spectrum Disorders", "Pediatric Cancers"
        ],
        "surgeries_offered": [
            "Pediatric Heart Surgery", "Cleft Lip/Palate Repair", "Hernia Repair",
            "Appendectomy", "Tonsillectomy", "Pediatric Orthopedic Surgery"
        ],
        "features": [
            "NICU", "PICU", "Child-Friendly Environment", "Pediatric Emergency",
            "Vaccination Center"
        ],
        "benefits": [
            "Child life specialists", "Family-centered care",
            "Specialized pediatric equipment", "Play therapy"
        ],
        "image": "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Gynecology & Obstetrics",
        "slug": "gynecology",
        "icon": "female",
        "description": "Complete women's health services including maternity care, fertility treatments, and gynecological surgery.",
        "head_doctor": "Dr. Sunita Reddy",
        "diseases_treated": [
            "PCOS", "Endometriosis", "Uterine Fibroids", "Ovarian Cysts",
            "Menstrual Disorders", "Infertility", "Cervical Dysplasia",
            "Pelvic Inflammatory Disease", "Menopause Symptoms", "Pregnancy Complications"
        ],
        "surgeries_offered": [
            "C-Section", "Hysterectomy", "Laparoscopic Surgery", "Hysteroscopy",
            "Myomectomy", "Ovarian Cystectomy", "Tubal Ligation"
        ],
        "features": [
            "Labor & Delivery Suites", "IVF Center", "High-Risk Pregnancy Unit",
            "Fetal Medicine", "Menopause Clinic"
        ],
        "benefits": [
            "Painless delivery options", "Advanced fertility treatments",
            "Minimally invasive surgery", "Comprehensive prenatal care"
        ],
        "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Urology",
        "slug": "urology",
        "icon": "kidney",
        "description": "Expert care for urinary tract and male reproductive system disorders with advanced surgical techniques.",
        "head_doctor": "Dr. Arun Mehta",
        "diseases_treated": [
            "Kidney Stones", "Prostate Enlargement (BPH)", "Prostate Cancer",
            "Urinary Incontinence", "Urinary Tract Infections", "Bladder Cancer",
            "Erectile Dysfunction", "Male Infertility", "Kidney Tumors", "Varicocele"
        ],
        "surgeries_offered": [
            "TURP", "Laser Lithotripsy", "Radical Prostatectomy", "Nephrectomy",
            "Cystectomy", "Ureteroscopy", "Penile Implant Surgery"
        ],
        "features": [
            "Laser Surgery Suite", "Urodynamics Lab", "Andrology Center",
            "Kidney Stone Center", "Uro-Oncology Unit"
        ],
        "benefits": [
            "Minimally invasive stone treatment", "Robotic prostate surgery",
            "Comprehensive men's health", "Advanced incontinence care"
        ],
        "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Gastroenterology",
        "slug": "gastroenterology",
        "icon": "stomach",
        "description": "Comprehensive digestive health care with advanced endoscopy and liver disease management.",
        "head_doctor": "Dr. Sanjay Gupta",
        "diseases_treated": [
            "GERD", "Peptic Ulcers", "IBS", "Crohn's Disease", "Ulcerative Colitis",
            "Liver Cirrhosis", "Hepatitis", "Gallstones", "Pancreatitis", "Colon Cancer"
        ],
        "surgeries_offered": [
            "Endoscopy", "Colonoscopy", "ERCP", "Liver Transplant",
            "Bariatric Surgery", "Gallbladder Removal"
        ],
        "features": [
            "Endoscopy Suite", "Liver Clinic", "IBD Center", "Motility Lab",
            "Hepatology Unit"
        ],
        "benefits": [
            "Same-day endoscopy", "Advanced liver care",
            "Comprehensive GI screening", "Weight management programs"
        ],
        "image": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Pulmonology",
        "slug": "pulmonology",
        "icon": "lungs",
        "description": "Expert respiratory care for lung diseases with advanced diagnostic and treatment facilities.",
        "head_doctor": "Dr. Amit Joshi",
        "diseases_treated": [
            "Asthma", "COPD", "Pneumonia", "Tuberculosis", "Lung Cancer",
            "Sleep Apnea", "Pulmonary Fibrosis", "Bronchiectasis",
            "Pulmonary Hypertension", "Pleural Effusion"
        ],
        "surgeries_offered": [
            "Bronchoscopy", "Thoracoscopy", "Lung Biopsy", "Pleurodesis",
            "Lung Volume Reduction", "Lobectomy"
        ],
        "features": [
            "Pulmonary Function Lab", "Sleep Lab", "Bronchoscopy Suite",
            "Respiratory ICU", "TB Clinic"
        ],
        "benefits": [
            "Comprehensive lung screening", "Sleep disorder management",
            "Smoking cessation programs", "Pulmonary rehabilitation"
        ],
        "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Nephrology",
        "slug": "nephrology",
        "icon": "kidney",
        "description": "Specialized kidney care including dialysis services and kidney transplant programs.",
        "head_doctor": "Dr. Rakesh Sharma",
        "diseases_treated": [
            "Chronic Kidney Disease", "Acute Kidney Injury", "Diabetic Nephropathy",
            "Glomerulonephritis", "Polycystic Kidney Disease", "Kidney Stones",
            "Hypertensive Nephropathy", "Nephrotic Syndrome"
        ],
        "surgeries_offered": [
            "Kidney Transplant", "AV Fistula Creation", "Peritoneal Dialysis Catheter",
            "Kidney Biopsy"
        ],
        "features": [
            "Dialysis Center", "Transplant Unit", "Kidney Stone Clinic",
            "Pediatric Nephrology", "Home Dialysis Program"
        ],
        "benefits": [
            "24/7 dialysis services", "Living donor transplant program",
            "Comprehensive CKD management", "Home dialysis training"
        ],
        "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Dermatology",
        "slug": "dermatology",
        "icon": "skin",
        "description": "Complete skin care including cosmetic dermatology and treatment of skin diseases.",
        "head_doctor": "Dr. Kavita Nair",
        "diseases_treated": [
            "Acne", "Eczema", "Psoriasis", "Skin Cancer", "Vitiligo",
            "Fungal Infections", "Hair Loss", "Rosacea", "Urticaria", "Warts"
        ],
        "surgeries_offered": [
            "Skin Biopsy", "Mole Removal", "Laser Treatment", "Chemical Peels",
            "Hair Transplant", "Botox & Fillers"
        ],
        "features": [
            "Laser Center", "Cosmetic Dermatology", "Phototherapy Unit",
            "Hair Restoration Clinic", "Allergy Testing"
        ],
        "benefits": [
            "Advanced laser treatments", "Cosmetic procedures",
            "Comprehensive skin screening", "Hair loss solutions"
        ],
        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "ENT (Otolaryngology)",
        "slug": "ent",
        "icon": "ear",
        "description": "Expert care for ear, nose, throat, and head & neck disorders.",
        "head_doctor": "Dr. Deepak Verma",
        "diseases_treated": [
            "Sinusitis", "Tonsillitis", "Hearing Loss", "Vertigo", "Sleep Apnea",
            "Nasal Polyps", "Thyroid Nodules", "Voice Disorders", "Ear Infections"
        ],
        "surgeries_offered": [
            "Tonsillectomy", "Septoplasty", "Cochlear Implant", "Thyroidectomy",
            "Sinus Surgery", "Tympanoplasty", "Laryngoscopy"
        ],
        "features": [
            "Hearing Center", "Voice Clinic", "Sinus Center", "Sleep Clinic",
            "Head & Neck Oncology"
        ],
        "benefits": [
            "Advanced hearing solutions", "Minimally invasive sinus surgery",
            "Voice rehabilitation", "Comprehensive allergy care"
        ],
        "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Ophthalmology",
        "slug": "ophthalmology",
        "icon": "eye",
        "description": "Complete eye care from routine checkups to advanced surgical procedures.",
        "head_doctor": "Dr. Neha Agarwal",
        "diseases_treated": [
            "Cataract", "Glaucoma", "Diabetic Retinopathy", "Macular Degeneration",
            "Refractive Errors", "Dry Eye", "Corneal Diseases", "Retinal Detachment"
        ],
        "surgeries_offered": [
            "Cataract Surgery", "LASIK", "Glaucoma Surgery", "Retinal Surgery",
            "Corneal Transplant", "Oculoplasty"
        ],
        "features": [
            "Laser Vision Center", "Retina Clinic", "Glaucoma Clinic",
            "Pediatric Ophthalmology", "Contact Lens Clinic"
        ],
        "benefits": [
            "Bladeless LASIK", "Advanced IOL options",
            "Same-day cataract surgery", "Comprehensive eye screening"
        ],
        "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Psychiatry",
        "slug": "psychiatry",
        "icon": "brain",
        "description": "Comprehensive mental health services with compassionate care and modern treatment approaches.",
        "head_doctor": "Dr. Pooja Malhotra",
        "diseases_treated": [
            "Depression", "Anxiety Disorders", "Bipolar Disorder", "Schizophrenia",
            "OCD", "PTSD", "Addiction", "Eating Disorders", "ADHD", "Dementia"
        ],
        "surgeries_offered": [],
        "features": [
            "Outpatient Clinic", "De-addiction Center", "Child Psychiatry",
            "Geriatric Psychiatry", "Crisis Intervention"
        ],
        "benefits": [
            "Confidential care", "Holistic treatment approach",
            "Family therapy", "Rehabilitation programs"
        ],
        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "General Surgery",
        "slug": "general-surgery",
        "icon": "scalpel",
        "description": "Expert surgical care for a wide range of conditions with minimally invasive techniques.",
        "head_doctor": "Dr. Ramesh Iyer",
        "diseases_treated": [
            "Hernia", "Appendicitis", "Gallstones", "Thyroid Disorders",
            "Breast Lumps", "Hemorrhoids", "Varicose Veins", "Abdominal Tumors"
        ],
        "surgeries_offered": [
            "Laparoscopic Surgery", "Hernia Repair", "Appendectomy",
            "Cholecystectomy", "Thyroidectomy", "Breast Surgery", "Colorectal Surgery"
        ],
        "features": [
            "Day Surgery Center", "Minimally Invasive Surgery", "Trauma Surgery",
            "Surgical Oncology", "Bariatric Surgery"
        ],
        "benefits": [
            "Keyhole surgery", "Faster recovery",
            "Same-day discharge options", "Experienced surgeons"
        ],
        "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Emergency Medicine",
        "slug": "emergency",
        "icon": "ambulance",
        "description": "24/7 emergency care with rapid response teams and advanced life support facilities.",
        "head_doctor": "Dr. Ashok Kumar",
        "diseases_treated": [
            "Trauma", "Heart Attack", "Stroke", "Respiratory Emergencies",
            "Poisoning", "Burns", "Fractures", "Severe Infections", "Shock"
        ],
        "surgeries_offered": [
            "Emergency Trauma Surgery", "Emergency C-Section",
            "Emergency Appendectomy", "Wound Management"
        ],
        "features": [
            "24/7 Emergency Room", "Trauma Center", "Ambulance Fleet",
            "Helicopter Pad", "Rapid Response Team"
        ],
        "benefits": [
            "Zero waiting time for critical cases", "Advanced life support",
            "Trauma specialists on call", "Air ambulance service"
        ],
        "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600"
    }
]

# ==================== DOCTORS DATA ====================
def generate_doctors():
    doctors = []
    doctor_data = [
        # Cardiology
        {"name": "Dr. Ananya Sharma", "email": "ananya@nirmaya.com", "department": "Cardiology", "specialty": "Interventional Cardiologist", "experience": "15 years", "qualifications": "MBBS, MD (Cardiology), DM", "bio": "Expert in complex angioplasty and structural heart interventions.", "fee": 800, "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"},
        {"name": "Dr. Suresh Menon", "email": "suresh.m@nirmaya.com", "department": "Cardiology", "specialty": "Electrophysiologist", "experience": "12 years", "qualifications": "MBBS, MD, DM (Cardiology)", "bio": "Specializes in arrhythmia management and pacemaker implantation.", "fee": 750, "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"},
        
        # Neurology
        {"name": "Dr. Rajesh Kumar", "email": "rajesh.k@nirmaya.com", "department": "Neurology", "specialty": "Neurologist", "experience": "12 years", "qualifications": "MBBS, MD, DM (Neurology)", "bio": "Expert in stroke management and epilepsy treatment.", "fee": 700, "image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400"},
        {"name": "Dr. Smita Desai", "email": "smita.d@nirmaya.com", "department": "Neurology", "specialty": "Neurosurgeon", "experience": "18 years", "qualifications": "MBBS, MS, MCh (Neurosurgery)", "bio": "Renowned for complex brain tumor surgeries.", "fee": 900, "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400"},
        
        # Orthopedics
        {"name": "Dr. Vikram Singh", "email": "vikram.s@nirmaya.com", "department": "Orthopedics", "specialty": "Joint Replacement Surgeon", "experience": "14 years", "qualifications": "MBBS, MS (Ortho), Fellowship in Arthroplasty", "bio": "Pioneer in robotic knee and hip replacements.", "fee": 850, "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400"},
        {"name": "Dr. Kiran Rao", "email": "kiran.r@nirmaya.com", "department": "Orthopedics", "specialty": "Sports Medicine", "experience": "10 years", "qualifications": "MBBS, MS, Fellowship in Sports Medicine", "bio": "Team physician for professional sports teams.", "fee": 700, "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"},
        
        # Oncology
        {"name": "Dr. Meera Kapoor", "email": "meera.k@nirmaya.com", "department": "Oncology", "specialty": "Medical Oncologist", "experience": "16 years", "qualifications": "MBBS, MD, DM (Medical Oncology)", "bio": "Expert in targeted therapy and immunotherapy.", "fee": 900, "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"},
        
        # Pediatrics
        {"name": "Dr. Priya Patel", "email": "priya.p@nirmaya.com", "department": "Pediatrics", "specialty": "Pediatrician", "experience": "10 years", "qualifications": "MBBS, MD (Pediatrics)", "bio": "Specialist in newborn care and childhood development.", "fee": 600, "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400"},
        {"name": "Dr. Rahul Saxena", "email": "rahul.s@nirmaya.com", "department": "Pediatrics", "specialty": "Pediatric Surgeon", "experience": "13 years", "qualifications": "MBBS, MS, MCh (Pediatric Surgery)", "bio": "Expert in minimally invasive pediatric surgeries.", "fee": 750, "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"},
        
        # Gynecology
        {"name": "Dr. Sunita Reddy", "email": "sunita.r@nirmaya.com", "department": "Gynecology & Obstetrics", "specialty": "Obstetrician & Gynecologist", "experience": "18 years", "qualifications": "MBBS, MD (OB-GYN), Fellowship in Reproductive Medicine", "bio": "Expert in high-risk pregnancies and fertility treatments.", "fee": 800, "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"},
        {"name": "Dr. Lakshmi Nair", "email": "lakshmi.n@nirmaya.com", "department": "Gynecology & Obstetrics", "specialty": "Gynecologic Oncologist", "experience": "15 years", "qualifications": "MBBS, MD, DM (Gynec Oncology)", "bio": "Specialist in women's cancer treatment.", "fee": 850, "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400"},
        
        # Urology
        {"name": "Dr. Arun Mehta", "email": "arun.m@nirmaya.com", "department": "Urology", "specialty": "Urologist & Andrologist", "experience": "14 years", "qualifications": "MBBS, MS, MCh (Urology)", "bio": "Expert in laser stone surgery and male infertility.", "fee": 750, "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400"},
        {"name": "Dr. Geeta Sharma", "email": "geeta.s@nirmaya.com", "department": "Urology", "specialty": "Female Urologist", "experience": "11 years", "qualifications": "MBBS, MS, MCh (Urology)", "bio": "Specialist in female urological conditions and incontinence.", "fee": 700, "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"},
        
        # Gastroenterology
        {"name": "Dr. Sanjay Gupta", "email": "sanjay.g@nirmaya.com", "department": "Gastroenterology", "specialty": "Gastroenterologist", "experience": "13 years", "qualifications": "MBBS, MD, DM (Gastro)", "bio": "Expert in advanced endoscopy and liver diseases.", "fee": 700, "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"},
        
        # Pulmonology
        {"name": "Dr. Amit Joshi", "email": "amit.j@nirmaya.com", "department": "Pulmonology", "specialty": "Pulmonologist", "experience": "11 years", "qualifications": "MBBS, MD (Pulmonary Medicine)", "bio": "Specialist in asthma, COPD, and sleep disorders.", "fee": 650, "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400"},
        
        # Emergency
        {"name": "Dr. Ashok Kumar", "email": "ashok.k@nirmaya.com", "department": "Emergency Medicine", "specialty": "Emergency Physician", "experience": "12 years", "qualifications": "MBBS, MD (Emergency Medicine)", "bio": "Trauma specialist with expertise in critical care.", "fee": 500, "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"},
    ]
    
    time_slots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"]
    
    for doc in doctor_data:
        doctors.append({
            "id": str(uuid.uuid4()),
            "name": doc["name"],
            "email": doc["email"],
            "password": hash_password("doctor123"),
            "specialty": doc["specialty"],
            "department": doc["department"],
            "experience": doc["experience"],
            "qualifications": doc["qualifications"],
            "certifications": ["Board Certified", "Advanced Life Support"],
            "bio": doc["bio"],
            "image": doc["image"],
            "time_slots": time_slots[:8],
            "consultation_fee": doc["fee"],
            "video_consultation_fee": doc["fee"] - 100,
            "role": "doctor",
            "created_at": datetime.utcnow().isoformat(),
            "available_for_video": True
        })
    
    return doctors

# ==================== HEALTH PACKAGES ====================
HEALTH_PACKAGES = [
    # Cardiology Packages
    {
        "id": str(uuid.uuid4()),
        "name": "Complete Cardiac Checkup",
        "department": "Cardiology",
        "description": "Comprehensive heart health evaluation including ECG, Echo, and stress test.",
        "tests_included": ["ECG", "2D Echocardiography", "Treadmill Test (TMT)", "Lipid Profile", "Blood Sugar", "Kidney Function Test", "Chest X-Ray"],
        "price": 5999,
        "discounted_price": 4499,
        "duration": "4-5 hours",
        "category": "Cardiac",
        "ideal_for": "Adults above 40, those with family history of heart disease",
        "includes_consultation": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Advanced Cardiac Screening",
        "department": "Cardiology",
        "description": "Premium cardiac evaluation with CT Coronary Angiography for early detection.",
        "tests_included": ["CT Coronary Angiography", "ECG", "2D Echo with Color Doppler", "Lipid Profile", "HbA1c", "Homocysteine", "hs-CRP", "Cardiologist Consultation"],
        "price": 15999,
        "discounted_price": 12999,
        "duration": "1 day",
        "category": "Cardiac",
        "ideal_for": "High-risk individuals, diabetics, smokers",
        "includes_consultation": True
    },
    
    # Orthopedics Packages
    {
        "id": str(uuid.uuid4()),
        "name": "Bone & Joint Health Package",
        "department": "Orthopedics",
        "description": "Complete musculoskeletal evaluation for bone and joint health.",
        "tests_included": ["DEXA Scan (Bone Density)", "Vitamin D", "Calcium", "Phosphorus", "Uric Acid", "RA Factor", "X-Ray (as needed)", "Orthopedic Consultation"],
        "price": 4999,
        "discounted_price": 3499,
        "duration": "3-4 hours",
        "category": "Orthopedic",
        "ideal_for": "Women above 45, elderly, those with joint pain",
        "includes_consultation": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Sports Fitness Assessment",
        "department": "Orthopedics",
        "description": "Complete fitness evaluation for athletes and sports enthusiasts.",
        "tests_included": ["Body Composition Analysis", "Flexibility Test", "Strength Assessment", "ECG", "Pulmonary Function Test", "Joint Assessment", "Sports Medicine Consultation"],
        "price": 6999,
        "discounted_price": 5499,
        "duration": "Half day",
        "category": "Orthopedic",
        "ideal_for": "Athletes, fitness enthusiasts, sports professionals",
        "includes_consultation": True
    },
    
    # Gynecology Packages
    {
        "id": str(uuid.uuid4()),
        "name": "Women's Wellness Package",
        "department": "Gynecology & Obstetrics",
        "description": "Comprehensive health checkup designed specifically for women.",
        "tests_included": ["Pap Smear", "Pelvic Ultrasound", "Mammography", "Thyroid Profile", "Complete Blood Count", "Vitamin D & B12", "Bone Density", "Gynecologist Consultation"],
        "price": 7999,
        "discounted_price": 5999,
        "duration": "4-5 hours",
        "category": "Women's Health",
        "ideal_for": "Women above 30 years",
        "includes_consultation": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fertility Assessment Package",
        "department": "Gynecology & Obstetrics",
        "description": "Complete fertility evaluation for women planning pregnancy.",
        "tests_included": ["AMH (Anti-Mullerian Hormone)", "FSH", "LH", "Prolactin", "Thyroid Profile", "Pelvic Ultrasound", "HSG (if needed)", "Fertility Specialist Consultation"],
        "price": 8999,
        "discounted_price": 6999,
        "duration": "Multiple visits",
        "category": "Women's Health",
        "ideal_for": "Women planning pregnancy, those with fertility concerns",
        "includes_consultation": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Prenatal Care Package",
        "department": "Gynecology & Obstetrics",
        "description": "Complete pregnancy care package for expecting mothers.",
        "tests_included": ["All trimester blood tests", "NT Scan", "Anomaly Scan", "Growth Scans", "GTT", "Group B Strep", "All prenatal consultations"],
        "price": 25999,
        "discounted_price": 19999,
        "duration": "9 months",
        "category": "Women's Health",
        "ideal_for": "Expecting mothers",
        "includes_consultation": True
    },
    
    # Urology Packages - Male
    {
        "id": str(uuid.uuid4()),
        "name": "Men's Health Package",
        "department": "Urology",
        "description": "Comprehensive health checkup for men including prostate screening.",
        "tests_included": ["PSA (Prostate Specific Antigen)", "Testosterone", "Kidney Function Test", "Liver Function Test", "Lipid Profile", "Blood Sugar", "Urine Analysis", "Ultrasound Abdomen", "Urologist Consultation"],
        "price": 5999,
        "discounted_price": 4499,
        "duration": "4 hours",
        "category": "Men's Health",
        "ideal_for": "Men above 40 years",
        "includes_consultation": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Male Fertility Package",
        "department": "Urology",
        "description": "Complete fertility evaluation for men.",
        "tests_included": ["Semen Analysis", "Hormone Profile (FSH, LH, Testosterone)", "Scrotal Ultrasound", "Genetic Testing (if needed)", "Andrologist Consultation"],
        "price": 4999,
        "discounted_price": 3999,
        "duration": "Multiple visits",
        "category": "Men's Health",
        "ideal_for": "Men with fertility concerns",
        "includes_consultation": True
    },
    
    # Urology Packages - Female
    {
        "id": str(uuid.uuid4()),
        "name": "Female Urology Package",
        "department": "Urology",
        "description": "Specialized package for women's urological health.",
        "tests_included": ["Urine Analysis", "Urine Culture", "Kidney Function Test", "Ultrasound KUB", "Urodynamic Study (if needed)", "Female Urologist Consultation"],
        "price": 4499,
        "discounted_price": 3499,
        "duration": "3-4 hours",
        "category": "Women's Health",
        "ideal_for": "Women with urinary issues, incontinence, recurrent UTIs",
        "includes_consultation": True
    }
]

# ==================== SAMPLE DATA ====================
SAMPLE_INVENTORY = [
    {"id": str(uuid.uuid4()), "item_name": "Paracetamol 500mg", "category": "Medicines", "quantity": 500, "unit": "tablets", "min_threshold": 100, "max_threshold": 1000, "unit_price": 2.5, "supplier": "Sun Pharma", "department": "Pharmacy", "expiry_date": "2026-06-30"},
    {"id": str(uuid.uuid4()), "item_name": "Surgical Gloves (Medium)", "category": "Supplies", "quantity": 200, "unit": "pairs", "min_threshold": 50, "max_threshold": 500, "unit_price": 15, "supplier": "Medline", "department": "Surgery", "expiry_date": "2025-12-31"},
    {"id": str(uuid.uuid4()), "item_name": "IV Saline 500ml", "category": "Fluids", "quantity": 150, "unit": "bottles", "min_threshold": 50, "max_threshold": 300, "unit_price": 45, "supplier": "B Braun", "department": "Emergency", "expiry_date": "2025-08-15"},
    {"id": str(uuid.uuid4()), "item_name": "Syringes 5ml", "category": "Supplies", "quantity": 1000, "unit": "pieces", "min_threshold": 200, "max_threshold": 2000, "unit_price": 5, "supplier": "BD Medical", "department": "General", "expiry_date": "2026-03-20"},
]

SAMPLE_BEDS = [
    {"id": str(uuid.uuid4()), "bed_number": "ICU-101", "ward": "ICU", "room_number": "101", "bed_type": "ICU", "price_per_day": 8000, "features": ["Ventilator", "Cardiac Monitor", "Central Line"], "status": "available"},
    {"id": str(uuid.uuid4()), "bed_number": "ICU-102", "ward": "ICU", "room_number": "102", "bed_type": "ICU", "price_per_day": 8000, "features": ["Ventilator", "Cardiac Monitor"], "status": "occupied", "current_patient": {"id": "demo", "name": "Patient X"}},
    {"id": str(uuid.uuid4()), "bed_number": "GW-201", "ward": "General Ward", "room_number": "201", "bed_type": "General", "price_per_day": 2000, "features": ["AC", "TV"], "status": "available"},
    {"id": str(uuid.uuid4()), "bed_number": "GW-202", "ward": "General Ward", "room_number": "201", "bed_type": "General", "price_per_day": 2000, "features": ["AC", "TV"], "status": "available"},
    {"id": str(uuid.uuid4()), "bed_number": "PVT-301", "ward": "Private Room", "room_number": "301", "bed_type": "Private", "price_per_day": 5000, "features": ["AC", "TV", "Attached Bathroom", "Sofa"], "status": "available"},
    {"id": str(uuid.uuid4()), "bed_number": "ER-001", "ward": "Emergency", "room_number": "ER", "bed_type": "Emergency", "price_per_day": 3000, "features": ["Monitor", "Emergency Equipment"], "status": "available"},
    {"id": str(uuid.uuid4()), "bed_number": "MAT-401", "ward": "Maternity", "room_number": "401", "bed_type": "Maternity", "price_per_day": 4000, "features": ["AC", "Baby Cot", "Attached Bathroom"], "status": "available"},
    {"id": str(uuid.uuid4()), "bed_number": "PED-501", "ward": "Pediatric", "room_number": "501", "bed_type": "Pediatric", "price_per_day": 3500, "features": ["AC", "Child-friendly"], "status": "available"},
]

SAMPLE_LAB_TESTS = [
    {"id": str(uuid.uuid4()), "test_name": "Complete Blood Count (CBC)", "category": "Hematology", "price": 350, "description": "Measures various components of blood including RBC, WBC, platelets", "preparation": "No special preparation required", "duration": "Same day"},
    {"id": str(uuid.uuid4()), "test_name": "Lipid Profile", "category": "Biochemistry", "price": 600, "description": "Measures cholesterol levels including HDL, LDL, triglycerides", "preparation": "12 hours fasting required", "duration": "Same day"},
    {"id": str(uuid.uuid4()), "test_name": "Thyroid Profile (T3, T4, TSH)", "category": "Endocrinology", "price": 800, "description": "Measures thyroid hormone levels", "preparation": "No special preparation", "duration": "Same day"},
    {"id": str(uuid.uuid4()), "test_name": "HbA1c", "category": "Diabetes", "price": 550, "description": "Measures average blood sugar over 3 months", "preparation": "No fasting required", "duration": "Same day"},
    {"id": str(uuid.uuid4()), "test_name": "Kidney Function Test (KFT)", "category": "Biochemistry", "price": 700, "description": "Measures kidney health including creatinine, urea, BUN", "preparation": "No special preparation", "duration": "Same day"},
    {"id": str(uuid.uuid4()), "test_name": "Liver Function Test (LFT)", "category": "Biochemistry", "price": 750, "description": "Measures liver enzymes and function", "preparation": "No special preparation", "duration": "Same day"},
]

SAMPLE_AMBULANCES = [
    {"id": str(uuid.uuid4()), "vehicle_number": "WB-01-A-1234", "type": "Advanced Life Support", "driver_name": "Raju Kumar", "driver_phone": "+91-9876543210", "status": "available", "features": ["Ventilator", "Defibrillator", "Cardiac Monitor"]},
    {"id": str(uuid.uuid4()), "vehicle_number": "WB-01-A-5678", "type": "Basic Life Support", "driver_name": "Sunil Das", "driver_phone": "+91-9876543211", "status": "available", "features": ["Oxygen", "First Aid", "Stretcher"]},
    {"id": str(uuid.uuid4()), "vehicle_number": "WB-01-A-9012", "type": "Patient Transport", "driver_name": "Mohan Singh", "driver_phone": "+91-9876543212", "status": "available", "features": ["AC", "Stretcher", "Wheelchair Accessible"]},
]

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.nirmaya_health
    
    print("🌱 Starting database seeding...")
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    # await db.departments.delete_many({})
    # await db.doctors.delete_many({})
    # await db.health_packages.delete_many({})
    # await db.inventory.delete_many({})
    # await db.beds.delete_many({})
    # await db.lab_tests.delete_many({})
    # await db.ambulances.delete_many({})
    
    # Seed Departments
    print("📋 Seeding departments...")
    for dept in DEPARTMENTS:
        existing = await db.departments.find_one({"slug": dept["slug"]})
        if not existing:
            dept["created_at"] = datetime.utcnow().isoformat()
            await db.departments.insert_one(dept)
    print(f"   ✅ {len(DEPARTMENTS)} departments")
    
    # Seed Doctors
    print("👨‍⚕️ Seeding doctors...")
    doctors = generate_doctors()
    for doc in doctors:
        existing = await db.doctors.find_one({"email": doc["email"]})
        if not existing:
            await db.doctors.insert_one(doc)
    print(f"   ✅ {len(doctors)} doctors")
    
    # Seed Health Packages
    print("📦 Seeding health packages...")
    for pkg in HEALTH_PACKAGES:
        existing = await db.health_packages.find_one({"name": pkg["name"]})
        if not existing:
            pkg["created_at"] = datetime.utcnow().isoformat()
            await db.health_packages.insert_one(pkg)
    print(f"   ✅ {len(HEALTH_PACKAGES)} health packages")
    
    # Seed Inventory
    print("🏥 Seeding inventory...")
    for item in SAMPLE_INVENTORY:
        existing = await db.inventory.find_one({"item_name": item["item_name"]})
        if not existing:
            item["created_at"] = datetime.utcnow().isoformat()
            item["last_restocked"] = datetime.utcnow().isoformat()
            item["usage_history"] = []
            await db.inventory.insert_one(item)
    print(f"   ✅ {len(SAMPLE_INVENTORY)} inventory items")
    
    # Seed Beds
    print("🛏️ Seeding beds...")
    for bed in SAMPLE_BEDS:
        existing = await db.beds.find_one({"bed_number": bed["bed_number"]})
        if not existing:
            bed["created_at"] = datetime.utcnow().isoformat()
            await db.beds.insert_one(bed)
    print(f"   ✅ {len(SAMPLE_BEDS)} beds")
    
    # Seed Lab Tests
    print("🧪 Seeding lab tests...")
    for test in SAMPLE_LAB_TESTS:
        existing = await db.lab_tests.find_one({"test_name": test["test_name"]})
        if not existing:
            test["created_at"] = datetime.utcnow().isoformat()
            await db.lab_tests.insert_one(test)
    print(f"   ✅ {len(SAMPLE_LAB_TESTS)} lab tests")
    
    # Seed Ambulances
    print("🚑 Seeding ambulances...")
    for amb in SAMPLE_AMBULANCES:
        existing = await db.ambulances.find_one({"vehicle_number": amb["vehicle_number"]})
        if not existing:
            amb["created_at"] = datetime.utcnow().isoformat()
            await db.ambulances.insert_one(amb)
    print(f"   ✅ {len(SAMPLE_AMBULANCES)} ambulances")
    
    # Ensure admin user exists
    print("👤 Ensuring admin user...")
    admin = await db.users.find_one({"email": "admin@nirmaya.com"})
    if not admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": "admin@nirmaya.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.utcnow().isoformat()
        })
        print("   ✅ Admin user created")
    else:
        print("   ✅ Admin user exists")
    
    print("\n🎉 Database seeding completed!")
    
    # Print summary
    dept_count = await db.departments.count_documents({})
    doc_count = await db.doctors.count_documents({})
    pkg_count = await db.health_packages.count_documents({})
    inv_count = await db.inventory.count_documents({})
    bed_count = await db.beds.count_documents({})
    test_count = await db.lab_tests.count_documents({})
    amb_count = await db.ambulances.count_documents({})
    
    print(f"""
📊 Database Summary:
   - Departments: {dept_count}
   - Doctors: {doc_count}
   - Health Packages: {pkg_count}
   - Inventory Items: {inv_count}
   - Beds: {bed_count}
   - Lab Tests: {test_count}
   - Ambulances: {amb_count}
""")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
