<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
  public function create(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'user_id' => 'required',
      'doctor_id' => 'required',
      'rating' => 'required|integer|min:1|max:5',
      'comment' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $review = Review::create([
      'user_id' => $request->post('user_id'),
      'doctor_id' => $request->post('doctor_id'),
      'rating' => $request->post('rating'),
      'comment' => $request->post('comment'),
      'status' => 'pending', // reviews are pending by default for moderation
    ]);

    return response()->json(['success' => true, 'review' => $review], 201);
  }

  public function getDoctorReviews($doctorId)
  {
    $reviews = Review::with('user')
      ->where('doctor_id', $doctorId)
      ->where('status', 'approved')
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json($reviews);
  }

  public function getAllReviewsForDoctor($doctorId)
  {
    $reviews = Review::with('user')
      ->where('doctor_id', $doctorId)
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json($reviews);
  }

  public function reply(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'review_id' => 'required',
      'reply' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $review = Review::find($request->post('review_id'));
    if (!$review) {
      return response()->json(['success' => false, 'message' => 'Review not found'], 404);
    }

    $review->reply = $request->post('reply');
    $review->save();

    return response()->json(['success' => true, 'review' => $review]);
  }

  public function getAllReviewsAdmin()
  {
    $reviews = Review::with(['user', 'doctor'])
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json($reviews);
  }

  public function updateStatus(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'review_id' => 'required',
      'status' => 'required|in:approved,rejected,pending',
    ]);

    if ($validator->fails()) {
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $review = Review::find($request->post('review_id'));
    if (!$review) {
      return response()->json(['success' => false, 'message' => 'Review not found'], 404);
    }

    $review->status = $request->post('status');
    $review->save();

    return response()->json(['success' => true, 'review' => $review]);
  }

  public function delete($id)
  {
    $review = Review::find($id);
    if (!$review) {
      return response()->json(['success' => false, 'message' => 'Review not found'], 404);
    }

    $review->delete();
    return response()->json(['success' => true, 'message' => 'Review deleted successfully']);
  }

  public function getUserReviews($userId)
  {
    $reviews = Review::with('doctor')
      ->where('user_id', $userId)
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json($reviews);
  }
}
