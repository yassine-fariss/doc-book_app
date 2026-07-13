<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppointmentManagementController;
use App\Http\Controllers\Auth\Admin\AdminAuthController;
use App\Http\Controllers\Auth\Doctor\DoctorAuthController;
use App\Http\Controllers\Auth\User\UserAuthController;
use App\Http\Controllers\DoctorManagementController;
use App\Http\Controllers\UsersManagementController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(
  function () {

    // DOCTOR ROUTE

    Route::get('/doctor', [DoctorAuthController::class, 'doctor']);

    Route::post('/doctor/logout', [DoctorAuthController::class, 'logout']);

    Route::get('/doctor/{id}', [DoctorManagementController::class, 'DoctoroInfo']);

    Route::post('/doctor/update/info', [DoctorManagementController::class, 'updateInfo']);


    //USER ROUTE


    Route::get('/user', [UserAuthController::class, 'user']);

    Route::post('/user/logout', [UserAuthController::class, 'logout']);

    Route::put('/user/update', [UsersManagementController::class, 'update']);

    //ROUTE APPOINTMENT

    // ROUTE ADMIN

    Route::get('/admin', [AdminAuthController::class, 'admin']);
  }
);


//USER ROUTE


Route::post('/user/login', [UserAuthController::class, 'login']);

Route::post('/user/register', [UserAuthController::class, 'register']);

Route::delete('/user/delete', [UsersManagementController::class, 'delete']);


// DOCTOR ROUTE


Route::post('/doctor/login', [DoctorAuthController::class, 'login']);

Route::post('/doctor/register', [DoctorAuthController::class, 'register']);

Route::post('/doctor/update/info/time', [DoctorManagementController::class, 'UpdateInfoTimeWork']);

Route::post('/doctor/home', [DoctorManagementController::class, 'getRandomPremiumDoctors']);

Route::post('/search/doctors', [DoctorManagementController::class, 'SearchDoctors']);
Route::get('/doctor_view/{id}', [DoctorManagementController::class, 'show']);


//ROUTE APPOINTMENT


Route::post('/take/appointment', [AppointmentManagementController::class, 'TakeAppointment']);

Route::get('/doctor/appointmentoldday/{doctorId}', [AppointmentManagementController::class, 'GetAppointmentOldDate']);

Route::get('/doctor/appointmenttoday/{doctorId}', [AppointmentManagementController::class, 'GetAppointmentToday']);

Route::get('/doctor/newappointment/{doctorId}', [AppointmentManagementController::class, 'GetNewAppointment']);

Route::post("/appointment/reserved", [DoctorManagementController::class, 'GetTimeSpiceficDate']);
Route::get('/user/appointments/{userId}', [AppointmentManagementController::class, 'GetAppointmentUser']);
Route::post('/appointment/cancel/{id}', [AppointmentManagementController::class, 'CancelAppointment']);
Route::post('/appointment/reschedule', [AppointmentManagementController::class, 'RescheduleAppointment']);

// ROUTE ADMIN

Route::post("/admin/login", [AdminAuthController::class, 'login']);

Route::get('/admin/doctor', [AdminController::class, 'GetAllDocter']);

Route::get('/admin/patient', [AdminController::class, 'GetAllPatient']);

Route::post('/admin/verified', [AdminController::class, 'VerifiedDoctor']);

Route::post('/doctor/noverified', [AdminController::class, 'DoctorNoVerified']);

Route::get('/send', [AdminController::class, 'test']);

Route::get('/admin/appointments', [AdminController::class, 'GetAllAppointments']);
Route::post('/admin/doctor/suspend/{id}', [AdminController::class, 'SuspendDoctor']);
Route::delete('/admin/doctor/delete/{id}', [AdminController::class, 'DeleteDoctor']);
Route::get('/admin/stats', [AdminController::class, 'GetDashboardStats']);

// REVIEWS SYSTEM ROUTES
Route::post('/review/create', [ReviewController::class, 'create']);
Route::get('/user/reviews/{userId}', [ReviewController::class, 'getUserReviews']);
Route::get('/doctor/reviews/{doctorId}', [ReviewController::class, 'getDoctorReviews']);
Route::get('/doctor/reviews/all/{doctorId}', [ReviewController::class, 'getAllReviewsForDoctor']);
Route::post('/review/reply', [ReviewController::class, 'reply']);
Route::get('/admin/reviews', [ReviewController::class, 'getAllReviewsAdmin']);
Route::post('/admin/reviews/status', [ReviewController::class, 'updateStatus']);
Route::delete('/admin/reviews/{id}', [ReviewController::class, 'delete']);

Route::get('email/verify/{id}', [UserAuthController::class, 'verify'])->name('verification.verify');

Route::get('email/resend/{id}',  [UserAuthController::class, 'resend'])->name('verification.resend');


Route::get('doctors/email/verify/{id}', [DoctorAuthController::class, 'verify'])->name('doctor.verification.verify');

Route::get('doctors/email/resend/{id}',  [DoctorAuthController::class, 'resend'])->name('doctor.verification.resend');



