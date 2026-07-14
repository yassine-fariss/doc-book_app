<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DoctorManagementController extends Controller
{


  public function searchDoctors(Request $request)
  {
    try {
      $query = Doctor::query()->where('verified', 1);

      // 1. Text Search (Name, Specialty, City, Hospital) - explicitly case-insensitive & trimmed
      $searchQuery = $request->post('searchQuery');
      if (!empty($searchQuery)) {
        $trimmedSearch = strtolower(trim($searchQuery));
        $query->where(function ($q) use ($trimmedSearch) {
          $q->whereRaw('LOWER(firstname) LIKE ?', ["%$trimmedSearch%"])
            ->orWhereRaw('LOWER(lastname) LIKE ?', ["%$trimmedSearch%"])
            ->orWhereRaw('LOWER(specialite) LIKE ?', ["%$trimmedSearch%"])
            ->orWhereRaw('LOWER(address_cabinet) LIKE ?', ["%$trimmedSearch%"])
            ->orWhereRaw('LOWER(nom_cabinet) LIKE ?', ["%$trimmedSearch%"]);
        });
      }

      // 2. Exact Filters (Case-Insensitive & Trimmed)
      $specialite = $request->post('specialite');
      if (!empty($specialite) && $specialite !== 'All Specialties') {
        $query->whereRaw('LOWER(TRIM(specialite)) = ?', [strtolower(trim($specialite))]);
      }

      $city = $request->post('city');
      if (!empty($city) && $city !== 'All Cities') {
        $query->whereRaw('LOWER(TRIM(address_cabinet)) = ?', [strtolower(trim($city))]);
      }

      $hospital = $request->post('hospital');
      if (!empty($hospital) && $hospital !== 'All Hospitals') {
        $query->whereRaw('LOWER(TRIM(nom_cabinet)) = ?', [strtolower(trim($hospital))]);
      }

      $gender = $request->post('gender');
      if (!empty($gender) && $gender !== 'Any') {
        $query->whereRaw('LOWER(TRIM(gender)) = ?', [strtolower(trim($gender))]);
      }

      $availability = $request->post('availability');
      if ($availability === 'Available') {
        $query->where('available', 1);
      }

      // 3. Numeric Threshold Filters
      $experience = $request->post('experience');
      if (!empty($experience) && $experience !== 'Any') {
        $query->where('years_of_experience', '>=', (int) $experience);
      }

      $fee = $request->post('fee');
      if (!empty($fee) && $fee !== 'Any') {
        $query->where('consultation_fee', '<=', (int) $fee);
      }

      $rating = $request->post('rating');
      if (!empty($rating) && $rating !== 'Any') {
        $query->where('rating', '>=', (float) $rating);
      }

      // 4. JSON Array Filter (Languages) - DB Agnostic and robust
      $languages = $request->post('languages');
      if (!empty($languages) && is_array($languages)) {
        foreach ($languages as $lang) {
          $trimmedLang = trim($lang);
          if (!empty($trimmedLang)) {
            $query->where('languages', 'LIKE', '%"' . $trimmedLang . '"%');
          }
        }
      }

      // 5. Sorting
      $sortKey = $request->post('sortKey');
      if ($sortKey === 'FeeLowHigh') {
        $query->orderBy('consultation_fee', 'asc');
      } elseif ($sortKey === 'FeeHighLow') {
        $query->orderBy('consultation_fee', 'desc');
      } elseif ($sortKey === 'ExpHighLow') {
        $query->orderBy('years_of_experience', 'desc');
      } elseif ($sortKey === 'RatingHighLow') {
        $query->orderBy('rating', 'desc');
      } else {
        $query->orderBy('premium', 'desc')->orderBy('rating', 'desc'); // Default sorting
      }

      $doctors = $query->get();

      \Log::info('Search Payload:', $request->all());
      \Log::info('Doctors Found: ' . $doctors->count());

      if ($doctors->isNotEmpty()) {
        return response()->json([
          'DataSearch' => $doctors
        ], 200);
      } else {
        return response()->json([
          'message' => 'No doctors found'
        ], 404);
      }
    } catch (\Exception $e) {
      \Log::error("Doctors API Error: " . $e->getMessage());
      \Log::error($e->getTraceAsString());

      return response()->json([
        'success' => false,
        'message' => 'Doctors API Error: ' . $e->getMessage(),
        'stack' => $e->getTraceAsString()
      ], 500);
    }
  }



  public function getRandomPremiumDoctors()
  {
    $doctors = Doctor::inRandomOrder()
      ->where('premium', true)
      ->limit(4)
      ->get();


    return response()->json($doctors);
  }

  public function updateInfo(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'id' => 'required',
      'phoneNumber' => 'required',
      'email' => 'required|email',
    ]);

    $this->validateWith($validator, $request);

    $data = $validator->validated();

    if ($request->file('avatar_doctor')) {
      $image = $request->file('avatar_doctor');
      $path = $image->store('public/images/doctors');
      $imageName = basename($path);
      $doctor_img = Doctor::find($data['id']);
      $doctor_img->avatar_doctor = $imageName;
      $doctor_img->save();
    }

    $doctor = Doctor::find($data['id']);
    $doctor->firstname = $request->post('firstname');
    $doctor->lastname = $request->post('lastname');
    $doctor->cin = $request->post('cin');
    $doctor->phoneNumber = $request->post('phoneNumber');
    $doctor->email = $request->post('email');
    $doctor->Matricule = $request->post('Matricule');
    $doctor->specialite = $request->post('specialite');
    $doctor->nom_cabinet = $request->post('nom_cabinet');
    $doctor->address_cabinet = $request->post('address_cabinet');
    $doctor->available = $request->post('available');
    $doctor->about = $request->post('about');

    $doctor->save();


    return response([
      'updated' => 'success',
      'doctor' => $doctor
    ], 200);
  }


  public function UpdateInfoTimeWork(Request $request)
  {

    $doctor = Doctor::find($request->post('id'));
    $doctor->day_debut_work = $request->post('day_debut_work');
    $doctor->day_fin_work = $request->post('day_fin_work');
    $doctor->time_debut_work = $request->post('time_debut_work');
    $doctor->time_fin_work = $request->post('time_fin_work');
    $doctor->appointment_time = $request->post('appointment_time');

    $doctor->save();

    return response([
      'updated' => 'success',
      'doctor' => $doctor
    ], 200);
  }

  public function DoctoroInfo($id)
  {

    $doctor = Doctor::find($id);
    return response([
      $doctor
    ], 200);
  }

  public function GetTimeSpiceficDate(Request $request)
  {
      $idDoctor = $request->post("id");
      $dateAppointment = $request->post("dateApointment");

      $reservedTime = Appointment::where('doctor_id', $idDoctor)
        ->where('date_appointment', $dateAppointment)
        ->pluck('time_appointment');

      return response()->json($reservedTime);
  }
  public function show($id)
  {

    $doctor = Doctor::find($id);
    return response(
      $doctor
    );
  }

}
