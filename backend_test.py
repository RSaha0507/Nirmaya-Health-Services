#!/usr/bin/env python3
"""
Nirmaya Health Services regression suite.

Covers deployment regressions around:
- Departments listing and detail hydration
- Doctors catalog completeness (not capped to only a few records)
- Operations roles (admin/hospital admin/staff/nurse) access to beds, patients, analytics
- Lab test details enrichment (includes + price breakup)
- Profile update behavior for patient and doctor
- Bed admit/discharge operational flow
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import requests


BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001").rstrip("/")
API_BASE = f"{BACKEND_URL}/api"
TIMEOUT_SECONDS = float(os.getenv("TEST_TIMEOUT", "20"))

DEMO_CREDENTIALS: Dict[str, Dict[str, str]] = {
    "admin": {"email": "admin@nirmaya.com", "password": "admin123"},
    "doctor": {"email": "ananya@nirmaya.com", "password": "doctor123"},
    "hospital_admin": {"email": "hospital.admin@nirmaya.com", "password": "hospital123"},
    "staff": {"email": "staff@nirmaya.com", "password": "staff123"},
    "nurse": {"email": "nurse@nirmaya.com", "password": "nurse123"},
}

EXPECTED_ROLES = {
    "admin": "admin",
    "doctor": "doctor",
    "hospital_admin": "hospital_administrator",
    "staff": "staff",
    "nurse": "nurse",
}


class RegressionTester:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.results: List[Dict[str, Any]] = []
        self.tokens: Dict[str, str] = {}
        self.users: Dict[str, Dict[str, Any]] = {}
        self.temp_patient_id: Optional[str] = None

    def log(self, test_name: str, status: str, detail: str = "") -> None:
        record = {
            "test": test_name,
            "status": status,
            "detail": detail,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.results.append(record)
        print(f"[{status}] {test_name}")
        if detail:
            print(f"  {detail}")

    def request(
        self,
        method: str,
        path: str,
        *,
        token: Optional[str] = None,
        expected_status: Optional[int] = None,
        **kwargs: Any,
    ) -> requests.Response:
        headers = kwargs.pop("headers", {}) or {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        if "timeout" not in kwargs:
            kwargs["timeout"] = TIMEOUT_SECONDS

        response = self.session.request(method, f"{API_BASE}{path}", headers=headers, **kwargs)
        if expected_status is not None and response.status_code != expected_status:
            body = response.text[:600].replace("\n", " ")
            raise AssertionError(
                f"{method} {path} expected HTTP {expected_status}, got {response.status_code}. Body: {body}"
            )
        return response

    @staticmethod
    def as_json(response: requests.Response) -> Any:
        try:
            return response.json()
        except Exception:
            return None

    def test_health(self) -> bool:
        name = "Health Check"
        try:
            response = self.request("GET", "/health", expected_status=200)
            payload = self.as_json(response)
            assert isinstance(payload, dict), "Health response must be JSON object"
            assert payload.get("status") == "healthy", "Health status is not healthy"
            self.log(name, "PASS", f"version={payload.get('version')}")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def test_seed(self) -> bool:
        name = "Seed Endpoint"
        try:
            response = self.request("POST", "/seed", json={}, expected_status=200)
            payload = self.as_json(response)
            assert isinstance(payload, dict), "Seed response must be JSON object"
            assert "sync" in payload, "Seed response missing sync summary"
            self.log(name, "PASS", f"sync={payload.get('sync')}")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def test_login_matrix(self) -> bool:
        name = "Credential Matrix"
        failures: List[str] = []

        for key, creds in DEMO_CREDENTIALS.items():
            try:
                response = self.request("POST", "/auth/login", json=creds, expected_status=200)
                payload = self.as_json(response)
                assert isinstance(payload, dict), f"{key}: login response must be JSON"
                token = payload.get("token")
                user = payload.get("user")
                assert token, f"{key}: token missing"
                assert isinstance(user, dict), f"{key}: user object missing"
                expected_role = EXPECTED_ROLES[key]
                actual_role = str(user.get("role", "")).lower()
                assert actual_role == expected_role, f"{key}: expected role {expected_role}, got {actual_role}"

                self.tokens[key] = token
                self.users[key] = user
            except Exception as exc:
                failures.append(f"{key}: {exc}")

        if failures:
            self.log(name, "FAIL", " | ".join(failures))
            return False

        self.log(name, "PASS", "All admin/doctor/hospital_admin/staff/nurse credentials are valid")
        return True

    def test_departments_and_doctors_catalog(self) -> bool:
        name = "Departments + Doctors Catalog"
        try:
            dep_response = self.request("GET", "/departments", expected_status=200)
            departments = self.as_json(dep_response)
            assert isinstance(departments, list), "Departments response must be a list"
            assert len(departments) >= 10, f"Expected at least 10 departments, got {len(departments)}"

            for dept in departments:
                assert dept.get("name"), "Department name missing"
                assert dept.get("slug"), f"Department slug missing for {dept.get('name')}"

            detail_checked = False
            for dept in departments[:8]:
                slug = dept.get("slug")
                if not slug:
                    continue
                detail_response = self.request("GET", f"/departments/{slug}", expected_status=200)
                detail = self.as_json(detail_response)
                assert isinstance(detail, dict), "Department detail must be object"
                assert "doctors" in detail, "Department detail missing doctors"
                assert "health_packages" in detail, "Department detail missing health packages"
                detail_checked = True
                break

            assert detail_checked, "Could not validate any department detail"

            doctors_response = self.request("GET", "/doctors", expected_status=200)
            doctors = self.as_json(doctors_response)
            assert isinstance(doctors, list), "Doctors response must be list"
            assert len(doctors) > 5, "Doctors catalog still looks capped to 5"
            assert len(doctors) >= 10, f"Expected at least 10 doctors, got {len(doctors)}"

            names = [str(doc.get("name", "")) for doc in doctors]
            assert names == sorted(names, key=lambda n: n.lower()), "Doctors list is not sorted by name"

            self.log(name, "PASS", f"departments={len(departments)}, doctors={len(doctors)}")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def test_operations_access_matrix(self) -> bool:
        name = "Operations Access Matrix"
        roles = ["admin", "hospital_admin", "staff", "nurse"]
        required_analytics_keys = {
            "assigned_patients",
            "active_patients",
            "today_appointments",
            "total_doctors",
            "total_departments",
            "available_beds",
            "occupied_beds",
            "total_beds",
            "pending_lab_results",
        }

        failures: List[str] = []

        for role_key in roles:
            token = self.tokens.get(role_key)
            if not token:
                failures.append(f"{role_key}: missing token")
                continue

            try:
                beds_response = self.request("GET", "/beds", token=token, expected_status=200)
                beds = self.as_json(beds_response)
                assert isinstance(beds, list), f"{role_key}: /beds is not list"

                patients_response = self.request("GET", "/patients", token=token, expected_status=200)
                patients = self.as_json(patients_response)
                assert isinstance(patients, list), f"{role_key}: /patients is not list"

                analytics_response = self.request("GET", "/analytics/operations", token=token, expected_status=200)
                analytics = self.as_json(analytics_response)
                assert isinstance(analytics, dict), f"{role_key}: /analytics/operations is not object"
                missing = [k for k in required_analytics_keys if k not in analytics]
                assert not missing, f"{role_key}: missing analytics keys {missing}"
                assert analytics["assigned_patients"] >= analytics["active_patients"] or analytics["assigned_patients"] == analytics["active_patients"], (
                    f"{role_key}: assigned_patients < active_patients"
                )
            except Exception as exc:
                failures.append(f"{role_key}: {exc}")

        if failures:
            self.log(name, "FAIL", " | ".join(failures))
            return False

        self.log(name, "PASS", "All operations roles can access beds/patients/operations analytics")
        return True

    def test_lab_tests_enrichment(self) -> bool:
        name = "Lab Tests Enrichment"
        try:
            response = self.request("GET", "/lab-tests", expected_status=200)
            tests = self.as_json(response)
            assert isinstance(tests, list), "Lab tests response must be list"
            assert len(tests) > 0, "No lab tests returned"

            for test in tests[:5]:
                includes = test.get("includes")
                breakup = test.get("price_breakup")
                assert isinstance(includes, list) and len(includes) > 0, "Lab test missing includes"
                assert isinstance(breakup, dict), "Lab test missing price_breakup"
                for key in ["base_test_charge", "sample_collection_charge", "reporting_charge", "total"]:
                    assert key in breakup, f"price_breakup missing {key}"

            self.log(name, "PASS", f"validated {min(5, len(tests))} tests for includes + price breakup")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def test_patient_profile_and_lab_booking(self) -> bool:
        name = "Patient Profile + Lab Booking"
        try:
            unique = uuid.uuid4().hex[:10]
            register_payload = {
                "name": "Regression Patient",
                "email": f"regression.patient.{unique}@example.org",
                "password": "test1234",
                "phone": "+919000000000",
            }

            register_response = self.request("POST", "/auth/register", json=register_payload, expected_status=200)
            register_data = self.as_json(register_response)
            assert isinstance(register_data, dict), "Register response must be object"
            patient_token = register_data.get("token")
            patient_user = register_data.get("user") or {}
            assert patient_token, "Patient token missing after registration"

            self.tokens["patient"] = patient_token
            self.temp_patient_id = patient_user.get("id")

            update_payload = {
                "name": "Regression Patient",
                "phone": "+919000000001",
                "address": "221B Regression Street",
                "date_of_birth": "1995-05-05",
                "blood_group": "B+",
                "emergency_contact": "+919000000002",
                "allergies": ["Dust"],
                "chronic_conditions": ["Asthma"],
            }
            profile_response = self.request("PUT", "/auth/profile", token=patient_token, json=update_payload, expected_status=200)
            updated_profile = self.as_json(profile_response)
            assert isinstance(updated_profile, dict), "Profile update response must be object"

            me_response = self.request("GET", "/auth/me", token=patient_token, expected_status=200)
            me = self.as_json(me_response)
            assert isinstance(me, dict), "/auth/me must be object"
            assert me.get("address") == "221B Regression Street", "Updated address not reflected"
            assert me.get("phone") == "+919000000001", "Updated phone not reflected"

            tests_response = self.request("GET", "/lab-tests", expected_status=200)
            tests = self.as_json(tests_response)
            assert isinstance(tests, list) and tests, "Cannot book lab test: no tests found"
            test_id = tests[0].get("id")
            assert test_id, "Lab test id missing"

            tomorrow = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
            booking_payload = {
                "test_id": test_id,
                "preferred_date": tomorrow,
                "preferred_time": "10:00 AM",
                "notes": "Regression booking",
            }
            booking_response = self.request("POST", "/lab-tests/book", token=patient_token, json=booking_payload, expected_status=200)
            booking = self.as_json(booking_response)
            assert isinstance(booking, dict), "Lab booking response must be object"
            assert booking.get("booking_id"), "Lab booking id missing"

            self.log(name, "PASS", f"patient_id={self.temp_patient_id}, lab_booking_id={booking.get('booking_id')}")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def test_doctor_profile_update_endpoint(self) -> bool:
        name = "Doctor Profile Update"
        try:
            doctor_token = self.tokens.get("doctor")
            assert doctor_token, "Doctor token missing"

            me_response = self.request("GET", "/auth/me", token=doctor_token, expected_status=200)
            me = self.as_json(me_response)
            assert isinstance(me, dict), "Doctor /auth/me response invalid"

            payload = {
                "name": me.get("name", "Dr. Ananya Sharma"),
                "phone": me.get("phone") or "+919111111111",
            }
            update_response = self.request("PUT", "/auth/profile", token=doctor_token, json=payload, expected_status=200)
            updated = self.as_json(update_response)
            assert isinstance(updated, dict), "Doctor profile update response invalid"
            assert str(updated.get("role", "")).lower() == "doctor", "Doctor role changed unexpectedly"
            assert updated.get("name") == payload["name"], "Doctor name mismatch after profile update"

            self.log(name, "PASS", "Doctor profile update endpoint accepts doctor-safe fields")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def test_staff_bed_admit_discharge(self) -> bool:
        name = "Bed Admit/Discharge Flow"
        try:
            staff_token = self.tokens.get("staff")
            assert staff_token, "Staff token missing"

            beds_response = self.request("GET", "/beds", token=staff_token, expected_status=200)
            beds = self.as_json(beds_response)
            assert isinstance(beds, list), "Beds response invalid"
            available_beds = [b for b in beds if str(b.get("status", "")).lower() == "available"]
            assert available_beds, "No available beds to test admit/discharge"

            patient_id = self.temp_patient_id or f"PAT-{uuid.uuid4().hex[:8]}"
            patient_name = "Regression Patient"

            chosen_bed: Optional[Dict[str, Any]] = None
            last_error = ""
            for bed in available_beds[:15]:
                bed_id = bed.get("id")
                if not bed_id:
                    continue
                admit_response = self.request(
                    "POST",
                    f"/beds/{bed_id}/admit",
                    token=staff_token,
                    data={"patient_id": patient_id, "patient_name": patient_name},
                )
                if admit_response.status_code == 200:
                    chosen_bed = bed
                    break
                last_error = f"{admit_response.status_code}: {admit_response.text[:200]}"

            assert chosen_bed is not None, f"Could not admit patient to any available bed. Last error: {last_error}"
            chosen_bed_id = chosen_bed["id"]

            verify_after_admit = self.request("GET", "/beds", token=staff_token, expected_status=200)
            beds_after_admit = self.as_json(verify_after_admit)
            bed_after_admit = next((b for b in beds_after_admit if b.get("id") == chosen_bed_id), None)
            assert bed_after_admit is not None, "Bed not found after admit"
            assert str(bed_after_admit.get("status", "")).lower() == "occupied", "Bed not marked occupied after admit"

            self.request("POST", f"/beds/{chosen_bed_id}/discharge", token=staff_token, data={}, expected_status=200)

            verify_after_discharge = self.request("GET", "/beds", token=staff_token, expected_status=200)
            beds_after_discharge = self.as_json(verify_after_discharge)
            bed_after_discharge = next((b for b in beds_after_discharge if b.get("id") == chosen_bed_id), None)
            assert bed_after_discharge is not None, "Bed not found after discharge"
            assert str(bed_after_discharge.get("status", "")).lower() == "available", "Bed not restored to available"

            self.log(name, "PASS", f"bed_id={chosen_bed_id}")
            return True
        except Exception as exc:
            self.log(name, "FAIL", str(exc))
            return False

    def run(self) -> bool:
        tests = [
            self.test_health,
            self.test_seed,
            self.test_login_matrix,
            self.test_departments_and_doctors_catalog,
            self.test_operations_access_matrix,
            self.test_lab_tests_enrichment,
            self.test_patient_profile_and_lab_booking,
            self.test_doctor_profile_update_endpoint,
            self.test_staff_bed_admit_discharge,
        ]

        print("Nirmaya Health Regression Suite")
        print(f"Backend: {BACKEND_URL}")
        print("=" * 72)

        passed = 0
        for test in tests:
            if test():
                passed += 1

        failed = len(tests) - passed
        print("=" * 72)
        print(f"Summary: {passed} passed, {failed} failed, total {len(tests)}")

        try:
            with open("test_results_backend.json", "w", encoding="utf-8") as f:
                json.dump(self.results, f, indent=2)
        except Exception:
            pass

        return failed == 0


def main() -> int:
    tester = RegressionTester()
    success = tester.run()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
