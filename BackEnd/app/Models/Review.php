<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'doctor_id',
    'rating',
    'comment',
    'reply',
    'status'
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }
}
