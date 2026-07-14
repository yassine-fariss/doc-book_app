<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class AppointmentManagementController extends Controller
{
  // Method to take a new appointment

  public function TakeAppointment(Request $request)
  {


    $validator = Validator::make($request->all(), [
      'user_id' => 'required|exists:users,id',
      'doctor_id' => 'required|exists:doctors,id',
      'date_appointment' => 'required',
      'time_appointment' => 'required',
      'type_appointment' => 'required'
    ]);


    $this->validateWith($validator, $request);


    $data = $validator->validated();


    $appointment = Appointment::create([
      'user_id' => $data['user_id'],
      'doctor_id' => $data['doctor_id'],
      'date_appointment' => $data['date_appointment'],
      'time_appointment' => $data['time_appointment'],
      'type_appointment' => $data['type_appointment'],
      'status' => 'Pending'
    ]);

    $doctor = Doctor::find($data['doctor_id']);
    $user = User::find($data['user_id']);

    $DataView = [
      'doctor' => $doctor,
      'user' => $user,
      'appointment' => $appointment
    ];


    $pdf = Pdf::loadView('Appointment', $DataView);

    $nameFile = $user->firstname . time() . '.pdf';

    Storage::put('public/storage/pdf/' . $nameFile, $pdf->output());

    return response([
      'appointment' => $appointment,
      "namefile" => $nameFile
    ], 200);
  }



  // Method to get all appointments for a specific doctor

  public function GetAppointmentDoctor($id)
  {

    $appointments = Appointment::with('user')
      ->where('doctor_id', $id)
      ->get();


    return response()->json($appointments);
  }



  // Method to get all appointments for a specific doctor on the current date

  // Method to get all appointments for a specific doctor on the current date
  public function GetAppointmentToday($doctorId)
  {
    $appointments = Appointment::with('user')
      ->where('doctor_id', $doctorId)
      ->whereDate('date_appointment', Carbon::today())
      ->whereNotIn('status', ['Completed', 'Cancelled'])
      ->get();

    return response()->json($appointments);
  }

  // Method to get all appointments for a specific doctor on past dates OR completed/cancelled
  public function GetAppointmentOldDate($doctorId)
  {
    $appointments = Appointment::with('user')
      ->where('doctor_id', $doctorId)
      ->where(function($query) {
          $query->whereDate('date_appointment', '<', Carbon::today())
                ->orWhereIn('status', ['Completed', 'Cancelled']);
      })
      ->get();

    return response()->json($appointments);
  }

  // Method to get all New appointments for a specific doctor on future dates
  public function GetNewAppointment($doctorId)
  {
    $appointments = Appointment::with('user')
      ->where('doctor_id', $doctorId)
      ->whereDate('date_appointment', '>', Carbon::today())
      ->whereNotIn('status', ['Completed', 'Cancelled'])
      ->get();

    return response()->json($appointments);
  }

  // Method to get all appointments for a specific user
  public function GetAppointmentUser($userId)
  {
      $appointments = Appointment::with('doctor')
        ->where('user_id', $userId)
        ->get();

      return response()->json($appointments);
  }

  // Method to cancel an appointment
  public function CancelAppointment($id)
  {
      $appointment = Appointment::find($id);
      if ($appointment) {
          $appointment->cancel_appointment = "1";
          $appointment->status = "Cancelled";
          $appointment->save();
          return response()->json(['success' => true]);
      }
      return response()->json(['success' => false, 'message' => 'Appointment not found.'], 404);
  }

  // Method to update appointment status (for Doctor/Admin)
  public function UpdateAppointmentStatus(Request $request, $id)
  {
      $validator = Validator::make($request->all(), [
          'status' => 'required|string|in:Pending,Confirmed,Completed,Cancelled'
      ]);

      if ($validator->fails()) {
          return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
      }

      $appointment = Appointment::find($id);
      if ($appointment) {
          $appointment->status = $request->status;
          if ($request->status === 'Cancelled') {
              $appointment->cancel_appointment = "1";
          }
          $appointment->save();
          return response()->json(['success' => true]);
      }
      return response()->json(['success' => false, 'message' => 'Appointment not found.'], 404);
  }

  // Method to reschedule an appointment
  public function RescheduleAppointment(Request $request)
  {
      $validator = Validator::make($request->all(), [
          'id' => 'required|exists:appointments,id',
          'date_appointment' => 'required',
          'time_appointment' => 'required'
      ]);
      
      if ($validator->fails()) {
          return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
      }
      
      $appointment = Appointment::find($request->post('id'));
      if ($appointment) {
          // Check if the new slot is already booked for that doctor
          $check = Appointment::where('doctor_id', $appointment->doctor_id)
              ->where('date_appointment', $request->post('date_appointment'))
              ->where('time_appointment', $request->post('time_appointment'))
              ->where('id', '!=', $appointment->id)
              ->first();
              
          if ($check) {
              return response()->json(['success' => false, 'message' => 'This slot is already booked.'], 422);
          }
          
          $appointment->date_appointment = $request->post('date_appointment');
          $appointment->time_appointment = $request->post('time_appointment');
          $appointment->save();
          return response()->json(['success' => true]);
      }
      return response()->json(['success' => false, 'message' => 'Appointment not found.'], 404);
  }
}
