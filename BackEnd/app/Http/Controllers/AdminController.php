<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AdminController extends Controller
{
  public function GetAllDocter()
  {
    $doctor = Doctor::all();
    return response()->json($doctor);
  }

  public function GetAllPatient()
  {
    $user = User::all();
    return response()->json($user);
  }

  public function VerifiedDoctor(Request $request)
  {

    $id = $request->post('id');

    $doctor = Doctor::find($id);
    $doctor->verified = true;
    $doctor->save();

    $doctor = Doctor::all();

    return response()->json($doctor);
  }

  public function DoctorNoVerified()
  {
    $doctors = Doctor::where('verified', false)->get();
    return response()->json($doctors);
  }

  public function GetAllAppointments()
  {
    $appointments = Appointment::with(['user', 'doctor'])->orderBy('created_at', 'desc')->get();
    return response()->json($appointments);
  }

  public function SuspendDoctor($id)
  {
    $doctor = Doctor::find($id);
    if (!$doctor) {
      return response()->json(['success' => false, 'message' => 'Doctor not found'], 404);
    }
    $doctor->available = $doctor->available ? 0 : 1;
    $doctor->save();
    return response()->json(['success' => true, 'doctor' => $doctor]);
  }

  public function DeleteDoctor($id)
  {
    $doctor = Doctor::find($id);
    if (!$doctor) {
      return response()->json(['success' => false, 'message' => 'Doctor not found'], 404);
    }
    // Delete associated appointments
    Appointment::where('doctor_id', $id)->delete();
    $doctor->delete();
    return response()->json(['success' => true, 'message' => 'Doctor deleted successfully']);
  }

  public function GetDashboardStats()
  {
    $totalDoctors = Doctor::count();
    $totalPatients = User::count();
    $totalAppointments = Appointment::count();
    $verifiedDoctors = Doctor::where('verified', true)->count();
    $unverifiedDoctors = Doctor::where('verified', false)->count();
    $cancelledAppointments = Appointment::where('cancel_appointment', '1')->count();

    return response()->json([
      'totalDoctors' => $totalDoctors,
      'totalPatients' => $totalPatients,
      'totalAppointments' => $totalAppointments,
      'verifiedDoctors' => $verifiedDoctors,
      'unverifiedDoctors' => $unverifiedDoctors,
      'cancelledAppointments' => $cancelledAppointments,
    ]);
  }
}
