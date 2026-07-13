<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    $faker = \Faker\Factory::create();

    // Disable foreign key checks for truncation
    DB::statement('PRAGMA foreign_keys = OFF;');
    Review::truncate();
    Appointment::truncate();
    Doctor::truncate();
    User::truncate();
    Admin::truncate();
    DB::statement('PRAGMA foreign_keys = ON;');

    // 1. Seed Admin Account
    Admin::create([
      'email' => 'admin@example.com',
      'password' => bcrypt('admin_password'),
    ]);

    // 2. Specialty & City Pools (10 of each)
    $specialties = [
      'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics',
      'Ophthalmology', 'Psychiatry', 'Gynecology', 'General Medicine', 'Dentistry'
    ];

    $cities = [
      'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier',
      'Agadir', 'Oujda', 'Kenitra', 'Tetouan', 'Meknes'
    ];

    // Male Doctor Portrait Pools
    $maleAvatars = [
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582750433449-64c86b148388?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80'
    ];

    // Female Doctor Portrait Pools
    $femaleAvatars = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1623854767648-e7bb8c5f24db?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=compress&cs=tinysrgb&w=300&fit=crop&q=80'
    ];

    // 3. Seed 50 Doctors (25 Male, 25 Female)
    $doctors = [];
    
    // Male Doctors
    for ($i = 0; $i < 25; $i++) {
      $specialty = $specialties[$i % 10];
      $city = $cities[$i % 10];
      $avatar = $maleAvatars[$i % count($maleAvatars)];

      $doc = Doctor::create([
        'firstname' => $faker->firstNameMale,
        'lastname' => $faker->lastName,
        'cin' => $faker->numerify('############'),
        'phoneNumber' => $faker->numerify('06########'),
        'email' => "doctor.male{$i}@example.com",
        'password' => bcrypt('password'),
        'avatar_doctor' => $avatar,
        'Matricule' => $faker->unique()->randomNumber(5),
        'specialite' => $specialty,
        'nom_cabinet' => "Morocco Clinical Cabinet " . ($i + 1),
        'address_cabinet' => $city,
        'premium' => ($i % 3 === 0),
        'day_debut_work' => 'lundi',
        'day_fin_work' => 'vendredi',
        'time_debut_work' => '09:00',
        'time_fin_work' => '18:00',
        'available' => 1,
        'appointment_time' => '30'
      ]);
      $doctors[] = $doc;
    }

    // Female Doctors
    for ($i = 0; $i < 25; $i++) {
      $specialty = $specialties[($i + 5) % 10];
      $city = $cities[($i + 3) % 10];
      $avatar = $femaleAvatars[$i % count($femaleAvatars)];

      $doc = Doctor::create([
        'firstname' => $faker->firstNameFemale,
        'lastname' => $faker->lastName,
        'cin' => $faker->numerify('############'),
        'phoneNumber' => $faker->numerify('06########'),
        'email' => "doctor.female{$i}@example.com",
        'password' => bcrypt('password'),
        'avatar_doctor' => $avatar,
        'Matricule' => $faker->unique()->randomNumber(5),
        'specialite' => $specialty,
        'nom_cabinet' => "Morocco Clinical Cabinet " . ($i + 26),
        'address_cabinet' => $city,
        'premium' => ($i % 3 === 0),
        'day_debut_work' => 'lundi',
        'day_fin_work' => 'vendredi',
        'time_debut_work' => '09:00',
        'time_fin_work' => '18:00',
        'available' => 1,
        'appointment_time' => '30'
      ]);
      $doctors[] = $doc;
    }

    // 4. Seed 200 Users (Patients)
    $patients = [];
    for ($i = 0; $i < 200; $i++) {
      $pat = User::create([
        'firstname' => $faker->firstName,
        'lastname' => $faker->lastName,
        'cin' => $faker->numerify('############'),
        'phoneNumber' => $faker->numerify('06########'),
        'email' => "patient{$i}@example.com",
        'password' => bcrypt('password'),
      ]);
      $patients[] = $pat;
    }

    // 5. Seed 500 Appointments
    $appointmentTypes = ['consultation', 'suivi', 'diagnostic', 'urgent', 'nouveau patient'];
    $appointmentTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    for ($i = 0; $i < 500; $i++) {
      $patient = $patients[rand(0, 199)];
      $doctor = $doctors[rand(0, 49)];
      
      // Distribute dates from -30 days to +30 days
      $date = Carbon::now()->addDays(rand(-30, 30))->toDateString();
      $time = $appointmentTimes[rand(0, count($appointmentTimes) - 1)];

      Appointment::create([
        'user_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'date_appointment' => $date,
        'time_appointment' => $time,
        'cancel_appointment' => (rand(1, 10) === 1) ? "1" : "0", // 10% cancellations
        'type_appointment' => $appointmentTypes[rand(0, count($appointmentTypes) - 1)]
      ]);
    }

    // 6. Seed 200 Reviews
    $positiveReviews = [
      'Very professional doctor, highly recommended.',
      'Excellent bedside manner and detailed explanations.',
      'Friendly staff, clean office, and punctual scheduling.',
      'Extremely thorough and helpful with all questions.',
      'Highly professional checkup. Felt very comfortable.',
      'Great diagnostic skills. The treatment worked wonders.'
    ];

    $neutralReviews = [
      'The checkup was fine, but had to wait 20 minutes.',
      'Decent treatment but the cabinet is a bit small.',
      'Good medical advice, though the receptionist was busy.'
    ];

    for ($i = 0; $i < 200; $i++) {
      $patient = $patients[rand(0, 199)];
      $doctor = $doctors[rand(0, 49)];
      
      $isPositive = (rand(1, 5) > 1); // 80% positive
      $rating = $isPositive ? rand(4, 5) : rand(2, 3);
      $comment = $isPositive 
        ? $positiveReviews[rand(0, count($positiveReviews) - 1)] 
        : $neutralReviews[rand(0, count($neutralReviews) - 1)];

      $reply = (rand(1, 4) === 1) 
        ? "Thank you for your feedback! Best regards." 
        : null;

      Review::create([
        'user_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'rating' => $rating,
        'comment' => $comment,
        'reply' => $reply,
        'status' => (rand(1, 10) > 1) ? 'approved' : 'pending' // 90% approved
      ]);
    }
  }
}
