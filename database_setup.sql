-- Healthcare Management System Database Setup
-- Database: healthcare_pro

-- Create database
CREATE DATABASE IF NOT EXISTS healthcare_pro;
USE healthcare_pro;

-- Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE Doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    office_hours VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE Appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    specialization VARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason_for_visit VARCHAR(255),
    additional_notes TEXT,
    status ENUM('Booked', 'Completed', 'Cancelled') DEFAULT 'Booked',
    FOREIGN KEY (patient_id) REFERENCES Users(user_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

-- Medical Records table
CREATE TABLE MedicalRecords (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    prescription TEXT,
    visit_date DATE NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Users(user_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

-- Messages table
CREATE TABLE Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(100),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Office Hours table
CREATE TABLE OfficeHours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    open_time TIME,
    close_time TIME,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
);

-- Insert sample data

-- Insert admin user (password: admin123)
INSERT INTO Users (full_name, email, phone_number, password_hash, role) VALUES
('System Administrator', 'admin@healthcarepro.com', '555-0001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample doctors
INSERT INTO Users (full_name, email, phone_number, password_hash, role) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@healthcarepro.com', '555-0101', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Dr. Michael Chen', 'michael.chen@healthcarepro.com', '555-0102', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Dr. Emily Davis', 'emily.davis@healthcarepro.com', '555-0103', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor');

-- Insert doctor profiles
INSERT INTO Doctors (user_id, specialization, office_hours) VALUES
(2, 'Cardiology', 'Monday-Friday 9:00 AM - 5:00 PM'),
(3, 'Pediatrics', 'Monday-Friday 8:00 AM - 4:00 PM'),
(4, 'Dermatology', 'Tuesday-Saturday 10:00 AM - 6:00 PM');

-- Insert sample patients
INSERT INTO Users (full_name, email, phone_number, password_hash, role) VALUES
('John Smith', 'john.smith@email.com', '555-0201', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient'),
('Jane Doe', 'jane.doe@email.com', '555-0202', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient'),
('Bob Wilson', 'bob.wilson@email.com', '555-0203', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient');

-- Insert sample appointments
INSERT INTO Appointments (patient_id, doctor_id, specialization, appointment_date, appointment_time, reason_for_visit, status) VALUES
(5, 1, 'Cardiology', '2024-01-15', '10:00:00', 'Heart checkup', 'Booked'),
(6, 2, 'Pediatrics', '2024-01-16', '14:00:00', 'Child vaccination', 'Booked'),
(7, 3, 'Dermatology', '2024-01-17', '11:00:00', 'Skin examination', 'Completed');

-- Insert sample medical records
INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, prescription, visit_date) VALUES
(5, 1, 'Normal heart function', 'Continue regular exercise and healthy diet', '2024-01-10'),
(6, 2, 'Healthy child development', 'Schedule next vaccination in 6 months', '2024-01-05'),
(7, 3, 'Minor skin irritation', 'Apply topical cream twice daily', '2024-01-12');

-- Insert sample messages
INSERT INTO Messages (full_name, email, phone, subject, message) VALUES
('Alice Brown', 'alice.brown@email.com', '555-0301', 'Appointment Inquiry', 'I would like to schedule an appointment with a cardiologist.'),
('Charlie Green', 'charlie.green@email.com', '555-0302', 'Insurance Question', 'Do you accept Blue Cross insurance?'),
('Diana White', 'diana.white@email.com', '555-0303', 'Emergency Contact', 'I need urgent medical attention for my child.');

-- Insert office hours for sample doctors
INSERT INTO OfficeHours (doctor_id, day_of_week, open_time, close_time) VALUES
(1, 'Monday', '09:00:00', '17:00:00'),
(1, 'Tuesday', '09:00:00', '17:00:00'),
(1, 'Wednesday', '09:00:00', '17:00:00'),
(1, 'Thursday', '09:00:00', '17:00:00'),
(1, 'Friday', '09:00:00', '17:00:00'),
(2, 'Monday', '08:00:00', '16:00:00'),
(2, 'Tuesday', '08:00:00', '16:00:00'),
(2, 'Wednesday', '08:00:00', '16:00:00'),
(2, 'Thursday', '08:00:00', '16:00:00'),
(2, 'Friday', '08:00:00', '16:00:00'),
(3, 'Tuesday', '10:00:00', '18:00:00'),
(3, 'Wednesday', '10:00:00', '18:00:00'),
(3, 'Thursday', '10:00:00', '18:00:00'),
(3, 'Friday', '10:00:00', '18:00:00'),
(3, 'Saturday', '10:00:00', '14:00:00');

-- Create indexes for better performance
CREATE INDEX idx_appointments_date ON Appointments(appointment_date);
CREATE INDEX idx_appointments_doctor ON Appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON Appointments(patient_id);
CREATE INDEX idx_medical_records_patient ON MedicalRecords(patient_id);
CREATE INDEX idx_medical_records_doctor ON MedicalRecords(doctor_id);
CREATE INDEX idx_messages_created ON Messages(created_at);

-- Create views for common queries

-- View for appointment details with patient and doctor names
CREATE VIEW appointment_details AS
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.reason_for_visit,
    a.status,
    p.full_name as patient_name,
    p.email as patient_email,
    p.phone_number as patient_phone,
    d.full_name as doctor_name,
    doc.specialization
FROM Appointments a
JOIN Users p ON a.patient_id = p.user_id
JOIN Doctors doc ON a.doctor_id = doc.doctor_id
JOIN Users d ON doc.user_id = d.user_id;

-- View for doctor statistics
CREATE VIEW doctor_stats AS
SELECT 
    d.doctor_id,
    u.full_name as doctor_name,
    d.specialization,
    COUNT(a.appointment_id) as total_appointments,
    COUNT(CASE WHEN a.status = 'Completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN a.status = 'Booked' THEN 1 END) as pending_appointments
FROM Doctors d
JOIN Users u ON d.user_id = u.user_id
LEFT JOIN Appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id, u.full_name, d.specialization;
