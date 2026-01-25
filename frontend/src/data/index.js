// src/data/index.js
import { cardiologyData } from './cardiology';
import { dermatologyData } from './dermatology';
import { gastroenterologyData } from './gastroenterology';
import { gynaecologyData } from './gynaecology';
import { immunologyData } from './immunology';
import { nephrologyData } from './nephrology';
import { neurologyData } from './neurology';
import { neurosurgeryData } from './neurosurgery';
import { oncologyData } from './oncology';
import { ophthalmologyData } from './ophthalmology';
import { orthopaedicsData } from './orthopaedics';
import { pathologyData } from './pathology';
import { pediatricsData } from './pediatrics';
import { pulmonologyData } from './pulmonology';
import { urologyData } from './urology';

// This array will be our single source of truth for all department info
export const allDepartments = [
  cardiologyData,
  dermatologyData,
  gastroenterologyData,
  gynaecologyData,
  immunologyData,
  nephrologyData,
  neurologyData,
  neurosurgeryData,
  oncologyData,
  ophthalmologyData,
  orthopaedicsData,
  pathologyData,
  pediatricsData,
  pulmonologyData,
  urologyData,
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically for the dropdown
