<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Idempotent Patient Creation
        $patient = User::firstOrCreate(
            ['email' => 'demo.patient@healthconnect.ma'],
            [
                'firstname' => 'Ahmed',
                'lastname' => 'Benali',
                'password' => Hash::make('DemoPatient123!'),
                'cin' => 'AB123456',
                'phoneNumber' => '0612345678',
            ]
        );

        // 2. Idempotent Doctor Creation
        $doctor = Doctor::firstOrCreate(
            ['email' => 'demo.doctor@healthconnect.ma'],
            [
                'firstname' => 'Youssef',
                'lastname' => 'El Amrani',
                'password' => Hash::make('DemoDoctor123!'),
                'cin' => 'CD987654',
                'phoneNumber' => '0698765432',
                'avatar_doctor' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
                'Matricule' => 99999,
                'specialite' => 'Cardiology',
                'nom_cabinet' => 'Centre Hospitalier Universitaire Ibn Rochd',
                'address_cabinet' => 'Casablanca',
                'premium' => true,
                'day_debut_work' => 'lundi',
                'day_fin_work' => 'vendredi',
                'time_debut_work' => '09:00',
                'time_fin_work' => '18:00',
                'available' => 1,
                'appointment_time' => '30',
                'verified' => 1, // Ensure the doctor bypasses the unverified screen
                'about' => 'Expert in cardiovascular health with over 15 years of experience at CHU Ibn Rochd. Dedicated to providing top-tier patient care and utilizing advanced diagnostic techniques.',
                'years_of_experience' => 15,
                'consultation_fee' => 300,
                'rating' => 5.0,
                'gender' => 'Male',
                'languages' => ['Arabic', 'French', 'English']
            ]
        );

        // 3. Create Sample Appointments between them (Idempotent: only if none exist)
        if (Appointment::where('user_id', $patient->id)->where('doctor_id', $doctor->id)->count() === 0) {
            // Past Appointments
            Appointment::create([
                'user_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'date_appointment' => Carbon::now()->subDays(10)->toDateString(),
                'time_appointment' => '10:00',
                'type_appointment' => 'consultation',
                'cancel_appointment' => '0',
            ]);
            Appointment::create([
                'user_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'date_appointment' => Carbon::now()->subDays(5)->toDateString(),
                'time_appointment' => '14:30',
                'type_appointment' => 'suivi',
                'cancel_appointment' => '0',
            ]);

            // Future Appointments
            Appointment::create([
                'user_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'date_appointment' => Carbon::now()->addDays(2)->toDateString(),
                'time_appointment' => '09:30',
                'type_appointment' => 'suivi',
                'cancel_appointment' => '0',
            ]);
            Appointment::create([
                'user_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'date_appointment' => Carbon::now()->addDays(15)->toDateString(),
                'time_appointment' => '11:00',
                'type_appointment' => 'diagnostic',
                'cancel_appointment' => '0',
            ]);
        }

        // 4. Create Sample Reviews (Idempotent: only if none exist)
        if (Review::where('user_id', $patient->id)->where('doctor_id', $doctor->id)->count() === 0) {
            Review::create([
                'user_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'rating' => 5,
                'comment' => 'Dr. Youssef is incredibly attentive and professional. The facilities at Ibn Rochd are excellent. Highly recommend for cardiology consultations.',
                'reply' => 'Thank you Ahmed for your kind words. Stay healthy!',
                'status' => 'approved'
            ]);
        }
    }
}
