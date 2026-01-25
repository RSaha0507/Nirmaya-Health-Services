#!/usr/bin/env python3
"""
Nirmaya Health Services - Backend API Testing
Testing all critical endpoints and authentication flows
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "https://smart-hospital-9.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_CREDENTIALS = {
    "admin": {"email": "admin@nirmaya.com", "password": "admin123"},
    "doctor": {"email": "ananya@nirmaya.com", "password": "doctor123"},
    "new_patient": {
        "name": "Test User",
        "email": "testuser@test.com", 
        "password": "test1234",
        "phone": "+919876543210"
    }
}

class NirmayaAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        
    def log_test(self, test_name, status, details=""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_symbol = "✅" if status == "PASS" else "❌"
        print(f"{status_symbol} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", "PASS", f"Version: {data.get('version')}")
                    return True
                else:
                    self.log_test("Health Check", "FAIL", "Status not healthy")
                    return False
            else:
                self.log_test("Health Check", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", "FAIL", str(e))
            return False
    
    def test_user_registration(self):
        """Test new patient registration"""
        try:
            # First try to register new user
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=TEST_CREDENTIALS["new_patient"],
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.tokens["patient"] = data["token"]
                    self.log_test("Patient Registration", "PASS", f"User ID: {data['user']['id']}")
                    return True
                else:
                    self.log_test("Patient Registration", "FAIL", "Missing token or user data")
                    return False
            elif response.status_code == 400:
                # User might already exist, try to login instead
                return self.test_patient_login_existing()
            else:
                self.log_test("Patient Registration", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Patient Registration", "FAIL", str(e))
            return False
    
    def test_patient_login_existing(self):
        """Login with existing patient credentials"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={
                    "email": TEST_CREDENTIALS["new_patient"]["email"],
                    "password": TEST_CREDENTIALS["new_patient"]["password"]
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.tokens["patient"] = data["token"]
                    self.log_test("Patient Login (Existing)", "PASS", f"Role: {data['user']['role']}")
                    return True
                else:
                    self.log_test("Patient Login (Existing)", "FAIL", "Missing token")
                    return False
            else:
                self.log_test("Patient Login (Existing)", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Patient Login (Existing)", "FAIL", str(e))
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=TEST_CREDENTIALS["admin"],
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and data["user"]["role"] == "admin":
                    self.tokens["admin"] = data["token"]
                    self.log_test("Admin Login", "PASS", f"User: {data['user']['name']}")
                    return True
                else:
                    self.log_test("Admin Login", "FAIL", "Invalid response or role")
                    return False
            else:
                self.log_test("Admin Login", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Admin Login", "FAIL", str(e))
            return False
    
    def test_doctor_login(self):
        """Test doctor login"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=TEST_CREDENTIALS["doctor"],
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and data["user"]["role"] == "doctor":
                    self.tokens["doctor"] = data["token"]
                    self.log_test("Doctor Login", "PASS", f"Dr. {data['user']['name']}")
                    return True
                else:
                    self.log_test("Doctor Login", "FAIL", "Invalid response or role")
                    return False
            else:
                self.log_test("Doctor Login", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Doctor Login", "FAIL", str(e))
            return False
    
    def test_protected_endpoint(self, endpoint, role, expected_fields=None):
        """Test a protected endpoint with specific role"""
        if role not in self.tokens:
            self.log_test(f"{endpoint} ({role})", "SKIP", f"No {role} token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.tokens[role]}"}
            response = self.session.get(f"{API_BASE}{endpoint}", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    count = len(data)
                    self.log_test(f"{endpoint} ({role})", "PASS", f"{count} items returned")
                elif isinstance(data, dict):
                    if expected_fields:
                        missing_fields = [f for f in expected_fields if f not in data]
                        if missing_fields:
                            self.log_test(f"{endpoint} ({role})", "FAIL", f"Missing fields: {missing_fields}")
                            return False
                    self.log_test(f"{endpoint} ({role})", "PASS", "Valid response structure")
                else:
                    self.log_test(f"{endpoint} ({role})", "PASS", "Response received")
                return True
            else:
                self.log_test(f"{endpoint} ({role})", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test(f"{endpoint} ({role})", "FAIL", str(e))
            return False
    
    def test_departments_api(self):
        """Test departments API endpoints"""
        try:
            # Test GET /api/departments - should return 16 departments
            response = self.session.get(f"{API_BASE}/departments", timeout=10)
            if response.status_code == 200:
                departments = response.json()
                if len(departments) == 16:
                    self.log_test("Departments API - List", "PASS", f"Found {len(departments)} departments")
                else:
                    self.log_test("Departments API - List", "FAIL", f"Expected 16 departments, got {len(departments)}")
                    return False
            else:
                self.log_test("Departments API - List", "FAIL", f"HTTP {response.status_code}")
                return False
            
            # Test GET /api/departments/cardiology - should return cardiology details
            response = self.session.get(f"{API_BASE}/departments/cardiology", timeout=10)
            if response.status_code == 200:
                cardiology = response.json()
                required_fields = ["name", "doctors", "health_packages"]
                missing_fields = [f for f in required_fields if f not in cardiology]
                if not missing_fields:
                    self.log_test("Departments API - Cardiology Detail", "PASS", 
                                f"Doctors: {len(cardiology.get('doctors', []))}, Packages: {len(cardiology.get('health_packages', []))}")
                else:
                    self.log_test("Departments API - Cardiology Detail", "FAIL", f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Departments API - Cardiology Detail", "FAIL", f"HTTP {response.status_code}")
                return False
            
            return True
        except Exception as e:
            self.log_test("Departments API", "FAIL", str(e))
            return False
    
    def test_health_packages_api(self):
        """Test health packages API"""
        try:
            # Test GET /api/health-packages - should return 20 packages
            response = self.session.get(f"{API_BASE}/health-packages", timeout=10)
            if response.status_code == 200:
                packages = response.json()
                if len(packages) == 20:
                    self.log_test("Health Packages API", "PASS", f"Found {len(packages)} packages")
                    return True
                else:
                    self.log_test("Health Packages API", "FAIL", f"Expected 20 packages, got {len(packages)}")
                    return False
            else:
                self.log_test("Health Packages API", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Packages API", "FAIL", str(e))
            return False
    
    def test_beds_api(self):
        """Test beds API endpoints"""
        try:
            # Test GET /api/beds - should return beds
            response = self.session.get(f"{API_BASE}/beds", timeout=10)
            if response.status_code == 200:
                beds = response.json()
                self.log_test("Beds API - List", "PASS", f"Found {len(beds)} beds")
            else:
                self.log_test("Beds API - List", "FAIL", f"HTTP {response.status_code}")
                return False
            
            # Test GET /api/beds/availability - should return ward-wise availability
            response = self.session.get(f"{API_BASE}/beds/availability", timeout=10)
            if response.status_code == 200:
                availability = response.json()
                if isinstance(availability, dict):
                    ward_count = len(availability)
                    self.log_test("Beds API - Availability", "PASS", f"Ward availability for {ward_count} wards")
                else:
                    self.log_test("Beds API - Availability", "FAIL", "Invalid response format")
                    return False
            else:
                self.log_test("Beds API - Availability", "FAIL", f"HTTP {response.status_code}")
                return False
            
            return True
        except Exception as e:
            self.log_test("Beds API", "FAIL", str(e))
            return False
    
    def test_ambulances_api(self):
        """Test ambulances API endpoints"""
        try:
            # Test GET /api/ambulances - should return 3 ambulances
            response = self.session.get(f"{API_BASE}/ambulances", timeout=10)
            if response.status_code == 200:
                ambulances = response.json()
                if len(ambulances) == 3:
                    self.log_test("Ambulances API - List", "PASS", f"Found {len(ambulances)} ambulances")
                else:
                    self.log_test("Ambulances API - List", "FAIL", f"Expected 3 ambulances, got {len(ambulances)}")
                    return False
            else:
                self.log_test("Ambulances API - List", "FAIL", f"HTTP {response.status_code}")
                return False
            
            # Test GET /api/ambulances/available - should return available ambulances
            response = self.session.get(f"{API_BASE}/ambulances/available", timeout=10)
            if response.status_code == 200:
                available_ambulances = response.json()
                self.log_test("Ambulances API - Available", "PASS", f"Found {len(available_ambulances)} available ambulances")
            else:
                self.log_test("Ambulances API - Available", "FAIL", f"HTTP {response.status_code}")
                return False
            
            return True
        except Exception as e:
            self.log_test("Ambulances API", "FAIL", str(e))
            return False
    
    def test_stripe_payment_api(self):
        """Test Stripe payment API with admin/patient login"""
        if "patient" not in self.tokens:
            self.log_test("Stripe Payment API", "SKIP", "No patient token")
            return False
            
        try:
            # First get health packages to get a package_id
            response = self.session.get(f"{API_BASE}/health-packages", timeout=10)
            if response.status_code != 200:
                self.log_test("Stripe Payment API", "FAIL", "Cannot fetch health packages")
                return False
                
            packages = response.json()
            if not packages:
                self.log_test("Stripe Payment API", "FAIL", "No health packages available")
                return False
            
            package_id = packages[0]["id"]
            
            # Test POST /api/payments/create-checkout
            headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
            payment_data = {
                "package_id": package_id,
                "payment_type": "package",
                "origin_url": "https://smart-hospital-9.preview.emergentagent.com"
            }
            
            response = self.session.post(
                f"{API_BASE}/payments/create-checkout",
                json=payment_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["checkout_url", "session_id"]
                missing_fields = [f for f in required_fields if f not in data]
                if not missing_fields:
                    self.log_test("Stripe Payment API", "PASS", f"Session ID: {data.get('session_id', 'N/A')[:20]}...")
                    return True
                else:
                    self.log_test("Stripe Payment API", "FAIL", f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Stripe Payment API", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Stripe Payment API", "FAIL", str(e))
            return False
    
    def test_ambulance_request_flow(self):
        """Test ambulance request flow as patient"""
        if "patient" not in self.tokens:
            self.log_test("Ambulance Request Flow", "SKIP", "No patient token")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
            
            # Test POST /api/ambulances/request with form data
            form_data = {
                "ambulance_type": "Basic Life Support",
                "patient_name": "Test Patient",
                "phone": "+919876543210",
                "pickup_address": "123 Test Street, Mumbai",
                "emergency_type": "Emergency"
            }
            
            response = self.session.post(
                f"{API_BASE}/ambulances/request",
                data=form_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["request_id", "status", "eta_minutes"]
                missing_fields = [f for f in required_fields if f not in data]
                if not missing_fields:
                    if data.get("status") == "dispatched":
                        self.log_test("Ambulance Request Flow", "PASS", 
                                    f"Request ID: {data['request_id']}, ETA: {data['eta_minutes']} mins")
                        return True
                    else:
                        self.log_test("Ambulance Request Flow", "FAIL", f"Expected status 'dispatched', got '{data.get('status')}'")
                        return False
                else:
                    self.log_test("Ambulance Request Flow", "FAIL", f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Ambulance Request Flow", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Ambulance Request Flow", "FAIL", str(e))
            return False
    
    def test_appointment_booking(self):
        """Test appointment booking as patient"""
        if "patient" not in self.tokens:
            self.log_test("Appointment Booking", "SKIP", "No patient token")
            return False
            
        try:
            # First get doctors list to find a doctor ID
            headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
            doctors_response = self.session.get(f"{API_BASE}/doctors", headers=headers, timeout=10)
            
            if doctors_response.status_code != 200:
                self.log_test("Appointment Booking", "FAIL", "Cannot fetch doctors list")
                return False
                
            doctors = doctors_response.json()
            if not doctors:
                self.log_test("Appointment Booking", "FAIL", "No doctors available")
                return False
            
            doctor_id = doctors[0]["id"]
            
            # Book appointment
            tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            appointment_data = {
                "doctor_id": doctor_id,
                "date": tomorrow,
                "time": "10:00",
                "reason": "Regular checkup",
                "appointment_type": "Consultation",
                "is_video": False
            }
            
            response = self.session.post(
                f"{API_BASE}/appointments",
                json=appointment_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "status" in data:
                    self.log_test("Appointment Booking", "PASS", f"Appointment ID: {data['id']}")
                    return True
                else:
                    self.log_test("Appointment Booking", "FAIL", "Invalid response structure")
                    return False
            else:
                self.log_test("Appointment Booking", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Appointment Booking", "FAIL", str(e))
            return False
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🏥 Starting Nirmaya Health Services API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return False
        
        print("\n🔐 Authentication Tests")
        print("-" * 30)
        self.test_user_registration()
        self.test_admin_login()
        self.test_doctor_login()
        
        print("\n📋 API Endpoint Tests (Admin)")
        print("-" * 30)
        admin_endpoints = [
            "/doctors",
            "/equipment", 
            "/appointments",
            "/health-packages",
            "/beds",
            "/lab-tests",
            "/inventory",
            "/shifts"
        ]
        
        for endpoint in admin_endpoints:
            self.test_protected_endpoint(endpoint, "admin")
        
        print("\n📊 Analytics Tests")
        print("-" * 30)
        analytics_endpoints = [
            ("/analytics/admin", "admin", ["total_users", "total_doctors", "total_appointments"]),
            ("/analytics/patient", "patient", ["total_appointments", "completed_appointments"]),
            ("/analytics/doctor", "doctor", ["total_appointments", "completed_appointments"])
        ]
        
        for endpoint, role, expected_fields in analytics_endpoints:
            self.test_protected_endpoint(endpoint, role, expected_fields)
        
        print("\n🏥 Feature Tests")
        print("-" * 30)
        self.test_appointment_booking()
        
        # Summary
        print("\n📈 Test Summary")
        print("=" * 60)
        
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⏭️  Skipped: {skipped}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed == 0

if __name__ == "__main__":
    tester = NirmayaAPITester()
    success = tester.run_all_tests()
    
    # Save results to file
    with open("/app/test_results_backend.json", "w") as f:
        json.dump(tester.test_results, f, indent=2)
    
    sys.exit(0 if success else 1)